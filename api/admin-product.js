import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dmpltyqedymhggdtexto.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcGx0eXFlZHltaGdnZHRleHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODEzNzYsImV4cCI6MjEwMjM1NzM3Nn0.GvioERQdSKhoJEPj3-6WiOqCqaXDTGVtgDkvsVjnulk';

  const keyToUse = serviceRoleKey || publishableKey;
  const supabase = createClient(supabaseUrl, keyToUse);

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          sizes:product_sizes(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true, products: data || [] });
    }

    if (req.method === 'POST') {
      const { productPayload, images, sizes } = req.body;

      if (!productPayload || !productPayload.name || !productPayload.price) {
        return res.status(400).json({ error: 'Product Name and Price are required.' });
      }

      const { data: insertedProduct, error: prodErr } = await supabase
        .from('products')
        .insert([productPayload])
        .select()
        .single();

      if (prodErr) {
        return res.status(500).json({ error: prodErr.message });
      }

      const productId = insertedProduct.id;

      if (images && images.length > 0) {
        const imagePayloads = images.map((imgUrl, idx) => ({
          product_id: productId,
          image_url: imgUrl.trim(),
          is_primary: idx === 0,
          display_order: idx + 1
        }));
        await supabase.from('product_images').insert(imagePayloads);
      }

      if (sizes && sizes.length > 0) {
        const sizePayloads = sizes.map(sz => ({
          product_id: productId,
          size: sz.size,
          stock: Number(sz.stock) || 0,
          stock_quantity: Number(sz.stock) || 0,
          is_available: (Number(sz.stock) || 0) > 0,
          status: (Number(sz.stock) || 0) > 0 ? 'in_stock' : 'sold_out'
        }));
        await supabase.from('product_sizes').insert(sizePayloads);
      }

      return res.status(200).json({ success: true, product: insertedProduct });
    }

    if (req.method === 'PUT') {
      const { id, productPayload, images, sizes } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Product ID is required for update.' });
      }

      const { data: updatedProduct, error: updErr } = await supabase
        .from('products')
        .update(productPayload)
        .eq('id', id)
        .select()
        .single();

      if (updErr) {
        return res.status(500).json({ error: updErr.message });
      }

      if (images !== undefined) {
        await supabase.from('product_images').delete().eq('product_id', id);
        if (images.length > 0) {
          const imagePayloads = images.map((imgUrl, idx) => ({
            product_id: id,
            image_url: imgUrl.trim(),
            is_primary: idx === 0,
            display_order: idx + 1
          }));
          await supabase.from('product_images').insert(imagePayloads);
        }
      }

      if (sizes !== undefined) {
        await supabase.from('product_sizes').delete().eq('product_id', id);
        if (sizes.length > 0) {
          const sizePayloads = sizes.map(sz => ({
            product_id: id,
            size: sz.size,
            stock: Number(sz.stock) || 0,
            stock_quantity: Number(sz.stock) || 0,
            is_available: (Number(sz.stock) || 0) > 0,
            status: (Number(sz.stock) || 0) > 0 ? 'in_stock' : 'sold_out'
          }));
          await supabase.from('product_sizes').insert(sizePayloads);
        }
      }

      return res.status(200).json({ success: true, product: updatedProduct });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Product ID is required for deletion.' });
      }

      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });

  } catch (err) {
    console.error('Admin Product API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
