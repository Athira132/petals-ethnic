const https = require('https');

https.get('https://ibb.co/wNZYbZY6', (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    const metaMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
    console.log('OG Image:', metaMatch ? metaMatch[1] : 'Not found');
    const srcMatch = html.match(/src="(https:\/\/i\.ibb\.co\/[^"]+)"/i);
    console.log('Src Match:', srcMatch ? srcMatch[1] : 'Not found');
  });
});
