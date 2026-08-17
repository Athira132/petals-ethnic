import { createClient } from '@supabase/supabase-js';

// Vercel Serverless Function to execute one-time setup of the Super Admin account
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({
      error: 'Server Configuration Error: Missing SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_URL.'
    });
  }

  // Initialize secure admin client bypassing RLS policies
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const adminEmail = 'dhanyaadwork@gmail.com';
  const adminPassword = 'Dhanya@2026';
  const adminName = 'Super Admin';

  try {
    let adminUserId = null;
    let actionTaken = '';

    // 1. Fetch user lists to check if admin already exists
    const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers();
    if (listErr) throw listErr;

    const existingUser = (usersData?.users || []).find(u => u.email === adminEmail);

    if (existingUser) {
      // 2. User exists: Update their password and confirm state
      const { data: updatedData, error: updateErr } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password: adminPassword,
          email_confirm: true,
          user_metadata: { name: adminName }
        }
      );

      if (updateErr) throw updateErr;
      adminUserId = existingUser.id;
      actionTaken = 'Updated existing Auth user password and metadata.';
    } else {
      // 3. User does not exist: Create new Auth user
      const { data: createdData, error: createErr } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { name: adminName }
      });

      if (createErr) throw createErr;
      if (!createdData?.user) throw new Error('Auth creation response did not contain user properties.');

      adminUserId = createdData.user.id;
      actionTaken = 'Created new Auth user successfully.';
    }

    // 4. Ensure matching public profile exists and has role = 'admin'
    const { data: profileRecord, error: profileFetchErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', adminUserId)
      .maybeSingle();

    const profilePayload = {
      id: adminUserId,
      name: adminName,
      email: adminEmail,
      role: 'admin',
      updated_at: new Date()
    };

    if (profileRecord) {
      // Update profile
      const { error: profileUpdateErr } = await supabase
        .from('profiles')
        .update({
          name: adminName,
          email: adminEmail,
          role: 'admin',
          updated_at: new Date()
        })
        .eq('id', adminUserId);

      if (profileUpdateErr) throw profileUpdateErr;
      actionTaken += ' Updated existing database profile role to admin.';
    } else {
      // Insert profile
      const { error: profileInsertErr } = await supabase
        .from('profiles')
        .insert({
          ...profilePayload,
          created_at: new Date()
        });

      if (profileInsertErr) throw profileInsertErr;
      actionTaken += ' Inserted new database profile record with admin privileges.';
    }

    return res.status(200).json({
      success: true,
      message: 'Super Admin account is ready to use.',
      details: {
        email: adminEmail,
        id: adminUserId,
        action: actionTaken
      }
    });

  } catch (err) {
    console.error('Super Admin setup script error:', err.message);
    return res.status(500).json({
      error: 'Failed to configure Super Admin account: ' + err.message
    });
  }
}
