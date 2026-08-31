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
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function checkUrlHttp(imageUrl) {
  return new Promise((resolve) => {
    if (!imageUrl) return resolve({ status: 'EMPTY', contentType: null, sizeBytes: 0 });
    try {
      const u = new URL(imageUrl);
      const req = https.request(u, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'image/*,*/*'
        }
      }, (res) => {
        resolve({
          status: res.statusCode,
          contentType: res.headers['content-type'],
          sizeBytes: res.headers['content-length'] ? parseInt(res.headers['content-length'], 10) : null
        });
        res.resume(); // consume response stream to free memory
      });
      req.on('error', (err) => resolve({ status: 'ERROR', error: err.message }));
      req.setTimeout(5000, () => {
        req.destroy();
        resolve({ status: 'TIMEOUT' });
      });
      req.end();
    } catch (e) {
      resolve({ status: 'INVALID_URL', error: e.message });
    }
  });
}

async function run() {
  console.log('Fetching Categories...');
  const categories = await supabaseGet('categories?select=*');
  console.log('Categories count:', Array.isArray(categories) ? categories.length : categories);
  if (Array.isArray(categories)) {
    for (const c of categories) {
      const res = await checkUrlHttp(c.image_url);
      console.log(`Cat [${c.name}]: ${c.image_url}`);
      console.log(`   -> Status: ${res.status} | Content-Type: ${res.contentType} | Size: ${res.sizeBytes} B`);
      if (c.image_url && c.image_url.includes('ibb.co/') && !c.image_url.includes('i.ibb.co/')) {
        console.warn(`   !!! WARNING: SHARE PAGE URL DETECTED: ${c.image_url}`);
      }
    }
  }

  console.log('\nFetching Products...');
  const products = await supabaseGet('products?select=*');
  console.log('Products count:', Array.isArray(products) ? products.length : products);
  if (Array.isArray(products)) {
    for (const p of products) {
      console.log(`\nProduct [${p.name}] (ID: ${p.id}):`);
      console.log(`  image_url: ${p.image_url}`);
      const res1 = await checkUrlHttp(p.image_url);
      console.log(`     -> Status: ${res1.status} | Content-Type: ${res1.contentType} | Size: ${res1.sizeBytes} B`);
      if (p.image_url && p.image_url.includes('ibb.co/') && !p.image_url.includes('i.ibb.co/')) {
        console.warn(`     !!! WARNING: SHARE PAGE URL DETECTED in image_url!`);
      }

      if (p.additional_image_urls) {
        console.log(`  additional_image_urls (${typeof p.additional_image_urls}):`, p.additional_image_urls);
        const addArr = Array.isArray(p.additional_image_urls) ? p.additional_image_urls : [p.additional_image_urls];
        for (const addUrl of addArr) {
          const res2 = await checkUrlHttp(addUrl);
          console.log(`     AddUrl: ${addUrl} -> Status: ${res2.status} | Content-Type: ${res2.contentType} | Size: ${res2.sizeBytes} B`);
          if (addUrl && addUrl.includes('ibb.co/') && !addUrl.includes('i.ibb.co/')) {
            console.warn(`     !!! WARNING: SHARE PAGE URL DETECTED in additional_image_urls!`);
          }
        }
      }
    }
  }

  console.log('\nFetching Product Images...');
  const prodImgs = await supabaseGet('product_images?select=*');
  console.log('Product Images count:', Array.isArray(prodImgs) ? prodImgs.length : prodImgs);
  if (Array.isArray(prodImgs)) {
    for (const pi of prodImgs) {
      const res = await checkUrlHttp(pi.image_url);
      console.log(`PImg [Product ${pi.product_id}]: ${pi.image_url} -> Status: ${res.status} | Content-Type: ${res.contentType}`);
      if (pi.image_url && pi.image_url.includes('ibb.co/') && !pi.image_url.includes('i.ibb.co/')) {
        console.warn(`   !!! WARNING: SHARE PAGE URL DETECTED: ${pi.image_url}`);
      }
    }
  }
}

run();
