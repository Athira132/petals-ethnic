import https from 'https';

function getApi(path) {
  return new Promise((resolve) => {
    const req = https.get(`https://petals-ethnic.vercel.app${path}`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ path, status: res.statusCode, body }));
    });
    req.on('error', (err) => resolve({ path, status: 'ERROR', error: err.message }));
  });
}

async function checkApis() {
  const paths = [
    '/api/admin-product',
    '/api/admin-category',
    '/api/admin-seed',
    '/api/admin-setup'
  ];

  for (const p of paths) {
    const res = await getApi(p);
    console.log(`Endpoint '${p}': Status ${res.status}`);
    console.log(`  Body: ${res.body.substring(0, 300)}\n`);
  }
}

checkApis();
