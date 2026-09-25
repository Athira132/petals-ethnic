import { createClient } from '@supabase/supabase-js';

const EXTENDED_COLUMNS = [
  'department',
  'has_size',
  'show_size_chart',
  'size_chart_url',
  'purchase_mode',
  'video_url',
  'has_colors',
  'color_variants',
  'stock_display',
  'custom_stock_message',
  'return_policy',
  'best_seller'
];

function extractProductMeta(product) {
  let meta = {};
  let cleanDesc = product.description || '';

  const metaMatch = cleanDesc.match(/<!--PRODUCT_META:([\s\S]*?)-->/);
  if (metaMatch) {
    try {
      meta = JSON.parse(metaMatch[1]);
      cleanDesc = cleanDesc.replace(/<!--PRODUCT_META:[\s\S]*?-->/g, '').trim();
    } catch (e) {
      console.warn('Failed to parse product metadata JSON:', e);
    }
  }

  // Derive department from category or metadata
  const dept = product.department || meta.department || (
    product.category?.department ? product.category.department : (
      product.category?.slug && ['necklace', 'necklaces', 'earring', 'earrings', 'bangle', 'bangles', 'ring', 'rings', 'bracelet', 'bracelets', 'chain', 'chains', 'jewellery', 'jewelry'].some(k => product.category.slug.toLowerCase().includes(k)) ? 'jewellery' : 'ethnic'
    )
  );

  const hasSize = product.has_size !== undefined 
    ? Boolean(product.has_size) 
    : (meta.has_size !== undefined ? Boolean(meta.has_size) : (dept !== 'jewellery'));

  return {
    ...product,
    description: cleanDesc || null,
    department: dept,
    has_size: hasSize,
    show_size_chart: product.show_size_chart !== undefined ? Boolean(product.show_size_chart) : Boolean(meta.show_size_chart),
    size_chart_url: product.size_chart_url || meta.size_chart_url || null,
    purchase_mode: product.purchase_mode || meta.purchase_mode || 'online',
    video_url: product.video_url || meta.video_url || null,
    has_colors: product.has_colors !== undefined ? Boolean(product.has_colors) : Boolean(meta.has_colors),
    color_variants: product.color_variants || meta.color_variants || [],
    stock_display: product.stock_display || meta.stock_display || 'normal',
    custom_stock_message: product.custom_stock_message || meta.custom_stock_message || null,
    return_policy: product.return_policy || meta.return_policy || null
  };
}

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

      const formatted = (data || []).map(p => extractProductMeta(p));
      return res.status(200).json({ success: true, products: formatted });
    }

    if (req.method === 'POST') {
      const { productPayload, images, sizes } = req.body;

      if (!productPayload || !productPayload.name || !productPayload.price) {
        return res.status(400).json({ error: 'Product Name and Price are required.' });
      }

      // Prepare metadata bundle for resilient cross-database storage
      const meta = {
        department: productPayload.department || 'ethnic',
        has_size: productPayload.has_size !== undefined ? Boolean(productPayload.has_size) : true,
        show_size_chart: Boolean(productPayload.show_size_chart),
        size_chart_url: productPayload.size_chart_url || null,
        purchase_mode: productPayload.purchase_mode || 'online',
        video_url: productPayload.video_url || null,
        has_colors: Boolean(productPayload.has_colors),
        color_variants: productPayload.color_variants || [],
        stock_display: productPayload.stock_display || 'normal',
        custom_stock_message: productPayload.custom_stock_message || null,
        return_policy: productPayload.return_policy || null
      };

      let baseDesc = (productPayload.description || '').replace(/<!--PRODUCT_META:[\s\S]*?-->/g, '').trim();
      const descWithMeta = baseDesc ? `${baseDesc}\n<!--PRODUCT_META:${JSON.stringify(meta)}-->` : `<!--PRODUCT_META:${JSON.stringify(meta)}-->`;

      let payload = {
        ...productPayload,
        description: descWithMeta,
        ...meta
      };

      delete payload.image_url;
      delete payload.additional_image_urls;

      let inserted = null;
      let prodErr = null;

      // Try inserting with all fields
      const res1 = await supabase.from('products').insert([payload]).select().single();
      inserted = res1.data;
      prodErr = res1.error;

      // If missing column error, sanitize extended columns and retry
      if (prodErr && prodErr.message) {
        console.warn('Postgres insert notice for extended columns, retrying sanitized:', prodErr.message);
        EXTENDED_COLUMNS.forEach(col => delete payload[col]);
        const resRetry = await supabase.from('products').insert([payload]).select().single();
        inserted = resRetry.data;
        prodErr = resRetry.error;
      }

      if (prodErr || !inserted) {
        return res.status(500).json({ error: prodErr ? prodErr.message : 'Failed to insert product.' });
      }

      const productId = inserted.id;

      // Insert primary and additional images
      let formattedImages = [];
      if (images && images.length > 0) {
        formattedImages = images.map((imgUrl, idx) => ({
          product_id: productId,
          image_url: imgUrl.trim(),
          is_primary: idx === 0,
          display_order: idx + 1
        }));
        await supabase.from('product_images').insert(formattedImages);
      }

      // Insert sizes if sizes are enabled
      if (meta.has_size && sizes && sizes.length > 0) {
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

      const completeProduct = extractProductMeta({
        ...inserted,
        images: formattedImages,
        sizes: meta.has_size ? sizes : []
      });

      return res.status(200).json({ success: true, product: completeProduct });
    }

    if (req.method === 'PUT') {
      const { id, productPayload, images, sizes } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Product ID is required for update.' });
      }

      const meta = {
        department: productPayload.department,
        has_size: productPayload.has_size !== undefined ? Boolean(productPayload.has_size) : undefined,
        show_size_chart: productPayload.show_size_chart !== undefined ? Boolean(productPayload.show_size_chart) : undefined,
        size_chart_url: productPayload.size_chart_url !== undefined ? productPayload.size_chart_url : undefined,
        purchase_mode: productPayload.purchase_mode !== undefined ? productPayload.purchase_mode : undefined,
        video_url: productPayload.video_url !== undefined ? productPayload.video_url : undefined,
        has_colors: productPayload.has_colors !== undefined ? Boolean(productPayload.has_colors) : undefined,
        color_variants: productPayload.color_variants !== undefined ? productPayload.color_variants : undefined,
        stock_display: productPayload.stock_display !== undefined ? productPayload.stock_display : undefined,
        custom_stock_message: productPayload.custom_stock_message !== undefined ? productPayload.custom_stock_message : undefined,
        return_policy: productPayload.return_policy !== undefined ? productPayload.return_policy : undefined
      };

      // Filter defined meta keys
      const cleanMeta = {};
      Object.keys(meta).forEach(k => {
        if (meta[k] !== undefined) cleanMeta[k] = meta[k];
      });

      let baseDesc = (productPayload.description || '').replace(/<!--PRODUCT_META:[\s\S]*?-->/g, '').trim();
      const descWithMeta = baseDesc ? `${baseDesc}\n<!--PRODUCT_META:${JSON.stringify(cleanMeta)}-->` : `<!--PRODUCT_META:${JSON.stringify(cleanMeta)}-->`;

      let payload = {
        ...productPayload,
        description: descWithMeta,
        ...cleanMeta
      };

      delete payload.image_url;
      delete payload.additional_image_urls;

      let updated = null;
      let updErr = null;

      const res1 = await supabase.from('products').update(payload).eq('id', id).select().single();
      updated = res1.data;
      updErr = res1.error;

      if (updErr && updErr.message) {
        console.warn('Postgres update notice for extended columns, retrying sanitized:', updErr.message);
        EXTENDED_COLUMNS.forEach(col => delete payload[col]);
        const resRetry = await supabase.from('products').update(payload).eq('id', id).select().single();
        updated = resRetry.data;
        updErr = resRetry.error;
      }

      if (updErr || !updated) {
        return res.status(500).json({ error: updErr ? updErr.message : 'Failed to update product.' });
      }

      let formattedImages = [];
      if (images !== undefined) {
        await supabase.from('product_images').delete().eq('product_id', id);
        if (images.length > 0) {
          formattedImages = images.map((imgUrl, idx) => ({
            product_id: id,
            image_url: imgUrl.trim(),
            is_primary: idx === 0,
            display_order: idx + 1
          }));
          await supabase.from('product_images').insert(formattedImages);
        }
      }

      if (sizes !== undefined) {
        await supabase.from('product_sizes').delete().eq('product_id', id);
        if (cleanMeta.has_size !== false && sizes.length > 0) {
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

      const completeProduct = extractProductMeta({
        ...updated,
        images: images !== undefined ? formattedImages : updated.images,
        sizes: sizes !== undefined ? sizes : updated.sizes
      });

      return res.status(200).json({ success: true, product: completeProduct });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Product ID is required for deletion.' });
      }

      await supabase.from('product_images').delete().eq('product_id', id);
      await supabase.from('product_sizes').delete().eq('product_id', id);
      await supabase.from('cart_items').delete().eq('product_id', id);
      await supabase.from('wishlist_items').delete().eq('product_id', id);

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
