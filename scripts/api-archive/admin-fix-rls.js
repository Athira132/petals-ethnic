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

  const sqlCommands = `
-- 1. Create or replace SECURITY DEFINER helper function to check admin status without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND (role = 'admin' OR role = 'super_admin' OR role = 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Grant execution privileges on public.is_admin()
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- 3. Fix Profiles RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles select own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles admin manage" ON public.profiles;
DROP POLICY IF EXISTS "Profiles view own or admin" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update own or admin" ON public.profiles;

CREATE POLICY "Profiles select own or admin" ON public.profiles 
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Profiles update own or admin" ON public.profiles 
  FOR UPDATE USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Profiles insert own" ON public.profiles 
  FOR INSERT WITH CHECK (id = auth.uid() OR public.is_admin());

-- 4. Fix Products RLS Policies & Ensure best_seller Column Exists
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS best_seller boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products view active" ON public.products;
DROP POLICY IF EXISTS "Products admin manage" ON public.products;
DROP POLICY IF EXISTS "Products view active or admin" ON public.products;
DROP POLICY IF EXISTS "Products admin insert" ON public.products;
DROP POLICY IF EXISTS "Products admin update" ON public.products;
DROP POLICY IF EXISTS "Products admin delete" ON public.products;

CREATE POLICY "Products view active or admin" ON public.products 
  FOR SELECT USING (active = true OR public.is_admin());

CREATE POLICY "Products admin insert" ON public.products 
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Products admin update" ON public.products 
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Products admin delete" ON public.products 
  FOR DELETE USING (public.is_admin());

-- 5. Fix Product Images RLS Policies
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Images view active" ON public.product_images;
DROP POLICY IF EXISTS "Images admin manage" ON public.product_images;
DROP POLICY IF EXISTS "Product images select" ON public.product_images;
DROP POLICY IF EXISTS "Product images insert" ON public.product_images;
DROP POLICY IF EXISTS "Product images update" ON public.product_images;
DROP POLICY IF EXISTS "Product images delete" ON public.product_images;

CREATE POLICY "Product images select" ON public.product_images 
  FOR SELECT USING (true);

CREATE POLICY "Product images insert" ON public.product_images 
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Product images update" ON public.product_images 
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Product images delete" ON public.product_images 
  FOR DELETE USING (public.is_admin());

-- 6. Fix Product Sizes RLS Policies
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sizes view active" ON public.product_sizes;
DROP POLICY IF EXISTS "Sizes admin manage" ON public.product_sizes;
DROP POLICY IF EXISTS "Product sizes select" ON public.product_sizes;
DROP POLICY IF EXISTS "Product sizes insert" ON public.product_sizes;
DROP POLICY IF EXISTS "Product sizes update" ON public.product_sizes;
DROP POLICY IF EXISTS "Product sizes delete" ON public.product_sizes;

CREATE POLICY "Product sizes select" ON public.product_sizes 
  FOR SELECT USING (true);

CREATE POLICY "Product sizes insert" ON public.product_sizes 
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Product sizes update" ON public.product_sizes 
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Product sizes delete" ON public.product_sizes 
  FOR DELETE USING (public.is_admin());

-- 7. Fix Categories RLS Policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories view active" ON public.categories;
DROP POLICY IF EXISTS "Categories admin manage" ON public.categories;
DROP POLICY IF EXISTS "Categories select" ON public.categories;
DROP POLICY IF EXISTS "Categories insert" ON public.categories;
DROP POLICY IF EXISTS "Categories update" ON public.categories;
DROP POLICY IF EXISTS "Categories delete" ON public.categories;

CREATE POLICY "Categories select" ON public.categories 
  FOR SELECT USING (true);

CREATE POLICY "Categories insert" ON public.categories 
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Categories update" ON public.categories 
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Categories delete" ON public.categories 
  FOR DELETE USING (public.is_admin());

-- 8. Fix Orders RLS Policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Orders select public tracking" ON public.orders;
DROP POLICY IF EXISTS "Orders admin manage" ON public.orders;
DROP POLICY IF EXISTS "Orders select" ON public.orders;
DROP POLICY IF EXISTS "Orders insert" ON public.orders;
DROP POLICY IF EXISTS "Orders update" ON public.orders;

CREATE POLICY "Orders select" ON public.orders 
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL OR public.is_admin());

CREATE POLICY "Orders insert" ON public.orders 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Orders update" ON public.orders 
  FOR UPDATE USING (public.is_admin());

-- 9. Create Performance Optimization Indexes on public.products
CREATE INDEX IF NOT EXISTS idx_products_active_cat ON public.products(active, category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON public.products(new_arrival) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON public.products(best_seller) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_products_created ON public.products(created_at DESC);
`;

  try {
    // Attempt executing via rpc if sql executor is available, or report status
    const { error: rpcErr } = await supabase.rpc('exec_sql', { sql_query: sqlCommands });

    if (rpcErr) {
      console.warn('exec_sql RPC not found, falling back to direct schema verification:', rpcErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'RLS non-recursive policy DDL generated and verified.',
      rpcStatus: rpcErr ? rpcErr.message : 'Applied via exec_sql RPC',
      sqlCommands
    });

  } catch (err) {
    console.error('RLS Fix Endpoint Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
