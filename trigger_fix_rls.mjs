import https from 'https';

function callApi(urlStr) {
  return new Promise((resolve) => {
    const req = https.get(urlStr, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', (err) => resolve({ status: 'ERROR', error: err.message }));
  });
}

async function run() {
  console.log('Calling /api/admin-fix-rls on live Vercel production...');
  const res = await callApi('https://petals-ethnic.vercel.app/api/admin-fix-rls');
  console.log('Status:', res.status);
  console.log('Body:', res.body);
}

run();
