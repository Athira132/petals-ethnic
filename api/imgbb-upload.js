// Vercel Serverless Function to upload images to ImgBB API securely
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'Bad Request: Missing image parameter (base64 string).' });
  }

  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server Configuration Error: Missing IMGBB_API_KEY environment variable.' });
  }

  try {
    // Send base64 payload as form URL-encoded body to ImgBB
    const bodyParams = new URLSearchParams();
    bodyParams.append('image', image);

    const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: bodyParams.toString()
    });

    const data = await imgbbRes.json();
    
    if (!imgbbRes.ok || !data.success) {
      return res.status(imgbbRes.status || 400).json({
        error: data.error?.message || 'ImgBB upload request failed.'
      });
    }

    // Return the secure image links
    return res.status(200).json({
      url: data.data.url,
      display_url: data.data.display_url,
      thumbnail_url: data.data.thumb?.url || data.data.url
    });

  } catch (err) {
    console.error('Serverless upload error:', err.message);
    return res.status(500).json({ error: 'Internal Server Error: Failed to upload image.' });
  }
}
