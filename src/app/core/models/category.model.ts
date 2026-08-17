export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  active: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}
