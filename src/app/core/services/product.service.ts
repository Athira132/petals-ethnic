import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Product, ProductImage, ProductSize } from '../models/product.model';
import { Category } from '../models/category.model';

export interface ProductFilterOptions {
  categoryId?: string;
  searchQuery?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'featured' | 'newest' | 'price-low' | 'price-high' | 'best-seller';
  featuredOnly?: boolean;
  newArrivalOnly?: boolean;
  bestSellerOnly?: boolean;
  activeOnly?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private supabaseService: SupabaseService) {}

  // ==========================================
  // CATEGORIES
  // ==========================================
  async getCategories(activeOnly = true): Promise<Category[]> {
    let query = this.supabaseService.supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (activeOnly) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
    return data || [];
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await this.supabaseService.supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching category by slug:', error);
      return null;
    }
    return data;
  }

  async createCategory(category: Partial<Category>): Promise<Category> {
    // 1. Sanitize payload
    const rawName = (category.name || '').trim();
    if (!rawName) throw new Error('Category Name is required.');

    let rawSlug = (category.slug || '').trim().toLowerCase();
    if (!rawSlug) {
      rawSlug = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const payload: any = {
      name: rawName,
      slug: rawSlug,
      description: category.description ? category.description.trim() : null,
      image_url: (category.image_url && category.image_url.trim()) ? category.image_url.trim() : null,
      active: category.active !== false,
      display_order: Number(category.display_order) || 0
    };

    // 2. Try direct Supabase insert
    const { data, error } = await this.supabaseService.supabase
      .from('categories')
      .insert([payload])
      .select()
      .single();

    if (!error && data) {
      return data;
    }

    console.warn('Direct Supabase category insert notice:', error?.message);

    // 3. Fallback to API endpoint if direct RLS returned policy violation or permission error
    const session = (await this.supabaseService.supabase.auth.getSession()).data.session;
    const token = session ? session.access_token : '';

    const res = await fetch('/api/admin-category', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const resData = await res.json();
    if (!res.ok || !resData.success) {
      throw new Error(resData.error || error?.message || 'Failed to create category.');
    }

    return resData.category;
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    const payload: any = {
      updated_at: new Date().toISOString()
    };

    if (category.name !== undefined) payload.name = category.name.trim();
    if (category.slug !== undefined) payload.slug = category.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (category.description !== undefined) payload.description = category.description ? category.description.trim() : null;
    if (category.image_url !== undefined) payload.image_url = (category.image_url && category.image_url.trim()) ? category.image_url.trim() : null;
    if (category.active !== undefined) payload.active = Boolean(category.active);
    if (category.display_order !== undefined) payload.display_order = Number(category.display_order);

    const { data, error } = await this.supabaseService.supabase
      .from('categories')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      return data;
    }

    const session = (await this.supabaseService.supabase.auth.getSession()).data.session;
    const token = session ? session.access_token : '';

    const res = await fetch('/api/admin-category', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id, ...payload })
    });

    const resData = await res.json();
    if (!res.ok || !resData.success) {
      throw new Error(resData.error || error?.message || 'Failed to update category.');
    }

    return resData.category;
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await this.supabaseService.supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (!error) return;

    const session = (await this.supabaseService.supabase.auth.getSession()).data.session;
    const token = session ? session.access_token : '';

    const res = await fetch(`/api/admin-category?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const resData = await res.json();
    if (!res.ok || !resData.success) {
      throw new Error(resData.error || error?.message || 'Failed to delete category.');
    }
  }

  // ==========================================
  // PRODUCTS
  // ==========================================
  async getProducts(options: ProductFilterOptions = {}): Promise<Product[]> {
    let query = this.supabaseService.supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        sizes:product_sizes(*)
      `);

    if (options.activeOnly !== false) {
      query = query.eq('active', true);
    }

    if (options.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options.featuredOnly) {
      query = query.eq('featured', true);
    }

    if (options.newArrivalOnly) {
      query = query.eq('new_arrival', true);
    }

    if (options.bestSellerOnly) {
      query = query.eq('best_seller', true);
    }

    if (options.searchQuery && options.searchQuery.trim() !== '') {
      query = query.ilike('name', `%${options.searchQuery.trim()}%`);
    }

    if (options.minPrice !== undefined && options.minPrice !== null) {
      query = query.gte('price', options.minPrice);
    }

    if (options.maxPrice !== undefined && options.maxPrice !== null) {
      query = query.lte('price', options.maxPrice);
    }

    // Sort order
    if (options.sortBy === 'price-low') {
      query = query.order('price', { ascending: true });
    } else if (options.sortBy === 'price-high') {
      query = query.order('price', { ascending: false });
    } else if (options.sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    let products: Product[] = data || [];

    // Filter by size if requested
    if (options.size) {
      products = products.filter(p => 
        p.sizes && p.sizes.some(s => s.size === options.size && s.stock > 0)
      );
    }

    return products;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await this.supabaseService.supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        sizes:product_sizes(*)
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching product by slug:', error);
      return null;
    }

    if (data && data.images) {
      data.images.sort((a: ProductImage, b: ProductImage) => (a.display_order || 0) - (b.display_order || 0));
    }

    return data;
  }

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await this.supabaseService.supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        sizes:product_sizes(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
    return data;
  }

  async createProduct(product: Partial<Product>, images: Partial<ProductImage>[], sizes: Partial<ProductSize>[]): Promise<Product> {
    const { data: newProd, error: prodErr } = await this.supabaseService.supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (prodErr) throw prodErr;

    const productId = newProd.id;

    if (images && images.length > 0) {
      const imgPayload = images.map((img, idx) => ({
        ...img,
        product_id: productId,
        display_order: idx + 1
      }));
      const { error: imgErr } = await this.supabaseService.supabase
        .from('product_images')
        .insert(imgPayload);
      if (imgErr) console.error('Error inserting product images:', imgErr);
    }

    if (sizes && sizes.length > 0) {
      const sizePayload = sizes.map(s => ({
        ...s,
        product_id: productId,
        status: (s.stock || 0) > 0 ? ((s.stock || 0) <= 5 ? 'few_left' : 'available') : 'sold_out'
      }));
      const { error: sizeErr } = await this.supabaseService.supabase
        .from('product_sizes')
        .insert(sizePayload);
      if (sizeErr) console.error('Error inserting product sizes:', sizeErr);
    }

    return await this.getProductById(productId) as Product;
  }

  async updateProduct(id: string, product: Partial<Product>, images?: Partial<ProductImage>[], sizes?: Partial<ProductSize>[]): Promise<Product> {
    const { error: prodErr } = await this.supabaseService.supabase
      .from('products')
      .update({ ...product, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (prodErr) throw prodErr;

    if (images !== undefined) {
      await this.supabaseService.supabase.from('product_images').delete().eq('product_id', id);
      if (images.length > 0) {
        const imgPayload = images.map((img, idx) => ({
          ...img,
          product_id: id,
          display_order: idx + 1
        }));
        await this.supabaseService.supabase.from('product_images').insert(imgPayload);
      }
    }

    if (sizes !== undefined) {
      await this.supabaseService.supabase.from('product_sizes').delete().eq('product_id', id);
      if (sizes.length > 0) {
        const sizePayload = sizes.map(s => ({
          ...s,
          product_id: id,
          status: (s.stock || 0) > 0 ? ((s.stock || 0) <= 5 ? 'few_left' : 'available') : 'sold_out'
        }));
        await this.supabaseService.supabase.from('product_sizes').insert(sizePayload);
      }
    }

    return await this.getProductById(id) as Product;
  }

  async updateSizeStock(sizeId: string, newStock: number): Promise<void> {
    const status = newStock > 0 ? (newStock <= 5 ? 'few_left' : 'available') : 'sold_out';
    const { error } = await this.supabaseService.supabase
      .from('product_sizes')
      .update({ stock: newStock, status, updated_at: new Date().toISOString() })
      .eq('id', sizeId);

    if (error) throw error;
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await this.supabaseService.supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
