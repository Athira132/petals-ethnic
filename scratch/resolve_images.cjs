const https = require('https');

const urls = [
  'https://ibb.co/202dnr48',
  'https://ibb.co/FFFgqX3',
  'https://ibb.co/Q3Gz1q6f',
  'https://ibb.co/GvMZMZvg',
  'https://ibb.co/KxGnJnqf',
  'https://ibb.co/6cD0Vysw'
];

function fetchUrl(url, retries = 2) {
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  };
  return new Promise((resolve, reject) => {
    https.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Handle redirect
        const redirectUrl = res.headers.location.startsWith('http') 
          ? res.headers.location 
          : new URL(res.headers.location, url).toString();
        return resolve(fetchUrl(redirectUrl, retries));
      }

      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const match = data.match(/<meta property="og:image" content="([^"]+)"/);
        if (match && match[1]) {
          resolve({ url, direct: match[1] });
        } else {
          // Fallback to checking any ibb.co direct images if in HTML
          const imgMatch = data.match(/src="https:\/\/i\.ibb\.co\/([^"]+)"/);
          if (imgMatch) {
            resolve({ url, direct: `https://i.ibb.co/${imgMatch[1]}` });
          } else {
            resolve({ url, direct: null, status: res.statusCode, htmlPreview: data.slice(0, 200) });
          }
        }
      });
    }).on('error', (err) => {
      if (retries > 0) {
        setTimeout(() => {
          resolve(fetchUrl(url, retries - 1));
        }, 1000);
      } else {
        reject(err);
      }
    });
  });
}

Promise.all(urls.map(u => fetchUrl(u))).then((results) => {
  console.log(JSON.stringify(results, null, 2));
}).catch(console.error);
