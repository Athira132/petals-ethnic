import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://dmpltyqedymhggdtexto.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const envKeys = Object.keys(process.env).filter(k => 
    k.includes('SUPABASE') || k.includes('POSTGRES') || k.includes('DATABASE') || k.includes('DB')
  );

  let rpcResult = null;
  let rpcError = null;

  if (serviceRoleKey) {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: `
          DROP POLICY IF EXISTS "Profiles admin manage" ON public.profiles;
          DROP POLICY IF EXISTS "Profiles select own or admin" ON public.profiles;
          DROP POLICY IF EXISTS "Profiles update own or admin" ON public.profiles;
          DROP POLICY IF EXISTS "Profiles select public" ON public.profiles;
          DROP POLICY IF EXISTS "Profiles update own" ON public.profiles;
          DROP POLICY IF EXISTS "Profiles view own" ON public.profiles;
          DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
          
          CREATE POLICY "Users can view own profile" ON public.profiles 
            FOR SELECT USING (auth.uid() = id);
            
          CREATE POLICY "Users can update own profile" ON public.profiles 
            FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
        `
      });
      rpcResult = data;
      rpcError = error;
    } catch (e) {
      rpcError = e.message;
    }
  }

  return res.status(200).json({
    envKeys,
    hasServiceRoleKey: Boolean(serviceRoleKey),
    hasPostgresUrl: Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL),
    rpcResult,
    rpcError
  });
}
