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

async function testColumns() {
  console.log('--- TEST A: products select specific existing columns ---');
  const r1 = await rawSupabaseGet('products?select=id,name,slug,price,sale_price,sku,stock,availability,featured,new_arrival,active,created_at');
  console.log('Status:', r1.statusCode);
  console.log('Body:', r1.body.substring(0, 500));

  console.log('\n--- TEST B: product_images select * ---');
  const r2 = await rawSupabaseGet('product_images?select=id,product_id,image_url,thumbnail_url,display_order,is_primary');
  console.log('Status:', r2.statusCode);
  console.log('Body:', r2.body.substring(0, 500));

  console.log('\n--- TEST C: categories select * ---');
  const r3 = await rawSupabaseGet('categories?select=id,name,slug,description,image_url,active,display_order');
  console.log('Status:', r3.statusCode);
  console.log('Body:', r3.body.substring(0, 500));
}

testColumns();
