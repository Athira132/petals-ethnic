-- Migration 002: Add Product & Category feature columns for Petal Ethnics & Jewellers

-- 1. Add department column to categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS department text NOT NULL DEFAULT 'ethnic';

-- 2. Add extended fields to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS department text NOT NULL DEFAULT 'ethnic';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS has_size boolean NOT NULL DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS show_size_chart boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size_chart_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS purchase_mode text NOT NULL DEFAULT 'online';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS has_colors boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS color_variants jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_display text NOT NULL DEFAULT 'normal';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS custom_stock_message text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS return_policy text;

-- 3. Backfill department for jewellery categories
UPDATE public.categories 
SET department = 'jewellery' 
WHERE LOWER(slug) IN ('necklace', 'necklaces', 'earrings', 'bangles', 'rings', 'bracelets', 'chains', 'jewellery')
   OR LOWER(name) IN ('necklace', 'necklaces', 'earrings', 'bangles', 'rings', 'bracelets', 'chains', 'jewellery');

-- 4. Update deduct_order_stock to support products with or without sizes
CREATE OR REPLACE FUNCTION public.deduct_order_stock(p_order_id uuid)
RETURNS void AS $$
DECLARE
  v_item record;
  v_size_stock integer;
  v_new_size_stock integer;
  v_low_stock_threshold integer;
  v_prod_name text;
  v_product_stock integer;
BEGIN
  FOR v_item IN SELECT product_id, size, quantity FROM public.order_items WHERE order_id = p_order_id LOOP
    -- Get product metadata
    SELECT name, low_stock_threshold, stock INTO v_prod_name, v_low_stock_threshold, v_product_stock
    FROM public.products WHERE id = v_item.product_id;

    -- Check if product has sizes recorded in product_sizes
    IF EXISTS (
      SELECT 1 FROM public.product_sizes 
      WHERE product_id = v_item.product_id 
        AND v_item.size IS NOT NULL 
        AND v_item.size != '' 
        AND v_item.size != 'N/A' 
        AND v_item.size != 'One Size'
        AND v_item.size != 'Standard'
    ) THEN
      -- Fetch and lock size stock
      SELECT stock INTO v_size_stock
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
        stock = v_new_size_stock,
        status = CASE
                   WHEN v_new_size_stock = 0 THEN 'sold_out'
                   WHEN v_new_size_stock <= v_low_stock_threshold THEN 'few_left'
                   ELSE 'available'
                 END,
        updated_at = now()
      WHERE product_id = v_item.product_id AND size = v_item.size;

      UPDATE public.products
      SET
        stock = GREATEST(0, stock - v_item.quantity),
        availability = CASE
                         WHEN (SELECT COALESCE(SUM(stock), 0) FROM public.product_sizes WHERE product_id = v_item.product_id) = 0 THEN 'sold_out'
                         WHEN (SELECT COALESCE(SUM(stock), 0) FROM public.product_sizes WHERE product_id = v_item.product_id) <= v_low_stock_threshold THEN 'few_left'
                         ELSE 'in_stock'
                       END,
        updated_at = now()
      WHERE id = v_item.product_id;
    ELSE
      -- Product without size (e.g. Jewellery, Sarees)
      IF v_product_stock IS NULL OR v_product_stock < v_item.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for "%". Requested: %, Available: %',
          v_prod_name, v_item.quantity, COALESCE(v_product_stock, 0);
      END IF;

      UPDATE public.products
      SET
        stock = GREATEST(0, stock - v_item.quantity),
        availability = CASE
                         WHEN (stock - v_item.quantity) <= 0 THEN 'sold_out'
                         WHEN (stock - v_item.quantity) <= v_low_stock_threshold THEN 'few_left'
                         ELSE 'in_stock'
                       END,
        updated_at = now()
      WHERE id = v_item.product_id;
    END IF;

  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
