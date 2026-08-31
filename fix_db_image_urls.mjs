import https from 'https';

const url = 'https://giqngsukscyghqkjtijc.supabase.co';
const key = 'sb_publishable_JHt31eRCBafVoRI-_LKswA_LZfAjyYr';

function supabaseGet(endpoint) {
  return new Promise((resolve, reject) => {
    const req = https.request(`${url}/rest/v1/${endpoint}`, {
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
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

function convertIbbShareToDirect(imageUrl) {
  if (!imageUrl) return imageUrl;
  const str = String(imageUrl).trim();
  const match = str.match(/^https?:\/\/(www\.)?ibb\.co\/([a-zA-Z0-9]+)\/?$/i);
  if (match) {
    const code = match[2];
    return `https://i.ibb.co/${code}/image.jpg`;
  }
  return str;
}

async function audit() {
  console.log('=== CHECKING CATEGORIES FOR SHARE URLS ===');
  const categories = await supabaseGet('categories?select=*');
  let shareCount = 0;
  if (Array.isArray(categories)) {
    for (const c of categories) {
      if (c.image_url && c.image_url.includes('ibb.co/') && !c.image_url.includes('i.ibb.co/')) {
        console.log(`FOUND CATEGORY SHARE URL: [${c.name}] -> ${c.image_url}`);
        shareCount++;
      }
    }
  }

  console.log('\n=== CHECKING PRODUCTS FOR SHARE URLS ===');
  const products = await supabaseGet('products?select=*');
  if (Array.isArray(products)) {
    for (const p of products) {
      if (p.image_url && p.image_url.includes('ibb.co/') && !p.image_url.includes('i.ibb.co/')) {
        console.log(`FOUND PRODUCT MAIN SHARE URL: [${p.name}] -> ${p.image_url}`);
        shareCount++;
      }
      if (p.additional_image_urls) {
        const addArr = Array.isArray(p.additional_image_urls) ? p.additional_image_urls : [p.additional_image_urls];
        for (const u of addArr) {
          if (u && typeof u === 'string' && u.includes('ibb.co/') && !u.includes('i.ibb.co/')) {
            console.log(`FOUND PRODUCT ADD SHARE URL: [${p.name}] -> ${u}`);
            shareCount++;
          }
        }
      }
    }
  }

  console.log('\n=== CHECKING PRODUCT IMAGES FOR SHARE URLS ===');
  const prodImgs = await supabaseGet('product_images?select=*');
  if (Array.isArray(prodImgs)) {
    for (const pi of prodImgs) {
      if (pi.image_url && pi.image_url.includes('ibb.co/') && !pi.image_url.includes('i.ibb.co/')) {
        console.log(`FOUND PRODUCT_IMAGE SHARE URL: ID ${pi.id} -> ${pi.image_url}`);
        shareCount++;
      }
    }
  }

  console.log(`\nTOTAL SHARE URLS FOUND IN DB: ${shareCount}`);
}

audit();
