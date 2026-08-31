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

async function testVariations() {
  const tests = [
    'products?select=id,name,slug,price,image_url,additional_image_urls,active',
    'products?active=eq.true',
    'categories?select=id,name,slug,image_url,active',
    'product_images?select=*',
    'product_sizes?select=*'
  ];

  for (const t of tests) {
    const res = await rawSupabaseGet(t);
    console.log(`Query '${t}': HTTP ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log(`  Data length: ${JSON.parse(res.body).length}`);
    } else {
      console.log(`  Error: ${res.body}`);
    }
  }
}

testVariations();
