import https from 'https';

const supabaseUrl = 'https://dmpltyqedymhggdtexto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcGx0eXFlZHltaGdnZHRleHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODEzNzYsImV4cCI6MjEwMjM1NzM3Nn0.GvioERQdSKhoJEPj3-6WiOqCqaXDTGVtgDkvsVjnulk';

function checkRpc(rpcName) {
  return new Promise((resolve) => {
    const data = JSON.stringify({});
    const req = https.request(`${supabaseUrl}/rest/v1/rpc/${rpcName}`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ rpcName, status: res.statusCode, body }));
    });
    req.on('error', (err) => resolve({ rpcName, status: 'ERROR', error: err.message }));
    req.write(data);
    req.end();
  });
}

async function testRpcs() {
  const candidates = [
    'deduct_order_stock',
    'is_admin',
    'handle_new_user',
    'exec_sql',
    'run_sql',
    'execute_sql'
  ];

  for (const r of candidates) {
    const res = await checkRpc(r);
    console.log(`RPC '${r}': Status ${res.status} | Body: ${res.body}`);
  }
}

testRpcs();
