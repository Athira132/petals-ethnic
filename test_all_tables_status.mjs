import https from 'https';

const supabaseUrl = 'https://dmpltyqedymhggdtexto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcGx0eXFlZHltaGdnZHRleHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODEzNzYsImV4cCI6MjEwMjM1NzM3Nn0.GvioERQdSKhoJEPj3-6WiOqCqaXDTGVtgDkvsVjnulk';

function checkTable(t) {
  return new Promise((resolve) => {
    const req = https.request(`${supabaseUrl}/rest/v1/${t}?select=*`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ table: t, status: res.statusCode, body }));
    });
    req.on('error', (err) => resolve({ table: t, status: 'ERROR', error: err.message }));
    req.end();
  });
}

async function testAll() {
  const tables = ['products', 'categories', 'product_images', 'product_sizes', 'profiles', 'store_settings', 'coupons'];
  for (const t of tables) {
    const res = await checkTable(t);
    console.log(`Table '${t}': Status ${res.status} | ${res.body.substring(0, 150)}`);
  }
}

testAll();
