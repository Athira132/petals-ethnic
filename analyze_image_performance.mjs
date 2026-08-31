import https from 'https';

const imagesToTest = [
  { name: 'Saree', url: 'https://i.ibb.co/7tQbhHpZ/Whats-App-Image-2026-08-13-at-12-31-11-PM-2.jpg' },
  { name: 'Straight Kurti', url: 'https://i.ibb.co/SDVwW6vy/Whats-App-Image-2026-08-13-at-12-31-11-PM.jpg' },
  { name: 'Kasavu Kurta', url: 'https://i.ibb.co/ksFkWrhx/image.png' },
  { name: 'Co-Ord Set', url: 'https://i.ibb.co/chvqjqFZ/image.png' },
  { name: 'Anarkali Set', url: 'https://i.ibb.co/27MzMz7X/image.png' },
  { name: 'A-Line Kurti', url: 'https://i.ibb.co/WLLgp05/image.png' },
  { name: 'Floral Kurti', url: 'https://i.ibb.co/xKv6CbTm/Whats-App-Image-2026-08-13-at-12-31-10-PM-2.jpg' },
  { name: 'A-Line Midi Dress', url: 'https://i.ibb.co/1fFmfKNH/Whats-App-Image-2026-08-13-at-12-31-10-PM-1.jpg' },
  { name: 'Hero Slide 1', url: 'https://i.ibb.co/G4bg5wKQ/379a42c6-1c91-404e-8fb6-d04a4689c4a2.png' },
  { name: 'Logo', url: 'https://i.ibb.co/KjcmQcmy/Whats-App-Image-2026-08-13-at-10-59-05-AM.jpg' }
];

function measureImage(item) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = https.get(item.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      let size = 0;
      res.on('data', chunk => size += chunk.length);
      res.on('end', () => {
        const duration = Date.now() - start;
        resolve({
          name: item.name,
          url: item.url,
          status: res.statusCode,
          contentType: res.headers['content-type'] || '',
          sizeBytes: size,
          sizeKB: (size / 1024).toFixed(2),
          durationMs: duration
        });
      });
    });
    req.on('error', err => resolve({ name: item.name, error: err.message }));
  });
}

async function runAudit() {
  console.log('==================================================');
  console.log('ANALYZING IMAGE NETWORK PERFORMANCE & FILE SIZES');
  console.log('==================================================\n');

  for (const item of imagesToTest) {
    const res = await measureImage(item);
    if (res.error) {
      console.log(`[ERROR] ${item.name}: ${res.error}`);
    } else {
      console.log(`${res.name.padEnd(20)} | Status: ${res.status} | Size: ${res.sizeKB.padStart(7)} KB | Time: ${res.durationMs.toString().padStart(4)} ms | Type: ${res.contentType}`);
    }
  }
}

runAudit();
