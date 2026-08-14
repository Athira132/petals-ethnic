const https = require('https');

const urls = [
  'https://i.ibb.co/nTMWnkp/Gemini-Generated-Image-39gh9039gh9039gh.png',
  'https://i.ibb.co/5WCD8XX8/Chat-GPT-Image-Aug-13-2026-01-28-00-PM.png',
  'https://i.ibb.co/Xr8k8s2H/Chat-GPT-Image-Aug-13-2026-12-50-56-PM.png',
  'https://i.ibb.co/tTz1RQFy/Chat-GPT-Image-Aug-13-2026-12-06-28-PM.png',
  'https://i.ibb.co/KcPY5WLJ/Chat-GPT-Image-Aug-13-2026-11-59-23-AM.png',
  'https://i.ibb.co/jCTdCQW/379a42c6-1c91-404e-8fb6-d04a4689c4a2.png'
];

urls.forEach((url, index) => {
  https.get(url, (res) => {
    let chunks = [];
    res.on('data', (chunk) => {
      chunks.push(chunk);
      let buffer = Buffer.concat(chunks);
      if (buffer.length >= 24) {
        // PNG IHDR width at 16-19, height at 20-23
        const w = buffer.readUInt32BE(16);
        const h = buffer.readUInt32BE(20);
        console.log(`Image ${index + 1}: ${w} x ${h} (Aspect Ratio: ${(w/h).toFixed(4)})`);
        res.destroy();
      }
    });
  }).on('error', (e) => {
    console.error(e);
  });
});
