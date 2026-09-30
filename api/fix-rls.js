import pg from 'pg';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
  if (!connectionString) {
    return res.status(500).json({ error: 'Missing Postgres connection string in environment.' });
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // 1. Fetch current policies on public.profiles before change
    const beforeRes = await client.query(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
      FROM pg_policies 
      WHERE tablename = 'profiles';
    `);

    // 2. Drop all recursive policies and install non-recursive policies
    const sqlStatements = [
      `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`,
      `DROP POLICY IF EXISTS "Profiles admin manage" ON public.profiles;`,
      `DROP POLICY IF EXISTS "Profiles select own or admin" ON public.profiles;`,
      `DROP POLICY IF EXISTS "Profiles update own or admin" ON public.profiles;`,
      `DROP POLICY IF EXISTS "Profiles select public" ON public.profiles;`,
      `DROP POLICY IF EXISTS "Profiles update own" ON public.profiles;`,
      `DROP POLICY IF EXISTS "Profiles insert public" ON public.profiles;`,
      `DROP POLICY IF EXISTS "Profiles insert own" ON public.profiles;`,
      `DROP POLICY IF EXISTS "Profiles view own" ON public.profiles;`,
      `DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;`,
      `DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;`,
      `DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;`,
      `DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;`,
      `DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;`,
      `DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;`,
      `DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;`,
      `DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;`,
      `DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;`,

      // Safe non-recursive profile policies
      `CREATE POLICY "Users can view own profile" ON public.profiles 
        FOR SELECT 
        USING (auth.uid() = id);`,

      `CREATE POLICY "Users can update own profile" ON public.profiles 
        FOR UPDATE 
        USING (auth.uid() = id) 
        WITH CHECK (auth.uid() = id);`,

      `CREATE POLICY "Users can insert own profile" ON public.profiles 
        FOR INSERT 
        WITH CHECK (auth.uid() = id);`,

      // Non-recursive catalog policies
      `DROP POLICY IF EXISTS "Categories view active or admin" ON public.categories;`,
      `DROP POLICY IF EXISTS "Categories view active" ON public.categories;`,
      `DROP POLICY IF EXISTS "Categories admin manage" ON public.categories;`,
      `DROP POLICY IF EXISTS "Categories select" ON public.categories;`,
      `CREATE POLICY "Categories view active" ON public.categories FOR SELECT USING (active = true);`,

      `DROP POLICY IF EXISTS "Products view active or admin" ON public.products;`,
      `DROP POLICY IF EXISTS "Products view active" ON public.products;`,
      `DROP POLICY IF EXISTS "Products admin manage" ON public.products;`,
      `DROP POLICY IF EXISTS "Products select" ON public.products;`,
      `CREATE POLICY "Products view active" ON public.products FOR SELECT USING (active = true);`
    ];

    for (const sql of sqlStatements) {
      await client.query(sql);
    }

    // 3. Fetch current policies after change
    const afterRes = await client.query(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
      FROM pg_policies 
      WHERE tablename = 'profiles';
    `);

    await client.end();

    return res.status(200).json({
      success: true,
      message: 'RLS policies updated successfully without recursion.',
      policiesBefore: beforeRes.rows,
      policiesAfter: afterRes.rows
    });

  } catch (err) {
    if (client) {
      try { await client.end(); } catch (_) {}
    }
    console.error('Database migration error:', err);
    return res.status(500).json({ error: err.message });
  }
}
