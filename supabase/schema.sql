-- Database Schema for Petals Ethnic WooCommerce Backend on Supabase

-- Drop triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profile_update ON public.profiles;

-- Drop tables in dependency order
DROP TABLE IF EXISTS public.store_settings CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.wishlist CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.product_sizes CASCADE;
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ---------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ---------------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
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
  active boolean NOT NULL DEFAULT true,
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
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  sale_price numeric(10,2) CHECK (sale_price IS NULL OR (sale_price >= 0 AND sale_price <= price)),
  sku text,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  low_stock_threshold integer NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
  availability text NOT NULL DEFAULT 'in_stock' CHECK (availability IN ('in_stock', 'few_left', 'sold_out', 'unavailable')),
  featured boolean NOT NULL DEFAULT false,
  new_arrival boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
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
  size text NOT NULL CHECK (size IN ('XS', 'S', 'M', 'L', 'XL')),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
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
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
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
  order_number text NOT NULL UNIQUE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL, -- Nullable for Guest checkout
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  subtotal numeric(10,2) NOT NULL CHECK (subtotal >= 0),
  discount numeric(10,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  delivery_charge numeric(10,2) NOT NULL DEFAULT 0 CHECK (delivery_charge >= 0),
  total numeric(10,2) NOT NULL CHECK (total >= 0),
  payment_method text NOT NULL CHECK (payment_method IN ('upi', 'razorpay', 'cod')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'awaiting_verification')),
  order_status text NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled')),
  payment_reference text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 8. ORDER ITEMS TABLE (Stores snapshots of product details)
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
-- 9. WISHLIST TABLE
-- ---------------------------------------------------------------------
CREATE TABLE public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 10. COUPONS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value numeric(10,2) NOT NULL CHECK (value > 0),
  min_order_amount numeric(10,2) NOT NULL DEFAULT 0 CHECK (min_order_amount >= 0),
  expiry_date timestamp with time zone,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 11. STORE SETTINGS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text NOT NULL DEFAULT 'Petals Ethnic',
  contact_phone text,
  contact_whatsapp text,
  contact_email text,
  instagram_url text,
  facebook_url text,
  currency text NOT NULL DEFAULT 'INR',
  delivery_charge numeric(10,2) NOT NULL DEFAULT 99.00 CHECK (delivery_charge >= 0),
  free_delivery_threshold numeric(10,2) NOT NULL DEFAULT 1499.00 CHECK (free_delivery_threshold >= 0),
  upi_id text,
  upi_phone text,
  upi_name text,
  upi_qr_url text,
  upi_enabled boolean NOT NULL DEFAULT true,
  razorpay_enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 12. INDEX OPTIMIZATIONS
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_cat ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_product_images_prod ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sizes_prod ON public.product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.wishlist(user_id);

-- ---------------------------------------------------------------------
-- 13. TRIGGERS & FUNCTIONS
-- ---------------------------------------------------------------------

-- Create public profile automatically on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Valued Customer'),
    NEW.email,
    'customer',
    COALESCE(NEW.phone, '')
  );
  
  -- Automatically link guest orders by matching email
  UPDATE public.orders
  SET user_id = NEW.id
  WHERE customer_email = NEW.email AND user_id IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Secure update of profile attributes and role locking
CREATE OR REPLACE FUNCTION public.handle_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow changing role if executing user is an admin
  IF NEW.role <> OLD.role AND (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  ) <> 'admin' THEN
    NEW.role := OLD.role;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profile_update();

-- ---------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------

-- Profiles
CREATE POLICY "Profiles select public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles admin manage" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Categories
CREATE POLICY "Categories view active" ON public.categories FOR SELECT USING (active = true OR EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));
CREATE POLICY "Categories admin manage" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Products
CREATE POLICY "Products view active" ON public.products FOR SELECT USING (active = true OR EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));
CREATE POLICY "Products admin manage" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Product Images
CREATE POLICY "Product images select public" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Product images admin manage" ON public.product_images FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Product Sizes
CREATE POLICY "Product sizes select public" ON public.product_sizes FOR SELECT USING (true);
CREATE POLICY "Product sizes admin manage" ON public.product_sizes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Store Settings
CREATE POLICY "Store settings select public" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Store settings admin manage" ON public.store_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Coupons
CREATE POLICY "Coupons select active" ON public.coupons FOR SELECT USING (active = true);
CREATE POLICY "Coupons admin manage" ON public.coupons FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Wishlist
CREATE POLICY "Wishlist select own" ON public.wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Wishlist insert own" ON public.wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Wishlist delete own" ON public.wishlist FOR DELETE USING (auth.uid() = user_id);

-- Addresses
CREATE POLICY "Addresses select own" ON public.addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Addresses insert own" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Addresses update own" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Addresses delete own" ON public.addresses FOR DELETE USING (auth.uid() = user_id);

-- Orders
CREATE POLICY "Orders select public tracking" ON public.orders FOR SELECT USING (
  auth.uid() = user_id OR user_id IS NULL OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Orders insert anyone" ON public.orders FOR INSERT WITH CHECK (true); -- Required for guest checkouts
CREATE POLICY "Orders admin update" ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Order Items
CREATE POLICY "Order items select own" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND (orders.user_id = auth.uid() OR orders.user_id IS NULL OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )))
);
CREATE POLICY "Order items insert anyone" ON public.order_items FOR INSERT WITH CHECK (true);

-- ---------------------------------------------------------------------
-- 15. TRANSACTION-SAFE STOCK DECREMENT RPC
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
    -- Get product metadata
    SELECT name, low_stock_threshold INTO v_prod_name, v_low_stock_threshold
    FROM public.products WHERE id = v_item.product_id;

    -- Fetch and lock size stock
    SELECT stock INTO v_size_stock
    FROM public.product_sizes
    WHERE product_id = v_item.product_id AND size = v_item.size
    FOR UPDATE;

    IF v_size_stock IS NULL OR v_size_stock < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for "%" (Size: %). Requested: %, Available: %',
        v_prod_name, v_item.size, v_item.quantity, COALESCE(v_size_stock, 0);
    END IF;

    -- Decrement size stock
    v_new_size_stock := v_size_stock - v_item.quantity;

    UPDATE public.product_sizes
    SET
      stock = v_new_size_stock,
      status = CASE
                 WHEN v_new_size_stock = 0 THEN 'sold_out'
                 WHEN v_new_size_stock <= v_low_stock_threshold THEN 'few_left'
                 ELSE 'available'
               END,
      updated_at = now()
    WHERE product_id = v_item.product_id AND size = v_item.size;

    -- Decrement cumulative product stock
    UPDATE public.products
    SET
      stock = stock - v_item.quantity,
      availability = CASE
                       WHEN (SELECT SUM(stock) FROM public.product_sizes WHERE product_id = v_item.product_id) = 0 THEN 'sold_out'
                       WHEN (SELECT SUM(stock) FROM public.product_sizes WHERE product_id = v_item.product_id) <= v_low_stock_threshold THEN 'few_left'
                       ELSE 'in_stock'
                     END,
      updated_at = now()
    WHERE id = v_item.product_id;

  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
