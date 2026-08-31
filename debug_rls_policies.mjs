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

async function testAllTables() {
  const tables = ['categories', 'products', 'product_images', 'product_sizes', 'profiles', 'store_settings'];
  for (const t of tables) {
    const res = await rawSupabaseGet(`${t}?select=*`);
    console.log(`Table '${t}': HTTP ${res.statusCode}`);
    if (res.statusCode !== 200) {
      console.log(`  Error Body: ${res.body}`);
    } else {
      try {
        const parsed = JSON.parse(res.body);
        console.log(`  Records count: ${parsed.length}`);
      } catch (e) {
        console.log(`  Raw body length: ${res.body.length}`);
      }
    }
  }
}

testAllTables();
