import https from 'https';

function testProject(name, supabaseUrl, supabaseKey) {
  return new Promise((resolve) => {
    const req = https.request(`${supabaseUrl}/rest/v1/products?select=*,category:categories(*),images:product_images(*),sizes:product_sizes(*)`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ name, supabaseUrl, status: res.statusCode, body }));
    });
    req.on('error', (err) => resolve({ name, supabaseUrl, status: 'ERROR', error: err.message }));
  });
}

async function checkBoth() {
  console.log('Testing Project 1: giqngsukscyghqkitijc...');
  const p1 = await testProject(
    'Project 1 (giqngsukscyghqkitijc)',
    'https://giqngsukscyghqkitijc.supabase.co',
    'sb_publishable_JHt31eRCBafVoRI-_LKswA_LZfAjyYr'
  );
  console.log(`P1 Status: ${p1.status}`);
  if (p1.status === 200) {
    try {
      const data = JSON.parse(p1.body);
      console.log(`P1 Success! Returned ${data.length} products.`);
      if (data.length > 0) {
        console.log('Sample P1 product:', JSON.stringify(data[0], null, 2));
      }
    } catch(e) {
      console.log('P1 body sample:', p1.body ? p1.body.substring(0, 300) : '');
    }
  } else {
    console.log('P1 info:', p1.error || (p1.body ? p1.body.substring(0, 300) : 'No body'));
  }

  console.log('\nTesting Project 2: dmpltyqedymhggdtexto...');
  const p2 = await testProject(
    'Project 2 (dmpltyqedymhggdtexto)',
    'https://dmpltyqedymhggdtexto.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcGx0eXFlZHltaGdnZHRleHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODEzNzYsImV4cCI6MjEwMjM1NzM3Nn0.GvioERQdSKhoJEPj3-6WiOqCqaXDTGVtgDkvsVjnulk'
  );
  console.log(`P2 Status: ${p2.status}`);
  if (p2.status === 200) {
    try {
      const data = JSON.parse(p2.body);
      console.log(`P2 Success! Returned ${data.length} products.`);
      if (data.length > 0) {
        console.log('Sample P2 product:', JSON.stringify(data[0], null, 2));
      }
    } catch(e) {
      console.log('P2 body sample:', p2.body.substring(0, 300));
    }
  } else {
    console.log('P2 body:', p2.body.substring(0, 300));
  }
}

checkBoth();
