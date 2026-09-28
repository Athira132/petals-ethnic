import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://giqngsukscyghqkjtijc.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY environment variable.' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 1. Fetch categories to get valid category_id values
    const { data: existingCategories, error: catErr } = await supabase.from('categories').select('id, slug, name');
    if (catErr) {
      return res.status(500).json({ error: 'Failed to fetch categories: ' + catErr.message });
    }

    const catMap = {};
    (existingCategories || []).forEach(c => {
      catMap[c.slug] = c.id;
    });

    const productsToSeed = [
      {
        id: 'a1111111-1111-1111-1111-111111111111',
        name: 'Elegance Floral Printed A-Line Midi Dress',
        slug: 'elegance-floral-printed-aline-midi-dress',
        description: 'Stunning floral printed A-line midi dress tailored in lightweight, breathable fabric featuring a graceful drape.',
        category_slug: 'aline-midi-dress',
        price: 2499,
        sale_price: 1899,
        sku: 'PE-MD-001',
        stock: 40,
        availability: 'in_stock',
        featured: true,
        new_arrival: true,
        active: true,
        image: 'https://i.ibb.co/1fFmfKNH/Whats-App-Image-2026-08-13-at-12-31-10-PM-1.jpg'
      },
      {
        id: 'a2222222-2222-2222-2222-222222222222',
        name: 'Watercolor Botanical Floral Print A-Line Kurti',
        slug: 'watercolor-botanical-floral-print-aline-kurti',
        description: 'Vibrant watercolor botanical floral print kurti crafted for a charming ethnic flair.',
        category_slug: 'aline-kurti-floral-print',
        price: 1999,
        sale_price: 1499,
        sku: 'PE-AKF-002',
        stock: 48,
        availability: 'in_stock',
        featured: true,
        new_arrival: true,
        active: true,
        image: 'https://i.ibb.co/xKv6CbTm/Whats-App-Image-2026-08-13-at-12-31-10-PM-2.jpg'
      },
      {
        id: 'a3333333-3333-3333-3333-333333333333',
        name: 'Classic Cotton Slub A-Line Kurti',
        slug: 'classic-cotton-slub-aline-kurti',
        description: 'Soft cotton slub A-line kurti perfect for casual days and office elegance.',
        category_slug: 'aline-kurti',
        price: 1799,
        sale_price: 1299,
        sku: 'PE-AK-003',
        stock: 36,
        availability: 'in_stock',
        featured: false,
        new_arrival: true,
        active: true,
        image: 'https://i.ibb.co/WLLgp05/image.png'
      },
      {
        id: 'a4444444-4444-4444-4444-444444444444',
        name: 'Royal Festive Embroidered Anarkali Set',
        slug: 'royal-festive-embroidered-anarkali-set',
        description: 'Regal flare Anarkali set intricately embroidered for wedding functions and celebratory moments.',
        category_slug: 'anarkali',
        price: 3999,
        sale_price: 2999,
        sku: 'PE-AN-004',
        stock: 29,
        availability: 'in_stock',
        featured: true,
        new_arrival: false,
        active: true,
        image: 'https://i.ibb.co/27MzMz7X/image.png'
      },
      {
        id: 'a5555555-5555-5555-5555-555555555555',
        name: 'Contemporary Ethnic Co-Ord Set',
        slug: 'contemporary-ethnic-coord-set',
        description: 'Modern coordinated two-piece ethnic set blending high fashion with ultimate comfort.',
        category_slug: 'codeset',
        price: 2899,
        sale_price: 2199,
        sku: 'PE-CS-005',
        stock: 36,
        availability: 'in_stock',
        featured: true,
        new_arrival: true,
        active: true,
        image: 'https://i.ibb.co/chvqjqFZ/image.png'
      },
      {
        id: 'a6666666-6666-6666-6666-666666666666',
        name: 'Traditional Golden Kasavu Tissue Silk Kurta',
        slug: 'traditional-golden-kasavu-tissue-silk-kurta',
        description: 'Authentic Kerala golden zari Kasavu kurta woven in shimmering tissue silk.',
        category_slug: 'tissue-silk-kasavu-kurta',
        price: 3499,
        sale_price: 2699,
        sku: 'PE-TSK-006',
        stock: 37,
        availability: 'in_stock',
        featured: true,
        new_arrival: false,
        active: true,
        image: 'https://i.ibb.co/ksFkWrhx/image.png'
      },
      {
        id: 'a7777777-7777-7777-7777-777777777777',
        name: 'Everyday Soft Cotton Straight Fit Kurti',
        slug: 'everyday-soft-cotton-straight-fit-kurti',
        description: 'Breathable, relaxed straight fit kurti designed for day-long ease and style.',
        category_slug: 'normal-kurti',
        price: 1499,
        sale_price: 999,
        sku: 'PE-NK-007',
        stock: 55,
        availability: 'in_stock',
        featured: false,
        new_arrival: false,
        active: true,
        image: 'https://i.ibb.co/SDVwW6vy/Whats-App-Image-2026-08-13-at-12-31-11-PM.jpg'
      },
      {
        id: 'a8888888-8888-8888-8888-888888888888',
        name: 'Traditional Kanjeevaram Silk Festive Saree',
        slug: 'traditional-kanjeevaram-silk-festive-saree',
        description: 'Exquisite silk saree featuring intricate zari borders and a rich festive pallu.',
        category_slug: 'sarees',
        price: 4999,
        sale_price: 3799,
        sku: 'PE-SR-008',
        stock: 12,
        availability: 'in_stock',
        featured: true,
        new_arrival: true,
        active: true,
        image: 'https://i.ibb.co/7tQbhHpZ/Whats-App-Image-2026-08-13-at-12-31-11-PM-2.jpg'
      }
    ];

    const errors = [];
    const insertedProducts = [];

    for (const prod of productsToSeed) {
      const { image, category_slug, ...prodData } = prod;
      prodData.category_id = catMap[category_slug] || null;

      const { data: pRes, error: pErr } = await supabase
        .from('products')
        .upsert([prodData])
        .select();

      if (pErr) {
        console.error('Product upsert error:', prod.name, pErr);
        errors.push({ product: prod.name, error: pErr.message });
        continue;
      }

      if (pRes && pRes.length > 0) {
        insertedProducts.push(pRes[0].name);

        await supabase.from('product_images').upsert([{
          product_id: prod.id,
          image_url: image,
          is_primary: true,
          display_order: 1
        }]);

        const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        for (const sz of sizeOptions) {
          await supabase.from('product_sizes').upsert([{
            product_id: prod.id,
            size: sz,
            stock: Math.floor(prod.stock / 6),
            stock_quantity: Math.floor(prod.stock / 6),
            is_available: true,
            status: 'in_stock'
          }]);
        }
      }
    }

    return res.status(200).json({
      success: true,
      seededProductsCount: insertedProducts.length,
      products: insertedProducts,
      errors
    });

  } catch (err) {
    console.error('Seed API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
