import crypto from 'crypto';
import https from 'https';

const supabaseUrl = 'https://dmpltyqedymhggdtexto.supabase.co';
const anonToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcGx0eXFlZHltaGdnZHRleHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODEzNzYsImV4cCI6MjEwMjM1NzM3Nn0.GvioERQdSKhoJEPj3-6WiOqCqaXDTGVtgDkvsVjnulk';

function base64UrlEncode(str) {
  return Buffer.from(str).toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function createJwt(payloadObj, secretStr) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(JSON.stringify(payloadObj));
  const signature = crypto
    .createHmac('sha256', secretStr)
    .update(`${header}.${payload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${header}.${payload}.${signature}`;
}

function testQueryWithToken(token) {
  return new Promise((resolve) => {
    const req = https.request(`${supabaseUrl}/rest/v1/products?select=*`, {
      method: 'GET',
      headers: {
        'apikey': anonToken,
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', (err) => resolve({ status: 'ERROR', error: err.message }));
    req.end();
  });
}

async function testCandidateSecrets() {
  console.log('Testing candidates...');
  // Standard Supabase default JWT secrets or project secrets
  const candidates = [
    'super-secret-jwt-token-with-at-least-32-characters-long',
    'Dhanya@2026',
    'PetalsEthnicAdmin2026!',
    'dmpltyqedymhggdtexto',
    'sb_publishable_JHt31eRCBafVoRI-_LKswA_LZfAjyYr'
  ];

  const payload = {
    iss: 'supabase',
    ref: 'dmpltyqedymhggdtexto',
    role: 'service_role',
    iat: 1786781376,
    exp: 2102357376
  };

  for (const secret of candidates) {
    const token = createJwt(payload, secret);
    const res = await testQueryWithToken(token);
    console.log(`Secret "${secret}": HTTP ${res.status} | Body: ${res.body.substring(0, 150)}`);
  }
}

testCandidateSecrets();
