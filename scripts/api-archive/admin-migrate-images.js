import { createClient } from '@supabase/supabase-js';

// REFERENCE BACKUP OF ORIGINAL IMGBB IMAGE URLS BY PRODUCT SLUG
const originalImgBbUrls = {
  'traditional-kanjeevaram-silk-festive-saree': 'https://i.ibb.co/7tQbhHpZ/Whats-App-Image-2026-08-13-at-12-31-11-PM-2.jpg',
  'everyday-soft-cotton-straight-fit-kurti': 'https://i.ibb.co/SDVwW6vy/Whats-App-Image-2026-08-13-at-12-31-11-PM.jpg',
  'traditional-golden-kasavu-tissue-silk-kurta': 'https://i.ibb.co/ksFkWrhx/image.png',
  'contemporary-ethnic-coord-set': 'https://i.ibb.co/chvqjqFZ/image.png',
  'royal-festive-embroidered-anarkali-set': 'https://i.ibb.co/27MzMz7X/image.png',
  'classic-cotton-slub-aline-kurti': 'https://i.ibb.co/WLLgp05/image.png',
  'watercolor-botanical-floral-print-aline-kurti': 'https://i.ibb.co/xKv6CbTm/Whats-App-Image-2026-08-13-at-12-31-10-PM-2.jpg',
  'elegance-floral-printed-aline-midi-dress': 'https://i.ibb.co/1fFmfKNH/Whats-App-Image-2026-08-13-at-12-31-10-PM-1.jpg'
};

const vercelUrlMappings = {
  'traditional-kanjeevaram-silk-festive-saree': '/images/products/silk-saree.jpg',
  'everyday-soft-cotton-straight-fit-kurti': '/images/products/straight-kurti.jpg',
  'traditional-golden-kasavu-tissue-silk-kurta': '/images/products/kasavu-kurta.png',
  'contemporary-ethnic-coord-set': '/images/products/coord-set.png',
  'royal-festive-embroidered-anarkali-set': '/images/products/anarkali-set.png',
  'classic-cotton-slub-aline-kurti': '/images/products/classic-cotton-kurti.png',
  'watercolor-botanical-floral-print-aline-kurti': '/images/products/aline-kurti-floral.jpg',
  'elegance-floral-printed-aline-midi-dress': '/images/products/midi-dress.jpg'
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dmpltyqedymhggdtexto.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY environment variable.' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const action = req.query.action || 'migrate'; // Support action=migrate or action=restore

  try {
    // 1. Fetch all products to match ID with slug
    const { data: products, error: prodErr } = await supabase.from('products').select('id, name, slug');
    if (prodErr) {
      return res.status(500).json({ error: 'Failed to fetch products: ' + prodErr.message });
    }

    // 2. Fetch all product images to update
    const { data: productImages, error: imgErr } = await supabase.from('product_images').select('id, product_id, image_url');
    if (imgErr) {
      return res.status(500).json({ error: 'Failed to fetch product images: ' + imgErr.message });
    }

    const prodMap = {};
    products.forEach(p => {
      prodMap[p.id] = p;
    });

    const updated = [];
    const skipped = [];
    const errors = [];

    // 3. Perform migration or rollback
    for (const img of productImages) {
      const p = prodMap[img.product_id];
      if (!p) {
        skipped.push({ image_id: img.id, reason: 'No product matches product_id' });
        continue;
      }

      let newUrl = null;
      if (action === 'migrate') {
        newUrl = vercelUrlMappings[p.slug];
      } else if (action === 'restore') {
        newUrl = originalImgBbUrls[p.slug];
      }

      if (!newUrl) {
        skipped.push({ image_id: img.id, slug: p.slug, reason: 'No mapping defined for product slug' });
        continue;
      }

      if (img.image_url === newUrl) {
        skipped.push({ image_id: img.id, slug: p.slug, reason: 'Already matches target URL' });
        continue;
      }

      // Update row in DB
      const { error: updErr } = await supabase
        .from('product_images')
        .update({ image_url: newUrl })
        .eq('id', img.id);

      if (updErr) {
        errors.push({ image_id: img.id, error: updErr.message });
      } else {
        updated.push({ image_id: img.id, slug: p.slug, from: img.image_url, to: newUrl });
      }
    }

    return res.status(200).json({
      success: true,
      action,
      updated_count: updated.length,
      skipped_count: skipped.length,
      errors_count: errors.length,
      updated_details: updated,
      skipped_details: skipped,
      errors_details: errors
    });

  } catch (err) {
    console.error('Migration API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
