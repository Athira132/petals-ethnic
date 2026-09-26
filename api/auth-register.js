import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://dmpltyqedymhggdtexto.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return res.status(500).json({ error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is missing.' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 1. Helper action: Confirm unconfirmed user's email if needed
    if (req.body?.action === 'confirm_email' || req.query?.action === 'confirm_email') {
      const emailToConfirm = (req.body?.email || req.query?.email || '').trim().toLowerCase();
      if (!emailToConfirm) {
        return res.status(400).json({ error: 'Email is required for confirmation.' });
      }

      const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers();
      if (listErr) {
        return res.status(500).json({ error: listErr.message });
      }

      const matchedUser = (usersData?.users || []).find(u => (u.email || '').toLowerCase() === emailToConfirm);
      if (matchedUser) {
        await supabase.auth.admin.updateUserById(matchedUser.id, {
          email_confirm: true
        });
        return res.status(200).json({ success: true, message: 'Email confirmed successfully.', userId: matchedUser.id });
      }

      return res.status(404).json({ error: 'User not found.' });
    }

    // 2. Customer Registration via POST
    if (req.method === 'POST') {
      const { name, email, password, phone } = req.body;

      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanName = (name || '').trim();
      const cleanPhone = (phone || '').trim();
      const cleanPassword = (password || '').trim();

      if (!cleanEmail || !cleanEmail.includes('@')) {
        return res.status(400).json({ error: 'A valid email address is required.' });
      }
      if (!cleanPassword || cleanPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }
      if (!cleanName) {
        return res.status(400).json({ error: 'Full name is required.' });
      }

      // Check if user already exists in auth.users
      const { data: usersData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const existingUser = (usersData?.users || []).find(u => (u.email || '').toLowerCase() === cleanEmail);

      let userId = null;

      if (existingUser) {
        // If user was created previously without email confirmation or re-registering, confirm and update password
        const { data: updatedData, error: updateErr } = await supabase.auth.admin.updateUserById(existingUser.id, {
          password: cleanPassword,
          email_confirm: true,
          user_metadata: {
            name: cleanName,
            phone: cleanPhone,
            role: 'customer'
          }
        });

        if (updateErr) {
          return res.status(500).json({ error: updateErr.message });
        }
        userId = updatedData.user.id;
      } else {
        // Create user with email_confirm: true to prevent unconfirmed email lockout
        const { data: createdData, error: createErr } = await supabase.auth.admin.createUser({
          email: cleanEmail,
          password: cleanPassword,
          email_confirm: true,
          user_metadata: {
            name: cleanName,
            phone: cleanPhone,
            role: 'customer'
          }
        });

        if (createErr) {
          if (createErr.message.includes('already been registered') || createErr.message.includes('already exists')) {
            const { data: retryList } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
            const matched = (retryList?.users || []).find(u => (u.email || '').toLowerCase() === cleanEmail);
            if (matched) {
              const { data: updatedData, error: updateErr } = await supabase.auth.admin.updateUserById(matched.id, {
                password: cleanPassword,
                email_confirm: true,
                user_metadata: {
                  name: cleanName,
                  phone: cleanPhone,
                  role: 'customer'
                }
              });
              if (!updateErr && updatedData?.user) {
                userId = updatedData.user.id;
              } else {
                return res.status(400).json({ error: 'This email is already registered. Please log in instead.' });
              }
            } else {
              return res.status(400).json({ error: 'This email is already registered. Please log in instead.' });
            }
          } else {
            return res.status(500).json({ error: createErr.message });
          }
        } else {
          userId = createdData.user.id;
        }
      }

      // Upsert profile record
      try {
        await supabase.from('profiles').upsert({
          id: userId,
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          role: 'customer',
          updated_at: new Date().toISOString()
        });
      } catch (profErr) {
        console.warn('Profile upsert note:', profErr);
      }

      return res.status(200).json({
        success: true,
        message: 'Account registered and confirmed successfully.',
        user: {
          id: userId,
          email: cleanEmail,
          name: cleanName
        }
      });
    }

    // 3. Batch auto-heal: confirm any unconfirmed customers in database
    if (req.method === 'GET') {
      const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers();
      if (listErr) {
        return res.status(500).json({ error: listErr.message });
      }

      let confirmedCount = 0;
      for (const u of (usersData?.users || [])) {
        if (!u.email_confirmed_at) {
          await supabase.auth.admin.updateUserById(u.id, { email_confirm: true });
          confirmedCount++;
        }
      }

      return res.status(200).json({
        success: true,
        totalUsers: (usersData?.users || []).length,
        confirmedCount,
        message: `Auto-healed ${confirmedCount} unconfirmed accounts.`
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Auth register handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
