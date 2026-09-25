import { Category, DepartmentType } from './category.model';

export type SizeOption = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | string;
export type PurchaseMode = 'online' | 'enquiry';
export type StockDisplayMode = 'normal' | 'few_left' | 'custom' | 'hide';

export interface ColorVariant {
  name: string;
  color_code?: string;
  image_urls: string[];
  images?: string[];
  video_url?: string | null;
  stock?: number;
  sku?: string | null;
  is_available?: boolean;
}

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
  department?: DepartmentType;

  // Size configuration
  has_size?: boolean;
  show_size_chart?: boolean;
  size_chart_url?: string | null;

  // Color variations
  has_colors?: boolean;
  color_variants?: ColorVariant[];

  // Purchase mode
  purchase_mode?: PurchaseMode;

  // Stock display
  stock_display?: StockDisplayMode;
  custom_stock_message?: string | null;

  // Media
  video_url?: string | null;

  // Return policy
  return_policy?: string | null;

  created_at?: string;
  updated_at?: string;
  category?: Category;
  images?: ProductImage[];
  sizes?: ProductSize[];
  image_url?: string | null;
  additional_image_urls?: string | null;
}
