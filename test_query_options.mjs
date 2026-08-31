import https from 'https';

const supabaseUrl = 'https://dmpltyqedymhggdtexto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcGx0eXFlZHltaGdnZHRleHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODEzNzYsImV4cCI6MjEwMjM1NzM3Nn0.GvioERQdSKhoJEPj3-6WiOqCqaXDTGVtgDkvsVjnulk';

function query(endpoint) {
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
      res.on('end', () => resolve({ endpoint, status: res.statusCode, body }));
    });
    req.on('error', (err) => resolve({ endpoint, status: 'ERROR', error: err.message }));
    req.end();
  });
}

async function runTests() {
  const endpoints = [
    'products?select=*',
    'products?select=*,images:product_images(*)',
    'products?select=*,images:product_images(*)&active=eq.true',
    'categories?select=*',
    'product_images?select=*',
    'product_sizes?select=*'
  ];

  for (const ep of endpoints) {
    const res = await query(ep);
    console.log(`Endpoint: "${ep}" -> HTTP ${res.status}`);
    if (res.status === 200) {
      const data = JSON.parse(res.body);
      console.log(`  Count: ${data.length}`);
      if (data.length > 0) {
        console.log(`  Sample 1st item:`, JSON.stringify(data[0]).substring(0, 200));
      }
    } else {
      console.log(`  Body: ${res.body}`);
    }
  }
}

runTests();
