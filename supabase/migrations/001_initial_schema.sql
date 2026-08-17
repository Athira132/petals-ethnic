-- =====================================================================
-- PETALS ETHNIC - 001_INITIAL_SCHEMA.SQL
-- Complete Database Migration for Supabase PostgreSQL & Auth
-- =====================================================================

-- Drop existing triggers if present
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profile_update ON public.profiles;
DROP TRIGGER IF EXISTS trg_sync_product_size_stock ON public.product_sizes;

-- Drop tables in dependency order
DROP TABLE IF EXISTS public.payment_settings CASCADE;
DROP TABLE IF EXISTS public.store_settings CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.wishlists CASCADE;
DROP TABLE IF EXISTS public.wishlist CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.product_sizes CASCADE;
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP SEQUENCE IF EXISTS public.order_number_seq;

-- Sequence for Order Numbers (PE10001, PE10002, etc.)
CREATE SEQUENCE public.order_number_seq START WITH 10001;

-- ---------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ---------------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  name text,
  phone text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'superadmin')),
  address text,
  city text,
  state text,
  pincode text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- ---------------------------------------------------------------------
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 3. PRODUCTS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  short_description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  sale_price numeric(10,2) CHECK (sale_price IS NULL OR (sale_price >= 0 AND sale_price <= price)),
  sku text,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  low_stock_threshold integer NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
  availability text NOT NULL DEFAULT 'in_stock' CHECK (availability IN ('in_stock', 'few_left', 'sold_out', 'unavailable')),
  image_url text,
  additional_image_urls text[],
  is_active boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  new_arrival boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 4. PRODUCT IMAGES TABLE (Hosted on ImgBB)
-- ---------------------------------------------------------------------
CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  thumbnail_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 5. PRODUCT SIZES TABLE
-- ---------------------------------------------------------------------
CREATE TABLE public.product_sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size text NOT NULL CHECK (size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_available boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'few_left', 'sold_out')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (product_id, size)
);

ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 6. ADDRESSES TABLE
-- ---------------------------------------------------------------------
CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  address_line text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 7. ORDERS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE DEFAULT ('PE' || nextval('public.order_number_seq')::text),
  customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  shipping_address text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  subtotal numeric(10,2) NOT NULL CHECK (subtotal >= 0),
  shipping_charge numeric(10,2) NOT NULL DEFAULT 0 CHECK (shipping_charge >= 0),
  delivery_charge numeric(10,2) NOT NULL DEFAULT 0 CHECK (delivery_charge >= 0),
  discount numeric(10,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  total_amount numeric(10,2) NOT NULL CHECK (total_amount >= 0),
  total numeric(10,2) NOT NULL CHECK (total >= 0),
  payment_method text NOT NULL CHECK (payment_method IN ('upi', 'razorpay', 'cod')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'awaiting_verification')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned')),
  order_status text NOT NULL DEFAULT 'pending',
  payment_reference text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 8. ORDER ITEMS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_image text,
  size text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price numeric(10,2) NOT NULL CHECK (total_price >= 0),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 9. PAYMENTS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  payment_method text NOT NULL CHECK (payment_method IN ('upi', 'razorpay')),
  amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id text,
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 10. WISHLIST / WISHLISTS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE public.wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (customer_id, product_id)
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Create alias view or table for wishlist if referenced as wishlist
CREATE TABLE IF NOT EXISTS public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 11. COUPONS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric(10,2) NOT NULL CHECK (discount_value > 0),
  minimum_order_amount numeric(10,2) NOT NULL DEFAULT 0 CHECK (minimum_order_amount >= 0),
  expires_at timestamp with time zone,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 12. STORE SETTINGS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text NOT NULL DEFAULT 'Petals Ethnic',
  store_email text DEFAULT 'petalsethnic@gmail.com',
  email text DEFAULT 'petalsethnic@gmail.com',
  store_phone text DEFAULT '+91 81138 99319',
  phone text DEFAULT '+91 81138 99319',
  whatsapp text DEFAULT '+91 81138 99319',
  currency text NOT NULL DEFAULT 'INR',
  shipping_charge numeric(10,2) NOT NULL DEFAULT 99.00 CHECK (shipping_charge >= 0),
  delivery_charge numeric(10,2) NOT NULL DEFAULT 99.00 CHECK (delivery_charge >= 0),
  free_shipping_threshold numeric(10,2) NOT NULL DEFAULT 1499.00 CHECK (free_shipping_threshold >= 0),
  free_delivery_threshold numeric(10,2) NOT NULL DEFAULT 1499.00 CHECK (free_delivery_threshold >= 0),
  upi_id text DEFAULT '8113899319@ybl',
  upi_phone text DEFAULT '+91 81138 99319',
  upi_business_name text DEFAULT 'Petals Ethnic Boutique',
  upi_qr_image_url text,
  upi_qr_url text,
  upi_enabled boolean NOT NULL DEFAULT true,
  razorpay_enabled boolean NOT NULL DEFAULT true,
  instagram_url text NOT NULL DEFAULT 'https://www.instagram.com/petalsethnic',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 13. ALTER EXISTING TABLES TO ENSURE ALL REQUESTED COLUMNS EXIST
-- ---------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('customer', 'admin', 'superadmin'));

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS additional_image_urls text[];

ALTER TABLE public.product_sizes ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 0;
ALTER TABLE public.product_sizes ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_charge numeric(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_amount numeric(10,2) DEFAULT 0;

-- ---------------------------------------------------------------------
-- 14. HELPER FUNCTIONS & TRIGGERS
-- ---------------------------------------------------------------------

-- Helper to check if current authenticated user is an admin or superadmin safely without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  );
$$;

-- Fail-safe Trigger for creating user profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, name, role, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'Valued Customer'),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'Valued Customer'),
    'customer',
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to keep stock_quantity, stock, is_available, and status synchronized on product_sizes
CREATE OR REPLACE FUNCTION public.sync_product_size_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Sync stock values
  IF NEW.stock_quantity IS DISTINCT FROM OLD.stock_quantity THEN
    NEW.stock := NEW.stock_quantity;
  ELSIF NEW.stock IS DISTINCT FROM OLD.stock THEN
    NEW.stock_quantity := NEW.stock;
  END IF;

  -- Sync availability & status
  IF NEW.stock_quantity = 0 THEN
    NEW.is_available := false;
    NEW.status := 'sold_out';
  ELSE
    NEW.is_available := true;
    IF NEW.stock_quantity <= 5 THEN
      NEW.status := 'few_left';
    ELSE
      NEW.status := 'available';
    END IF;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_product_size_stock
  BEFORE INSERT OR UPDATE ON public.product_sizes
  FOR EACH ROW EXECUTE FUNCTION public.sync_product_size_stock();

-- ---------------------------------------------------------------------
-- 15. RLS POLICIES (NON-RECURSIVE & SECURE)
-- ---------------------------------------------------------------------

-- Profiles
CREATE POLICY "Profiles select public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles insert public" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Profiles update own" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Categories
CREATE POLICY "Categories view active" ON public.categories FOR SELECT USING (is_active = true OR active = true OR public.is_admin());
CREATE POLICY "Categories admin manage" ON public.categories FOR ALL USING (public.is_admin());

-- Products
CREATE POLICY "Products view active" ON public.products FOR SELECT USING (is_active = true OR active = true OR public.is_admin());
CREATE POLICY "Products admin manage" ON public.products FOR ALL USING (public.is_admin());

-- Product Images
CREATE POLICY "Product images select public" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Product images admin manage" ON public.product_images FOR ALL USING (public.is_admin());

-- Product Sizes
CREATE POLICY "Product sizes select public" ON public.product_sizes FOR SELECT USING (true);
CREATE POLICY "Product sizes admin manage" ON public.product_sizes FOR ALL USING (public.is_admin());

-- Store Settings
CREATE POLICY "Store settings select public" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Store settings admin manage" ON public.store_settings FOR ALL USING (public.is_admin());

-- Payment Settings
CREATE POLICY "Payment settings select public" ON public.payment_settings FOR SELECT USING (true);
CREATE POLICY "Payment settings admin manage" ON public.payment_settings FOR ALL USING (public.is_admin());

-- Coupons
CREATE POLICY "Coupons select active" ON public.coupons FOR SELECT USING (active = true);
CREATE POLICY "Coupons admin manage" ON public.coupons FOR ALL USING (public.is_admin());

-- Wishlists
CREATE POLICY "Wishlists select own" ON public.wishlists FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = user_id);
CREATE POLICY "Wishlists insert own" ON public.wishlists FOR INSERT WITH CHECK (auth.uid() = customer_id OR auth.uid() = user_id);
CREATE POLICY "Wishlists delete own" ON public.wishlists FOR DELETE USING (auth.uid() = customer_id OR auth.uid() = user_id);

CREATE POLICY "Wishlist select own" ON public.wishlist FOR SELECT USING (auth.uid() = user_id OR auth.uid() = customer_id);
CREATE POLICY "Wishlist insert own" ON public.wishlist FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = customer_id);
CREATE POLICY "Wishlist delete own" ON public.wishlist FOR DELETE USING (auth.uid() = user_id OR auth.uid() = customer_id);

-- Addresses
CREATE POLICY "Addresses select own" ON public.addresses FOR SELECT USING (auth.uid() = user_id OR auth.uid() = customer_id);
CREATE POLICY "Addresses insert own" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = customer_id);
CREATE POLICY "Addresses update own" ON public.addresses FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = customer_id);
CREATE POLICY "Addresses delete own" ON public.addresses FOR DELETE USING (auth.uid() = user_id OR auth.uid() = customer_id);

-- Orders
CREATE POLICY "Orders select public tracking" ON public.orders FOR SELECT USING (
  auth.uid() = customer_id OR auth.uid() = user_id OR customer_id IS NULL OR user_id IS NULL OR public.is_admin()
);
CREATE POLICY "Orders insert anyone" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders admin update" ON public.orders FOR UPDATE USING (public.is_admin());

-- Order Items
CREATE POLICY "Order items select own" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND (orders.customer_id = auth.uid() OR orders.user_id = auth.uid() OR orders.user_id IS NULL OR public.is_admin()))
);
CREATE POLICY "Order items insert anyone" ON public.order_items FOR INSERT WITH CHECK (true);

-- Payments
CREATE POLICY "Payments select own" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = payments.order_id AND (orders.customer_id = auth.uid() OR orders.user_id = auth.uid() OR orders.user_id IS NULL OR public.is_admin()))
);
CREATE POLICY "Payments insert anyone" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Payments admin manage" ON public.payments FOR ALL USING (public.is_admin());

-- ---------------------------------------------------------------------
-- 16. TRANSACTION-SAFE STOCK DECREMENT RPC
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.deduct_order_stock(p_order_id uuid)
RETURNS void AS $$
DECLARE
  v_item record;
  v_size_stock integer;
  v_new_size_stock integer;
  v_low_stock_threshold integer;
  v_prod_name text;
BEGIN
  FOR v_item IN SELECT product_id, size, quantity FROM public.order_items WHERE order_id = p_order_id LOOP
    SELECT name, low_stock_threshold INTO v_prod_name, v_low_stock_threshold
    FROM public.products WHERE id = v_item.product_id;

    SELECT stock_quantity INTO v_size_stock
    FROM public.product_sizes
    WHERE product_id = v_item.product_id AND size = v_item.size
    FOR UPDATE;

    IF v_size_stock IS NULL OR v_size_stock < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for "%" (Size: %). Requested: %, Available: %',
        v_prod_name, v_item.size, v_item.quantity, COALESCE(v_size_stock, 0);
    END IF;

    v_new_size_stock := v_size_stock - v_item.quantity;

    UPDATE public.product_sizes
    SET
      stock_quantity = v_new_size_stock,
      stock = v_new_size_stock,
      is_available = (v_new_size_stock > 0),
      status = CASE
                 WHEN v_new_size_stock = 0 THEN 'sold_out'
                 WHEN v_new_size_stock <= v_low_stock_threshold THEN 'few_left'
                 ELSE 'available'
               END,
      updated_at = now()
    WHERE product_id = v_item.product_id AND size = v_item.size;

    UPDATE public.products
    SET
      stock = stock - v_item.quantity,
      availability = CASE
                       WHEN (SELECT SUM(stock_quantity) FROM public.product_sizes WHERE product_id = v_item.product_id) = 0 THEN 'sold_out'
                       WHEN (SELECT SUM(stock_quantity) FROM public.product_sizes WHERE product_id = v_item.product_id) <= v_low_stock_threshold THEN 'few_left'
                       ELSE 'in_stock'
                     END,
      updated_at = now()
    WHERE id = v_item.product_id;

  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant Schema Permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
