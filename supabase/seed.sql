-- =====================================================================
-- PETALS ETHNIC - SEED DATA MIGRATION
-- Initial Store Settings, Payment Settings, and Categories
-- =====================================================================

-- 1. Insert Default Store Settings
INSERT INTO public.store_settings (
  id,
  store_name,
  store_email,
  email,
  store_phone,
  phone,
  whatsapp,
  currency,
  shipping_charge,
  delivery_charge,
  free_shipping_threshold,
  free_delivery_threshold,
  upi_id,
  upi_phone,
  upi_business_name,
  upi_enabled,
  razorpay_enabled,
  instagram_url
) VALUES (
  '88888888-8888-8888-8888-888888888888',
  'Petals Ethnic',
  'petalsethnic@gmail.com',
  'petalsethnic@gmail.com',
  '+91 81138 99319',
  '+91 81138 99319',
  '+91 81138 99319',
  'INR',
  99.00,
  99.00,
  1499.00,
  1499.00,
  '8113899319@ybl',
  '+91 81138 99319',
  'Petals Ethnic Boutique',
  true,
  true,
  'https://www.instagram.com/petalsethnic'
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Payment Settings
INSERT INTO public.payment_settings (
  id,
  razorpay_enabled,
  razorpay_key_id,
  upi_enabled,
  upi_id,
  upi_phone
) VALUES (
  '99999999-9999-9999-9999-999999999999',
  true,
  'rzp_live_petals_ethnic',
  true,
  '8113899319@ybl',
  '+91 81138 99319'
) ON CONFLICT (id) DO NOTHING;

-- 3. Insert Initial 7 Categories with exact direct ImgBB URLs
INSERT INTO public.categories (id, name, slug, description, image_url, is_active, active, sort_order, display_order) VALUES
('11111111-1111-1111-1111-111111111111', 'A Line Midi Dress', 'aline-midi-dress', 'Premium midi dresses tailored with soft, breathable fabrics and elegant modern drapes.', 'https://i.ibb.co/1fFmfKNH/Whats-App-Image-2026-08-13-at-12-31-10-PM-1.jpg', true, true, 1, 1),
('22222222-2222-2222-2222-222222222222', 'A Line Kurti with Floral Print', 'aline-kurti-floral-print', 'Beautiful A-line Kurtis adorned with soft watercolor florals and intricate prints.', 'https://i.ibb.co/xKv6CbTm/Whats-App-Image-2026-08-13-at-12-31-10-PM-2.jpg', true, true, 2, 2),
('33333333-3333-3333-3333-333333333333', 'A Line Kurti', 'aline-kurti', 'Classic A-line silhouettes that bring effortless elegance to your daily and festive wear.', 'https://i.ibb.co/WLLgp05/image.png', true, true, 3, 3),
('44444444-4444-4444-4444-444444444444', 'Anarkali', 'anarkali', 'Royal flair and majestic silhouettes crafted for celebratory occasions and festivals.', 'https://i.ibb.co/27MzMz7X/image.png', true, true, 4, 4),
('55555555-5555-5555-5555-555555555555', 'Codeset', 'codeset', 'Chic and modern coordinated ethnic sets combining style, premium fit, and unmatched comfort.', 'https://i.ibb.co/chvqjqFZ/image.png', true, true, 5, 5),
('66666666-6666-6666-6666-666666666666', 'Tissue Silk Kasavu Kurta', 'tissue-silk-kasavu-kurta', 'Traditional golden Kasavu kurta designs woven in shimmering, premium tissue silk fabrics.', 'https://i.ibb.co/ksFkWrhx/image.png', true, true, 6, 6),
('77777777-7777-7777-7777-777777777777', 'Normal Kurti', 'normal-kurti', 'Comfortable and elegant everyday kurtis tailored for a relaxed, graceful fit.', 'https://i.ibb.co/SDVwW6vy/Whats-App-Image-2026-08-13-at-12-31-11-PM.jpg', true, true, 7, 7)
ON CONFLICT (id) DO NOTHING;
