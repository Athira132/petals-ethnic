import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dmpltyqedymhggdtexto.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcGx0eXFlZHltaGdnZHRleHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODEzNzYsImV4cCI6MjEwMjM1NzM3Nn0.GvioERQdSKhoJEPj3-6WiOqCqaXDTGVtgDkvsVjnulk';

  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Missing Bearer token.' });
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Token is empty.' });
  }

  // 1. Verify token with Supabase Auth
  let tokenUser = null;
  try {
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${token}`
      }
    });

    if (!userRes.ok) {
      return res.status(401).json({ error: 'Invalid or expired session token.' });
    }
    tokenUser = await userRes.json();
  } catch (err) {
    return res.status(401).json({ error: 'Authentication verification failed.' });
  }

  if (!tokenUser || !tokenUser.id) {
    return res.status(401).json({ error: 'User session not found.' });
  }

  // 2. Strict User Isolation Verification
  const targetUserId = req.query?.userId || req.body?.userId;
  if (!targetUserId || targetUserId !== tokenUser.id) {
    return res.status(403).json({ error: 'Forbidden: Cannot access or modify wishlist data of another user.' });
  }

  const adminClient = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  const dbClient = adminClient || userClient;

  try {
    if (req.method === 'GET') {
      // Query database table public.wishlist
      const { data: rows, error: wErr } = await dbClient
        .from('wishlist')
        .select('product_id')
        .eq('user_id', targetUserId);

      if (wErr) {
        console.warn('Wishlist select warning:', wErr.message);
      }

      let productIds = (rows || []).map(r => r.product_id).filter(Boolean);
      if (productIds.length === 0 && Array.isArray(tokenUser.user_metadata?.wishlist_ids)) {
        productIds = tokenUser.user_metadata.wishlist_ids;
      }

      if (productIds.length === 0) {
        return res.status(200).json({ success: true, userId: targetUserId, items: [], ids: [] });
      }

      // Query products by IDs
      const { data: products, error: pErr } = await dbClient
        .from('products')
        .select(`
          id, name, slug, description, category_id,
          price, sale_price, sku, stock, active,
          featured, new_arrival, best_seller,
          images:product_images(id, image_url, is_primary, display_order),
          category:categories(id, name, slug)
        `)
        .in('id', productIds);

      if (pErr) {
        console.warn('Products fetch note for wishlist:', pErr.message);
        return res.status(200).json({ success: true, userId: targetUserId, items: [], ids: productIds });
      }

      return res.status(200).json({
        success: true,
        userId: targetUserId,
        items: products || [],
        ids: productIds
      });
    }

    if (req.method === 'POST') {
      const { productId, action } = req.body || {};
      if (!productId) {
        return res.status(400).json({ error: 'Missing productId.' });
      }

      if (action === 'remove') {
        await dbClient
          .from('wishlist')
          .delete()
          .eq('user_id', targetUserId)
          .eq('product_id', productId);
      } else {
        await dbClient
          .from('wishlist')
          .upsert({ user_id: targetUserId, product_id: productId }, { onConflict: 'user_id,product_id' });
      }

      // Sync metadata
      const { data: currentRows } = await dbClient
        .from('wishlist')
        .select('product_id')
        .eq('user_id', targetUserId);

      const updatedIds = (currentRows || []).map(r => r.product_id);

      await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: { ...tokenUser.user_metadata, wishlist_ids: updatedIds }
        })
      });

      if (adminClient) {
        await adminClient.auth.admin.updateUserById(targetUserId, {
          user_metadata: { ...tokenUser.user_metadata, wishlist_ids: updatedIds }
        });
      }

      return res.status(200).json({
        success: true,
        userId: targetUserId,
        wishlistIds: updatedIds
      });
    }

    if (req.method === 'DELETE') {
      await dbClient
        .from('wishlist')
        .delete()
        .eq('user_id', targetUserId);

      await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: { ...tokenUser.user_metadata, wishlist_ids: [] }
        })
      });

      if (adminClient) {
        await adminClient.auth.admin.updateUserById(targetUserId, {
          user_metadata: { ...tokenUser.user_metadata, wishlist_ids: [] }
        });
      }

      return res.status(200).json({ success: true, userId: targetUserId, items: [], ids: [] });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('Wishlist API error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
