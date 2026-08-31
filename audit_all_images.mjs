import https from 'https';
import http from 'http';
import fs from 'fs';

const supabaseUrl = 'https://dmpltyqedymhggdtexto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcGx0eXFlZHltaGdnZHRleHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODEzNzYsImV4cCI6MjEwMjM1NzM3Nn0.GvioERQdSKhoJEPj3-6WiOqCqaXDTGVtgDkvsVjnulk';

function fetchUrl(targetUrl) {
  return new Promise((resolve) => {
    const client = targetUrl.startsWith('https') ? https : http;
    const req = client.request(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      let bodyLength = 0;
      res.on('data', chunk => bodyLength += chunk.length);
      res.on('end', () => {
        resolve({
          url: targetUrl,
          status: res.statusCode,
          contentType: res.headers['content-type'] || '',
          contentLength: res.headers['content-length'] || bodyLength
        });
      });
    });
    req.on('error', (err) => {
      resolve({
        url: targetUrl,
        status: 'ERROR',
        error: err.message
      });
    });
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ url: targetUrl, status: 'TIMEOUT' });
    });
    req.end();
  });
}

function supabaseGet(endpoint) {
  return new Promise((resolve, reject) => {
    const req = https.request(`${supabaseUrl}/rest/v1/${endpoint}`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (e) { resolve(body); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runFullAudit() {
  console.log('==================================================');
  console.log('PERFORMING COMPREHENSIVE IMAGE URL VERIFICATION');
  console.log('==================================================\n');

  const allUrlsToTest = new Set();

  // 1. Static URLs in codebase components
  const staticUrls = [
    // Logo
    'https://i.ibb.co/KjcmQcmy/Whats-App-Image-2026-08-13-at-10-59-05-AM.jpg',
    // Default Fallback
    'https://i.ibb.co/7tQbhHpZ/Whats-App-Image-2026-08-13-at-12-31-11-PM-2.jpg',
    // Hero Slides
    'https://i.ibb.co/G4bg5wKQ/379a42c6-1c91-404e-8fb6-d04a4689c4a2.png',
    'https://i.ibb.co/TD42QpNd/Chat-GPT-Image-Aug-13-2026-12-50-56-PM.png',
    'https://i.ibb.co/5ZcYbZx/Chat-GPT-Image-Aug-13-2026-12-15-54-PM.png',
    'https://i.ibb.co/0yhmLfnt/Chat-GPT-Image-Aug-13-2026-11-59-23-AM.png',
    // Editorial & About & Instagram
    'https://i.ibb.co/7d3T6dxp/Whats-App-Image-2026-08-13-at-12-31-11-PM-1.jpg',
    'https://i.ibb.co/7N2bJC2X/Whats-App-Image-2026-08-13-at-12-31-10-PM-1.jpg'
  ];

  for (const u of staticUrls) allUrlsToTest.add(u);

  // 2. Fetch Categories from DB
  console.log('Fetching Categories from Supabase DB...');
  const categories = await supabaseGet('categories?select=*');
  if (Array.isArray(categories)) {
    for (const c of categories) {
      if (c.image_url) allUrlsToTest.add(c.image_url.trim());
    }
  }

  // 3. Fetch Products from DB
  console.log('Fetching Products from Supabase DB...');
  const products = await supabaseGet('products?select=*');
  if (Array.isArray(products)) {
    for (const p of products) {
      if (p.image_url) allUrlsToTest.add(p.image_url.trim());
      if (p.additional_image_urls) {
        const lines = String(p.additional_image_urls).split(/[\r\n,]+/);
        for (const l of lines) {
          if (l.trim()) allUrlsToTest.add(l.trim());
        }
      }
    }
  }

  // 4. Fetch Product Images from DB
  console.log('Fetching Product Images from Supabase DB...');
  const prodImgs = await supabaseGet('product_images?select=*');
  if (Array.isArray(prodImgs)) {
    for (const pi of prodImgs) {
      if (pi.image_url) allUrlsToTest.add(pi.image_url.trim());
    }
  }

  console.log(`\nFound ${allUrlsToTest.size} unique image URLs to test over the network.\n`);

  let passCount = 0;
  let failCount = 0;
  const failures = [];

  for (const targetUrl of allUrlsToTest) {
    const res = await fetchUrl(targetUrl);
    const isImageContentType = res.contentType.startsWith('image/');
    const isSuccessStatus = res.status === 200;

    if (isSuccessStatus && isImageContentType) {
      console.log(`[PASS 200] ${res.contentType.padEnd(12)} (${res.contentLength} bytes) -> ${targetUrl}`);
      passCount++;
    } else {
      console.error(`[FAIL ${res.status}] ${res.contentType} -> ${targetUrl}`);
      failCount++;
      failures.push(res);
    }
  }

  console.log('\n==================================================');
  console.log(`AUDIT COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('==================================================\n');

  if (failures.length > 0) {
    console.error('FAILURES REPORT:');
    console.error(JSON.stringify(failures, null, 2));
  } else {
    console.log('ALL IMAGE URLS ARE VALID DIRECT IMAGES AND RETURN HTTP 200 OK!');
  }
}

runFullAudit();
