// Vercel Serverless Function to upload product images to ImgBB API securely
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
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

  const { image } = req.body || {};
  if (!image || typeof image !== 'string') {
    return res.status(400).json({ error: 'Bad Request: Missing image parameter (base64 string).' });
  }

  // Safely normalize & trim environment variable (remove quotes, trailing spaces, newlines)
  let apiKey = (process.env.IMGBB_API_KEY || '').trim().replace(/^["']|["']$/g, '');
  
  if (!apiKey) {
    return res.status(500).json({ error: 'Server Configuration Error: Missing IMGBB_API_KEY environment variable.' });
  }

  // Validate file size limit (Maximum 10MB approx 14MB base64 string length)
  if (image.length > 15 * 1024 * 1024) {
    return res.status(400).json({ error: 'Image is too large. Maximum allowed file size is 10MB.' });
  }

  // Validate allowed image mime types if data URI prefix is present
  if (image.startsWith('data:')) {
    const mimeMatch = image.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
    if (mimeMatch) {
      const mimeType = mimeMatch[1].toLowerCase();
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(mimeType)) {
        return res.status(400).json({ error: 'Unsupported image format. Allowed formats: JPG, PNG, WEBP.' });
      }
    }
  }

  try {
    // Strip data URI prefix if present (e.g. "data:image/png;base64,...")
    let cleanBase64 = image;
    if (cleanBase64.includes(';base64,')) {
      cleanBase64 = cleanBase64.split(';base64,')[1];
    }

    const bodyParams = new URLSearchParams();
    bodyParams.append('key', apiKey);
    bodyParams.append('image', cleanBase64);

    const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: bodyParams.toString()
    });

    const data = await imgbbRes.json();
    
    if (!imgbbRes.ok || !data.success) {
      if (data.error && data.error.message && data.error.message.includes('Invalid API v1 key')) {
        return res.status(400).json({
          error: 'ImgBB API Key Error: The server IMGBB_API_KEY configured in Vercel is invalid or expired. Please generate a free key from https://api.imgbb.com and set IMGBB_API_KEY in Vercel project settings.'
        });
      }
      return res.status(imgbbRes.status || 400).json({
        error: data.error?.message || 'ImgBB upload request failed.'
      });
    }

    // Return the direct ImgBB image URL
    return res.status(200).json({
      success: true,
      url: data.data.url,
      display_url: data.data.display_url,
      thumbnail_url: data.data.thumb?.url || data.data.url
    });

  } catch (err) {
    console.error('Serverless ImgBB upload error:', err.message);
    return res.status(500).json({ error: 'Internal Server Error: Failed to upload image.' });
  }
}
