import https from 'https';
import { extractProductImages } from './src/app/core/utils/image.utils.ts';

function fetchProductsFromApi() {
  return new Promise((resolve) => {
    https.get('https://petals-ethnic.vercel.app/api/admin-product', (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ error: e.message, body });
        }
      });
    }).on('error', (err) => resolve({ error: err.message }));
  });
}

async function run() {
  console.log('Fetching live products from Vercel /api/admin-product...');
  const res = await fetchProductsFromApi();
  if (res.success && Array.isArray(res.products)) {
    console.log(`Success! Received ${res.products.length} products.\n`);
    res.products.forEach((p, idx) => {
      console.log(`Product #${idx + 1}: ID="${p.id}" NAME="${p.name}"`);
      console.log(`  Raw product.images:`, JSON.stringify(p.images));
      const extracted = extractProductImages(p);
      console.log(`  Extracted images count: ${extracted.length}`);
      extracted.forEach((img, i) => {
        console.log(`    Extracted[${i}]: "${img.image_url}" (primary: ${img.is_primary})`);
      });
      console.log('');
    });
  } else {
    console.error('Error fetching products:', res);
  }
}

run();
