import https from 'https';

const supabaseUrl = 'https://dmpltyqedymhggdtexto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcGx0eXFlZHltaGdnZHRleHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODEzNzYsImV4cCI6MjEwMjM1NzM3Nn0.GvioERQdSKhoJEPj3-6WiOqCqaXDTGVtgDkvsVjnulk';

function rawSupabaseGet(endpoint) {
  return new Promise((resolve) => {
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
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });
    req.on('error', (err) => resolve({ statusCode: 'ERROR', error: err.message }));
    req.end();
  });
}

async function verifyLiveSupabase() {
  console.log('==================================================');
  console.log('TESTING LIVE SUPABASE API AFTER RLS FIX');
  console.log('==================================================\n');

  console.log('1. Querying products with joined relationships...');
  const res1 = await rawSupabaseGet('products?select=*,category:categories(*),images:product_images(*),sizes:product_sizes(*)&order=created_at.desc');
  console.log('  HTTP Status:', res1.statusCode);

  if (res1.statusCode === 200) {
    const products = JSON.parse(res1.body);
    console.log(`  SUCCESS! Returned ${products.length} real products from Supabase.\n`);

    for (let i = 0; i < Math.min(products.length, 5); i++) {
      const p = products[i];
      console.log(`  PRODUCT #${i + 1}:`);
      console.log(`    ID: "${p.id}"`);
      console.log(`    Name: "${p.name}"`);
      console.log(`    Category: "${p.category ? p.category.name : 'None'}"`);
      console.log(`    Images count (from joined product_images): ${p.images ? p.images.length : 0}`);
      if (p.images && p.images.length > 0) {
        p.images.forEach((img, idx) => {
          console.log(`      Image[${idx}]: "${img.image_url}" (primary: ${img.is_primary}, order: ${img.display_order})`);
        });
      }
    }
  } else {
    console.error('  ERROR Body:', res1.body);
  }

  console.log('\n2. Querying categories...');
  const res2 = await rawSupabaseGet('categories?select=*&order=display_order.asc');
  console.log('  HTTP Status:', res2.statusCode);
  if (res2.statusCode === 200) {
    const cats = JSON.parse(res2.body);
    console.log(`  SUCCESS! Returned ${cats.length} real categories from Supabase.\n`);
  } else {
    console.error('  ERROR Body:', res2.body);
  }
}

verifyLiveSupabase();
