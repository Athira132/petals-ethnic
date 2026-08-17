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
    const { data, error } = await this.supabaseService.supabase
      .from('categories')
      .insert([category])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    const { data, error } = await this.supabaseService.supabase
      .from('categories')
      .update({ ...category, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await this.supabaseService.supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
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
    // 1. Create main product row
    const { data: newProd, error: prodErr } = await this.supabaseService.supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (prodErr) throw prodErr;

    const productId = newProd.id;

    // 2. Insert Images
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

    // 3. Insert Sizes
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
    // 1. Update product main table
    const { error: prodErr } = await this.supabaseService.supabase
      .from('products')
      .update({ ...product, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (prodErr) throw prodErr;

    // 2. Update images if provided
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

    // 3. Update sizes if provided
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
