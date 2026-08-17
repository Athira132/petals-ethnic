import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://giqngsukscyghqkjtijc.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_JHt31eRCBafVoRI-_LKswA_LZfAjyYr';

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase connection credentials are missing. Please verify that VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set in your local .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Data mapping helper to bridge PostgreSQL database models to React Frontend schemas
export const mapProduct = (p) => {
  if (!p) return null;
  let images = [];
  if (p.product_images && p.product_images.length > 0) {
    images = [...p.product_images].sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).map(img => img.image_url);
  } else if (p.additional_image_urls && p.additional_image_urls.length > 0) {
    images = [p.image_url, ...p.additional_image_urls].filter(Boolean);
  } else if (p.image_url) {
    images = [p.image_url];
  } else if (p.image_urls) {
    images = p.image_urls;
  }

  const effectiveStock = p.stock_quantity !== undefined ? p.stock_quantity : (p.stock !== undefined ? p.stock : 0);
  const effectiveActive = (p.is_active !== undefined ? p.is_active : p.active) !== false;
  const effectiveFeatured = p.is_featured !== undefined ? p.is_featured : p.featured;

  return {
    ...p,
    images,
    image_url: p.image_url || images[0] || '',
    categorySlug: p.categories?.slug || p.categorySlug || '',
    categoryName: p.categories?.name || '',
    stockCount: effectiveStock,
    stock_quantity: effectiveStock,
    isFeatured: effectiveFeatured || false,
    isNewArrival: p.new_arrival || false,
    isActive: effectiveActive && p.availability !== 'unavailable'
  };
};
