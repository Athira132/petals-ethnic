import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const url = 'https://giqngsukscyghqkjtijc.supabase.co';
const key = 'sb_publishable_JHt31eRCBafVoRI-_LKswA_LZfAjyYr';

const supabase = createClient(url, key);

async function testUrl(imageUrl) {
  if (!imageUrl) return { status: 'EMPTY', contentType: null };
  try {
    const res = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });
    const contentType = res.headers.get('content-type');
    const contentLength = res.headers.get('content-length');
    return {
      status: res.status,
      contentType,
      sizeBytes: contentLength ? parseInt(contentLength, 10) : null,
      ok: res.ok
    };
  } catch (err) {
    return { status: 'FETCH_FAILED', error: err.message };
  }
}

async function auditDatabase() {
  console.log('================ DATABASE IMAGE AUDIT ================');
  
  // 1. Categories
  const { data: categories, error: catErr } = await supabase.from('categories').select('*');
  console.log('\n--- CATEGORIES ---');
  if (catErr) console.error('Cat err:', catErr.message);
  else {
    for (const cat of categories) {
      const info = await testUrl(cat.image_url);
      console.log(`Cat: [${cat.name}] | URL: ${cat.image_url}`);
      console.log(`  -> Status: ${info.status} | Content-Type: ${info.contentType} | Size: ${info.sizeBytes} bytes`);
      if (cat.image_url && cat.image_url.includes('ibb.co/') && !cat.image_url.includes('i.ibb.co/')) {
        console.warn(`  CRITICAL WARNING: Share page URL detected! ${cat.image_url}`);
      }
    }
  }

  // 2. Products
  const { data: products, error: prodErr } = await supabase.from('products').select('*');
  console.log('\n--- PRODUCTS ---');
  if (prodErr) console.error('Prod err:', prodErr.message);
  else {
    for (const p of products) {
      console.log(`Product: [${p.name}]`);
      if (p.image_url) {
        const info = await testUrl(p.image_url);
        console.log(`  Main Image: ${p.image_url} -> Status: ${info.status} | Content-Type: ${info.contentType} | Size: ${info.sizeBytes} bytes`);
        if (p.image_url.includes('ibb.co/') && !p.image_url.includes('i.ibb.co/')) {
          console.warn(`  CRITICAL WARNING: Main image is Share Page URL! ${p.image_url}`);
        }
      } else {
        console.log('  Main Image: NONE');
      }

      if (p.additional_image_urls && p.additional_image_urls.length > 0) {
        for (const addUrl of p.additional_image_urls) {
          const info = await testUrl(addUrl);
          console.log(`  Additional: ${addUrl} -> Status: ${info.status} | Content-Type: ${info.contentType} | Size: ${info.sizeBytes} bytes`);
          if (addUrl.includes('ibb.co/') && !addUrl.includes('i.ibb.co/')) {
            console.warn(`  CRITICAL WARNING: Additional image is Share Page URL! ${addUrl}`);
          }
        }
      }
    }
  }

  // 3. Product Images table
  const { data: prodImgs, error: pimgErr } = await supabase.from('product_images').select('*');
  console.log('\n--- PRODUCT_IMAGES TABLE ---');
  if (pimgErr) console.error('Pimg err:', pimgErr.message);
  else {
    console.log(`Total records: ${prodImgs.length}`);
    for (const pi of prodImgs) {
      const info = await testUrl(pi.image_url);
      console.log(`  PImg ID: ${pi.id} | Product: ${pi.product_id} | URL: ${pi.image_url}`);
      console.log(`    -> Status: ${info.status} | Content-Type: ${info.contentType} | Size: ${info.sizeBytes} bytes`);
      if (pi.image_url.includes('ibb.co/') && !pi.image_url.includes('i.ibb.co/')) {
        console.warn(`    CRITICAL WARNING: Share page URL detected! ${pi.image_url}`);
      }
    }
  }
}

function auditCodebase(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      auditCodebase(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const ibbMatches = content.match(/https?:\/\/(www\.)?ibb\.co\/[^\s"'`<>]+/g);
      if (ibbMatches) {
        console.warn(`Found ibb.co share URL in code file ${fullPath}:`, ibbMatches);
      }
    }
  }
}

async function main() {
  await auditDatabase();
  console.log('\n================ CODEBASE AUDIT ================');
  auditCodebase(path.join(process.cwd(), 'src'));
}

main();
