import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase connection credentials are missing. Please verify that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your local .env file.'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Data mapping helper to bridge PostgreSQL database models to React Frontend schemas
export const mapProduct = (p) => {
  if (!p) return null;
  const images = p.product_images && p.product_images.length > 0
    ? [...p.product_images].sort((a, b) => a.display_order - b.display_order).map(img => img.image_url)
    : p.image_urls || [];
  return {
    ...p,
    images,
    categorySlug: p.categories?.slug || p.categorySlug || '',
    categoryName: p.categories?.name || '',
    stockCount: p.stock !== undefined ? p.stock : 0,
    isFeatured: p.featured || false,
    isNewArrival: p.new_arrival || false,
    isActive: p.active !== false && p.availability !== 'unavailable'
  };
};
