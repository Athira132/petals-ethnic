import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dmpltyqedymhggdtexto.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY environment variable.' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const adminAccounts = [
    { email: 'petalsethnic@gmail.com', pass: 'PetalsEthnicAdmin2026!', name: 'Petals Ethnic Admin' },
    { email: 'dhanyaadwork@gmail.com', pass: 'Dhanya@2026', name: 'Dhanya Admin' }
  ];

  const results = [];

  try {
    for (const acc of adminAccounts) {
      let userId = null;

      // 1. Check if auth user exists
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const existingUser = (usersData?.users || []).find(u => u.email === acc.email);

      if (existingUser) {
        userId = existingUser.id;
        await supabase.auth.admin.updateUserById(userId, {
          password: acc.pass,
          email_confirm: true,
          user_metadata: { name: acc.name }
        });
      } else {
        const { data: createdData, error: createErr } = await supabase.auth.admin.createUser({
          email: acc.email,
          password: acc.pass,
          email_confirm: true,
          user_metadata: { name: acc.name }
        });
        if (createErr) {
          console.error('Error creating user:', acc.email, createErr.message);
          results.push({ email: acc.email, status: 'error', message: createErr.message });
          continue;
        }
        userId = createdData.user.id;
      }

      // 2. Ensure profile exists and has role = 'admin'
      await supabase.from('profiles').upsert({
        id: userId,
        name: acc.name,
        email: acc.email,
        role: 'admin',
        updated_at: new Date().toISOString()
      });

      results.push({ email: acc.email, password: acc.pass, status: 'ready', id: userId });
    }

    return res.status(200).json({
      success: true,
      message: 'Super Admin login credentials verified and ready!',
      accounts: results
    });

  } catch (err) {
    console.error('Admin setup error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
