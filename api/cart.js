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
    return res.status(403).json({ error: 'Forbidden: Cannot access or modify cart data of another user.' });
  }

  const adminClient = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

  try {
    if (req.method === 'GET') {
      let items = tokenUser.user_metadata?.cart || [];
      if (adminClient) {
        try {
          const { data: adminUserData } = await adminClient.auth.admin.getUserById(targetUserId);
          if (adminUserData?.user?.user_metadata?.cart) {
            items = adminUserData.user.user_metadata.cart;
          }
        } catch (adminErr) {
          console.warn('Cart admin fetch notice:', adminErr.message);
        }
      }
      return res.status(200).json({ success: true, userId: targetUserId, items });
    }

    if (req.method === 'POST') {
      const items = Array.isArray(req.body?.items) ? req.body.items : [];
      const currentMeta = tokenUser.user_metadata || {};

      // Direct authenticated update
      const updateRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: { ...currentMeta, cart: items }
        })
      });

      if (!updateRes.ok && !adminClient) {
        const errJson = await updateRes.json().catch(() => ({}));
        throw new Error(errJson.msg || errJson.message || 'Failed to update user cart in database');
      }

      if (adminClient) {
        await adminClient.auth.admin.updateUserById(targetUserId, {
          user_metadata: { ...currentMeta, cart: items }
        });
      }

      return res.status(200).json({ success: true, userId: targetUserId, items });
    }

    if (req.method === 'DELETE') {
      const currentMeta = tokenUser.user_metadata || {};

      await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: { ...currentMeta, cart: [] }
        })
      });

      if (adminClient) {
        await adminClient.auth.admin.updateUserById(targetUserId, {
          user_metadata: { ...currentMeta, cart: [] }
        });
      }

      return res.status(200).json({ success: true, userId: targetUserId, items: [] });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('Cart API error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
