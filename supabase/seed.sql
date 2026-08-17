-- Seed Data for Petals Ethnic WooCommerce Backend on Supabase

-- 1. Insert Default Store Settings
INSERT INTO public.store_settings (
  id,
  store_name,
  contact_phone,
  contact_whatsapp,
  contact_email,
  instagram_url,
  facebook_url,
  currency,
  delivery_charge,
  free_delivery_threshold,
  upi_id,
  upi_phone,
  upi_name,
  upi_enabled,
  razorpay_enabled
) VALUES (
  '88888888-8888-8888-8888-888888888888',
  'Petals Ethnic',
  '+91 81138 99319',
  '+91 81138 99319',
  'support@petals-ethnic.com',
  'https://instagram.com/petals_ethnic',
  'https://facebook.com/petals_ethnic',
  'INR',
  99.00,
  1499.00,
  '8113899319@ybl',
  '+91 81138 99319',
  'Petals Ethnic Boutique',
  true,
  true
);

-- 2. Insert Categories
INSERT INTO public.categories (id, name, slug, description, image_url, active, display_order) VALUES
('11111111-1111-1111-1111-111111111111', 'A Line Midi Dress', 'aline-midi-dress', 'Premium midi dresses tailored with soft, breathable fabrics and elegant modern drapes.', 'https://i.ibb.co/1fFmfKNH/Whats-App-Image-2026-08-13-at-12-31-10-PM-1.jpg', true, 1),
('22222222-2222-2222-2222-222222222222', 'A Line Kurti with Floral Print', 'aline-kurti-floral-print', 'Beautiful A-line Kurtis adorned with soft watercolor florals and intricate prints.', 'https://i.ibb.co/xKv6CbTm/Whats-App-Image-2026-08-13-at-12-31-10-PM-2.jpg', true, 2),
('33333333-3333-3333-3333-333333333333', 'A Line Kurti', 'aline-kurti', 'Classic A-line silhouettes that bring effortless elegance to your daily and festive wear.', 'https://i.ibb.co/WLLgp05/image.png', true, 3),
('44444444-4444-4444-4444-444444444444', 'Anarkali', 'anarkali', 'Royal flair and majestic silhouettes crafted for celebratory occasions and festivals.', 'https://i.ibb.co/27MzMz7X/image.png', true, 4),
('55555555-5555-5555-5555-555555555555', 'Codeset', 'codeset', 'Chic and modern coordinated ethnic sets combining style, premium fit, and unmatched comfort.', 'https://i.ibb.co/chvqjqFZ/image.png', true, 5),
('66666666-6666-6666-6666-666666666666', 'Tissue Silk Kasavu Kurta', 'tissue-silk-kasavu-kurta', 'Traditional golden Kasavu kurta designs woven in shimmering, premium tissue silk fabrics.', 'https://i.ibb.co/ksFkWrhx/image.png', true, 6),
('77777777-7777-7777-7777-777777777777', 'Normal Kurti', 'normal-kurti', 'Comfortable and elegant everyday kurtis tailored for a relaxed, graceful fit.', 'https://i.ibb.co/SDVwW6vy/Whats-App-Image-2026-08-13-at-12-31-11-PM.jpg', true, 7);

-- 3. Insert Products
INSERT INTO public.products (id, name, slug, description, category_id, price, sale_price, stock, low_stock_threshold, availability, featured, new_arrival, active) VALUES
-- cat_1 (A Line Midi Dress)
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Aura Premium Linen Midi', 'aura-premium-linen-midi', 'Indulge in pure elegance with our Aura Linen Midi Dress. Tailored with a flared A-line silhouette, this dress features premium breathable linen fabric, dynamic side pockets, and an elegant round neck. Perfect for casual outings and evening brunches.', '11111111-1111-1111-1111-111111111111', 2899.00, 2299.00, 12, 5, 'in_stock', true, true, true),
('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'Scarlet Cotton Flare Midi', 'scarlet-cotton-flare-midi', 'Crafted in breathable premium cotton, this scarlet midi features subtle lace highlights, a comfortable flared tier, and an option to style with a matching fabric belt. Embrace comfort and high-end boutique ethnic aesthetics.', '11111111-1111-1111-1111-111111111111', 2599.00, NULL, 8, 5, 'in_stock', false, true, true),

-- cat_2 (Floral Kurti)
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Bloom Watercolor Floral Kurti', 'bloom-watercolor-floral-kurti', 'Adorned with pastel watercolor floral prints, this A-line Kurti is made from high-grade cotton-silk blend. It boasts elegant gather detailing at the waist, 3/4 sleeves, and delicate hand-embroidery around the keyhole neckline.', '22222222-2222-2222-2222-222222222222', 1899.00, 1499.00, 20, 5, 'in_stock', true, true, true),
('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'Mystique Blossom Georgette Kurti', 'mystique-blossom-georgette-kurti', 'A gorgeous flowing Georgette Kurti with an all-over floral print, premium butter-crepe lining, and subtle sequin accents. Its lightweight feel makes it ideal for festive daytime wear.', '22222222-2222-2222-2222-222222222222', 2199.00, 1799.00, 5, 5, 'few_left', false, false, true),

-- cat_3 (Aline Kurti)
('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Elegant Solid Rayon Aline Kurti', 'elegant-solid-rayon-aline-kurti', 'A minimalist classic for your ethnic wardrobe. Made from premium, heavy-weight rayon fabric, this solid A-line Kurti is designed with a V-neck, wooden buttons, and a clean structured drape.', '33333333-3333-3333-3333-333333333333', 1599.00, 1299.00, 15, 5, 'in_stock', false, false, true),
('c2c2c2c2-c2c2-c2c2-c2c2-c2c2a2a2a2a2', 'Earthy Chanderi Aline Kurti', 'earthy-chanderi-aline-kurti', 'Woven in premium Chanderi cotton-silk, this Kurti features a subtle golden border, a button-down front, and a soft matching lining. It represents a elegant fusion of heritage craftsmanship and modern silhouette.', '33333333-3333-3333-3333-333333333333', 2499.00, NULL, 6, 5, 'in_stock', true, false, true),

-- cat_4 (Anarkali)
('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'Royal Ivory Embroidered Anarkali', 'royal-ivory-embroidered-anarkali', 'Make a grand entrance with this premium Royal Ivory Anarkali suit. Crafted from fine georgette, this set features detailed hand-woven zari embroidery on the yoke, a 24-kali heavy flare, a matching churidar pants, and an organza dupatta with scalloped borders.', '44444444-4444-4444-4444-444444444444', 4999.00, 3999.00, 4, 5, 'few_left', true, true, true),
('d2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', 'Festive Crimson Anarkali Set', 'festive-crimson-anarkali-set', 'Drape yourself in festive luxury. This crimson red silk-blend Anarkali offers a elegant flare, gold foil print borders, and a beautiful georgette dupatta. Designed with comfortable elastic waist adjustments.', '44444444-4444-4444-4444-444444444444', 4299.00, NULL, 5, 5, 'few_left', false, false, true),

-- cat_5 (Codeset)
('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'Modern Pastel Co-ord Set', 'modern-pastel-co-ord-set', 'An elegant two-piece coordinate set that redefines daily ethnic chic. Crafted from ultra-soft cotton modal, the set features a high-low tunic shirt with delicate pintuck detailing and straight comfort pants.', '55555555-5555-5555-5555-555555555555', 2999.00, 2499.00, 14, 5, 'in_stock', true, true, true),
('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', 'Indigo Ikkat Modal Codeset', 'indigo-ikkat-modal-codeset', 'Make a contemporary statement with our hand-block printed indigo Ikkat codeset. Crafted in rich cotton modal fabric, it features a collared top with pockets and comfortable wide-leg trousers.', '55555555-5555-5555-5555-555555555555', 3200.00, 2800.00, 9, 5, 'in_stock', false, false, true),

-- cat_6 (Tissue Silk Kasavu Kurta)
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'Golden Tissue Silk Kasavu Kurta', 'golden-tissue-silk-kasavu-kurta', 'A heritage masterpiece for your collection. Woven by master weavers, this premium Tissue Silk Kasavu kurta features a gorgeous shimmering texture, a clean gold zari neckline, and elegant borders. Perfect for celebrations.', '66666666-6666-6666-6666-666666666666', 3499.00, 2999.00, 3, 5, 'few_left', true, true, true),
('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', 'Premium Rose Gold Tissue Kurta', 'premium-rose-gold-tissue-kurta', 'A modern variation of the classic Kasavu style. Crafted in fine tissue silk with rose-gold metallic threads, this elegant kurta offers a clean fit and soft luster.', '66666666-6666-6666-6666-666666666666', 3899.00, NULL, 6, 5, 'in_stock', false, true, true),

-- cat_7 (Normal Kurti)
('g1g1g1g1-g1g1-g1g1-g1g1-g1g1g1g1g1g1', 'Aura Daily Normal Kurti', 'aura-daily-normal-kurti', 'Elegant daily wear normal kurti crafted for a comfortable and graceful everyday look. Easy-care breathable cotton fabric.', '77777777-7777-7777-7777-777777777777', 1299.00, 999.00, 15, 5, 'in_stock', true, true, true),
('g2g2g2g2-g2g2-g2g2-g2g2-g2g2g2g2g2g2', 'Relaxed Indigo Daily Kurti', 'relaxed-indigo-daily-kurti', 'Simple and comfortable daily cotton kurti in a relaxed A-line fit. Traditional handprinted patterns on organic cotton.', '77777777-7777-7777-7777-777777777777', 1499.00, NULL, 10, 5, 'in_stock', false, true, true);

-- 4. Insert Product Sizes
INSERT INTO public.product_sizes (product_id, size, stock, status) VALUES
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'XS', 2, 'available'),
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'S', 3, 'available'),
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'M', 4, 'available'),
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'L', 0, 'sold_out'),
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'XL', 3, 'available'),

('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'XS', 1, 'few_left'),
('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'S', 2, 'available'),
('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'M', 2, 'available'),
('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'L', 2, 'available'),
('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'XL', 1, 'few_left'),

('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'XS', 4, 'available'),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'S', 4, 'available'),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'M', 4, 'available'),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'L', 4, 'available'),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'XL', 4, 'available'),

('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'XS', 1, 'few_left'),
('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'S', 1, 'few_left'),
('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'M', 1, 'few_left'),
('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'L', 1, 'few_left'),
('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'XL', 1, 'few_left'),

('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'XS', 3, 'available'),
('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'S', 3, 'available'),
('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'M', 3, 'available'),
('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'L', 3, 'available'),
('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'XL', 3, 'available'),

('c2c2c2c2-c2c2-c2c2-c2c2-c2c2a2a2a2a2', 'XS', 1, 'few_left'),
('c2c2c2c2-c2c2-c2c2-c2c2-c2c2a2a2a2a2', 'S', 1, 'few_left'),
('c2c2c2c2-c2c2-c2c2-c2c2-c2c2a2a2a2a2', 'M', 2, 'available'),
('c2c2c2c2-c2c2-c2c2-c2c2-c2c2a2a2a2a2', 'L', 1, 'few_left'),
('c2c2c2c2-c2c2-c2c2-c2c2-c2c2a2a2a2a2', 'XL', 1, 'few_left'),

('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'XS', 1, 'few_left'),
('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'S', 1, 'few_left'),
('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'M', 1, 'few_left'),
('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'L', 0, 'sold_out'),
('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'XL', 1, 'few_left'),

('d2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', 'XS', 1, 'few_left'),
('d2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', 'S', 1, 'few_left'),
('d2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', 'M', 1, 'few_left'),
('d2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', 'L', 1, 'few_left'),
('d2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', 'XL', 1, 'few_left'),

('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'XS', 2, 'available'),
('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'S', 3, 'available'),
('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'M', 3, 'available'),
('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'L', 3, 'available'),
('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'XL', 3, 'available'),

('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', 'XS', 1, 'few_left'),
('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', 'S', 2, 'available'),
('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', 'M', 2, 'available'),
('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', 'L', 2, 'available'),
('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', 'XL', 2, 'available'),

('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'XS', 0, 'sold_out'),
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'S', 1, 'few_left'),
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'M', 1, 'few_left'),
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'L', 1, 'few_left'),
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'XL', 0, 'sold_out'),

('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', 'XS', 1, 'few_left'),
('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', 'S', 1, 'few_left'),
('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', 'M', 2, 'available'),
('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', 'L', 1, 'few_left'),
('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', 'XL', 1, 'few_left'),

('g1g1g1g1-g1g1-g1g1-g1g1-g1g1g1g1g1g1', 'XS', 3, 'available'),
('g1g1g1g1-g1g1-g1g1-g1g1-g1g1g1g1g1g1', 'S', 3, 'available'),
('g1g1g1g1-g1g1-g1g1-g1g1-g1g1g1g1g1g1', 'M', 3, 'available'),
('g1g1g1g1-g1g1-g1g1-g1g1-g1g1g1g1g1g1', 'L', 3, 'available'),
('g1g1g1g1-g1g1-g1g1-g1g1-g1g1g1g1g1g1', 'XL', 3, 'available'),

('g2g2g2g2-g2g2-g2g2-g2g2-g2g2g2g2g2g2', 'XS', 2, 'available'),
('g2g2g2g2-g2g2-g2g2-g2g2-g2g2g2g2g2g2', 'S', 2, 'available'),
('g2g2g2g2-g2g2-g2g2-g2g2-g2g2g2g2g2g2', 'M', 2, 'available'),
('g2g2g2g2-g2g2-g2g2-g2g2-g2g2g2g2g2g2', 'L', 2, 'available'),
('g2g2g2g2-g2g2-g2g2-g2g2-g2g2g2g2g2g2', 'XL', 2, 'available');

-- 5. Insert Product Images (Hosted on ImgBB/Existing assets)
INSERT INTO public.product_images (product_id, image_url, display_order, is_primary) VALUES
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'https://i.ibb.co/1fFmfKNH/Whats-App-Image-2026-08-13-at-12-31-10-PM-1.jpg', 1, true),
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'https://i.ibb.co/xKv6CbTm/Whats-App-Image-2026-08-13-at-12-31-10-PM-2.jpg', 2, false),
('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'https://i.ibb.co/1fFmfKNH/Whats-App-Image-2026-08-13-at-12-31-10-PM-1.jpg', 1, true),

('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'https://i.ibb.co/xKv6CbTm/Whats-App-Image-2026-08-13-at-12-31-10-PM-2.jpg', 1, true),
('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'https://i.ibb.co/xKv6CbTm/Whats-App-Image-2026-08-13-at-12-31-10-PM-2.jpg', 1, true),

('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'https://i.ibb.co/WLLgp05/image.png', 1, true),
('c2c2c2c2-c2c2-c2c2-c2c2-c2c2a2a2a2a2', 'https://i.ibb.co/WLLgp05/image.png', 1, true),

('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'https://i.ibb.co/27MzMz7X/image.png', 1, true),
('d2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', 'https://i.ibb.co/27MzMz7X/image.png', 1, true),

('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'https://i.ibb.co/chvqjqFZ/image.png', 1, true),
('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', 'https://i.ibb.co/chvqjqFZ/image.png', 1, true),

('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'https://i.ibb.co/ksFkWrhx/image.png', 1, true),
('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', 'https://i.ibb.co/ksFkWrhx/image.png', 1, true),

('g1g1g1g1-g1g1-g1g1-g1g1-g1g1g1g1g1g1', 'https://i.ibb.co/SDVwW6vy/Whats-App-Image-2026-08-13-at-12-31-11-PM.jpg', 1, true),
('g2g2g2g2-g2g2-g2g2-g2g2-g2g2g2g2g2g2', 'https://i.ibb.co/SDVwW6vy/Whats-App-Image-2026-08-13-at-12-31-11-PM.jpg', 1, true);

-- 6. Insert Coupons
INSERT INTO public.coupons (code, type, value, min_order_amount, expiry_date, active) VALUES
('PETALS10', 'percentage', 10.00, 999.00, now() + interval '30 days', true),
('WELCOME150', 'fixed', 150.00, 1499.00, now() + interval '90 days', true);
