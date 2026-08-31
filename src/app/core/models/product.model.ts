import { Category } from './category.model';

export type SizeOption = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface ProductSize {
  id?: string;
  product_id?: string;
  size: SizeOption;
  stock: number;
  status: 'available' | 'few_left' | 'sold_out';
}

export interface ProductImage {
  id?: string;
  product_id?: string;
  image_url: string;
  thumbnail_url?: string | null;
  display_order?: number;
  is_primary?: boolean;
}

export interface Product {
  id: string;
  category_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  sale_price?: number | null;
  sku?: string | null;
  stock: number;
  low_stock_threshold?: number;
  availability: 'in_stock' | 'few_left' | 'sold_out' | 'unavailable';
  featured: boolean;
  new_arrival: boolean;
  best_seller?: boolean;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  category?: Category;
  images?: ProductImage[];
  sizes?: ProductSize[];
  image_url?: string | null;
  additional_image_urls?: string | null;
}
