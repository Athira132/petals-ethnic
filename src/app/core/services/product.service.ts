import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  categories$: Observable<Category[]> = this.categoriesSubject.asObservable();

  private cachedProducts: Product[] | null = null;
  private cachedCategories: Category[] | null = null;

  constructor(private supabaseService: SupabaseService) {
    this.refreshCategories(false);
    this.getProducts().catch(e => console.warn('Preload products notice:', e));
  }

  clearCache() {
    this.cachedProducts = null;
    this.cachedCategories = null;
  }

  getCachedCategoriesSync(): Category[] | null {
    return this.cachedCategories;
  }

  getProductsSync(options: ProductFilterOptions = {}): Product[] | null {
    if (!this.cachedProducts) return null;
    let products = [...this.cachedProducts];

    if (options.activeOnly !== false) {
      products = products.filter(p => p.active !== false);
    }
    if (options.categoryId) {
      products = products.filter(p => p.category_id === options.categoryId);
    }
    if (options.featuredOnly) {
      products = products.filter(p => p.featured);
    }
    if (options.newArrivalOnly) {
      products = products.filter(p => p.new_arrival);
    }
    if (options.bestSellerOnly) {
      products = products.filter(p => p.best_seller);
    }
    if (options.minPrice !== undefined && options.minPrice !== null) {
      products = products.filter(p => p.price >= options.minPrice!);
    }
    if (options.maxPrice !== undefined && options.maxPrice !== null) {
      products = products.filter(p => p.price <= options.maxPrice!);
    }
    if (options.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase().trim();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      );
    }
    if (options.sortBy === 'price-low') {
      products.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (options.sortBy === 'price-high') {
      products.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (options.sortBy === 'featured') {
      products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return products;
  }

  // ==========================================
  // CATEGORIES MANAGEMENT
  // ==========================================
  async getCategories(activeOnly = true): Promise<Category[]> {
    if (this.cachedCategories && this.cachedCategories.length > 0) {
      return activeOnly ? this.cachedCategories.filter(c => c.active) : this.cachedCategories;
    }
    try {
      let query = this.supabaseService.supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (activeOnly) {
        query = query.eq('active', true);
      }

      const { data, error } = await query;
      if (!error && data) {
        this.categoriesSubject.next(data);
        return data;
      }
    } catch (e) {
      console.warn('Direct category query failed, falling back to API:', e);
    }

    try {
      const res = await fetch('/api/admin-category');
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const resData = await res.json();
        if (resData.success && resData.categories) {
          let cats = resData.categories as Category[];
          if (activeOnly) {
            cats = cats.filter(c => c.active);
          }
          this.categoriesSubject.next(cats);
          return cats;
        }
      }
    } catch (e) {
      console.error('API category fallback error:', e);
    }

    return [];
  }

  async refreshCategories(activeOnly = false): Promise<Category[]> {
    return this.getCategories(activeOnly);
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const categories = await this.getCategories(false);
    return categories.find(c => c.slug === slug) || null;
  }

  async createCategory(category: Partial<Category>): Promise<Category> {
    const rawName = (category.name || '').trim();
    if (!rawName) throw new Error('Category Name is required.');

    let rawSlug = (category.slug || '').trim().toLowerCase();
    if (!rawSlug) {
      rawSlug = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const categories = await this.getCategories(false);
    const existing = categories.find(c => c.slug === rawSlug);
    if (existing) {
      throw new Error(`This category slug '${rawSlug}' ('${existing.name}') already exists.`);
    }

    const payload: any = {
      name: rawName,
      slug: rawSlug,
      description: category.description ? category.description.trim() : null,
      image_url: (category.image_url && category.image_url.trim()) ? category.image_url.trim() : null,
      active: category.active !== false,
      display_order: Number(category.display_order) || 0
    };

    const { data, error } = await this.supabaseService.supabase
      .from('categories')
      .insert([payload])
      .select()
      .single();

    if (!error && data) {
      await this.refreshCategories(false);
      return data;
    }

    console.warn('Direct Supabase category insert notice, using API endpoint:', error?.message);

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

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || error?.message || 'Failed to create category.');
      }
      await this.refreshCategories(false);
      return resData.category;
    } else {
      throw new Error(error?.message || 'Failed to create category in database.');
    }
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
      await this.refreshCategories(false);
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

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || error?.message || 'Failed to update category.');
      }
      await this.refreshCategories(false);
      return resData.category;
    } else {
      throw new Error(error?.message || 'Failed to update category.');
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    const { error } = await this.supabaseService.supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (!error) {
      await this.refreshCategories(false);
      return true;
    }

    const session = (await this.supabaseService.supabase.auth.getSession()).data.session;
    const token = session ? session.access_token : '';

    const res = await fetch(`/api/admin-category?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || error?.message || 'Failed to delete category.');
      }
      await this.refreshCategories(false);
      return true;
    } else {
      throw new Error(error?.message || 'Failed to delete category.');
    }
  }

  // ==========================================
  // PRODUCTS MANAGEMENT
  // ==========================================
  async getProducts(options: ProductFilterOptions = {}): Promise<Product[]> {
    if (!this.cachedProducts) {
      let fetched: Product[] = [];
      try {
        const { data, error } = await this.supabaseService.supabase
          .from('products')
          .select(`
            *,
            category:categories(*),
            images:product_images(*),
            sizes:product_sizes(*)
          `)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          fetched = data;
        }
      } catch (e) {
        console.warn('Direct product query notice, using API fallback:', e);
      }

      if (fetched.length === 0) {
        try {
          const res = await fetch('/api/admin-product');
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const resData = await res.json();
            if (resData.success && resData.products) {
              fetched = resData.products as Product[];
            }
          }
        } catch (e) {
          console.error('API product fallback error:', e);
        }
      }

      this.cachedProducts = fetched;
    }

    let products = [...(this.cachedProducts || [])];

    if (options.activeOnly !== false) {
      products = products.filter(p => p.active !== false);
    }

    if (options.categoryId) {
      products = products.filter(p => p.category_id === options.categoryId);
    }

    if (options.featuredOnly) {
      products = products.filter(p => p.featured);
    }

    if (options.newArrivalOnly) {
      products = products.filter(p => p.new_arrival);
    }

    if (options.bestSellerOnly) {
      products = products.filter(p => p.best_seller);
    }

    if (options.minPrice !== undefined && options.minPrice !== null) {
      products = products.filter(p => p.price >= options.minPrice!);
    }

    if (options.maxPrice !== undefined && options.maxPrice !== null) {
      products = products.filter(p => p.price <= options.maxPrice!);
    }

    if (options.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase().trim();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      );
    }

    if (options.sortBy === 'price-low') {
      products.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (options.sortBy === 'price-high') {
      products.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (options.sortBy === 'featured') {
      products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return products;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getProducts({ activeOnly: false });
    return products.find(p => p.slug === slug) || null;
  }

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts({ activeOnly: false });
    return products.find(p => p.id === id) || null;
  }

  async createProduct(
    productData: Partial<Product>, 
    images: string[], 
    sizes: { size: ProductSize; stock: number }[]
  ): Promise<Product> {
    const rawName = (productData.name || '').trim();
    if (!rawName) throw new Error('Product Title is required.');

    let rawSlug = (productData.slug || '').trim().toLowerCase();
    if (!rawSlug) {
      rawSlug = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const totalStock = sizes.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);

    const productPayload: any = {
      name: rawName,
      slug: rawSlug,
      description: productData.description ? productData.description.trim() : null,
      price: Number(productData.price) || 0,
      sale_price: productData.sale_price ? Number(productData.sale_price) : null,
      sku: productData.sku ? productData.sku.trim() : null,
      category_id: productData.category_id || null,
      featured: Boolean(productData.featured),
      new_arrival: Boolean(productData.new_arrival),
      best_seller: Boolean(productData.best_seller),
      active: productData.active !== false,
      stock: totalStock,
      availability: totalStock > 0 ? 'in_stock' : 'sold_out'
    };

    // 1. Try direct Supabase insert
    try {
      const { data: insertedProduct, error: prodErr } = await this.supabaseService.supabase
        .from('products')
        .insert([productPayload])
        .select()
        .single();

      if (!prodErr && insertedProduct) {
        const productId = insertedProduct.id;

        if (images && images.length > 0) {
          const imagePayloads = images.map((imgUrl, idx) => ({
            product_id: productId,
            image_url: imgUrl.trim(),
            is_primary: idx === 0,
            display_order: idx + 1
          }));
          await this.supabaseService.supabase.from('product_images').insert(imagePayloads);
        }

        if (sizes && sizes.length > 0) {
          const sizePayloads = sizes.map(sz => ({
            product_id: productId,
            size: sz.size,
            stock: Number(sz.stock) || 0,
            stock_quantity: Number(sz.stock) || 0,
            is_available: (Number(sz.stock) || 0) > 0,
            status: (Number(sz.stock) || 0) > 0 ? 'in_stock' : 'sold_out'
          }));
          await this.supabaseService.supabase.from('product_sizes').insert(sizePayloads);
        }

        this.clearCache();
        return (await this.getProductById(productId)) as Product;
      }
    } catch (e) {
      console.warn('Direct product creation notice, using API endpoint:', e);
    }

    // 2. Fallback to serverless API endpoint
    const session = (await this.supabaseService.supabase.auth.getSession()).data.session;
    const token = session ? session.access_token : '';

    const res = await fetch('/api/admin-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productPayload, images, sizes })
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to create product in database.');
      }
      this.clearCache();
      return resData.product;
    } else {
      throw new Error('Failed to create product in database.');
    }
  }

  async updateProduct(
    id: string, 
    productData: Partial<Product>, 
    images?: string[], 
    sizes?: { size: ProductSize; stock: number }[]
  ): Promise<Product> {
    const totalStock = sizes ? sizes.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0) : undefined;

    const productPayload: any = {
      updated_at: new Date().toISOString()
    };

    if (productData.name) productPayload.name = productData.name.trim();
    if (productData.slug) productPayload.slug = productData.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (productData.description !== undefined) productPayload.description = productData.description ? productData.description.trim() : null;
    if (productData.price !== undefined) productPayload.price = Number(productData.price);
    if (productData.sale_price !== undefined) productPayload.sale_price = productData.sale_price ? Number(productData.sale_price) : null;
    if (productData.sku !== undefined) productPayload.sku = productData.sku ? productData.sku.trim() : null;
    if (productData.category_id !== undefined) productPayload.category_id = productData.category_id || null;
    if (productData.featured !== undefined) productPayload.featured = Boolean(productData.featured);
    if (productData.new_arrival !== undefined) productPayload.new_arrival = Boolean(productData.new_arrival);
    if (productData.best_seller !== undefined) productPayload.best_seller = Boolean(productData.best_seller);
    if (productData.active !== undefined) productPayload.active = Boolean(productData.active);

    if (totalStock !== undefined) {
      productPayload.stock = totalStock;
      productPayload.availability = totalStock > 0 ? 'in_stock' : 'sold_out';
    }

    // 1. Try direct Supabase update
    try {
      const { error: updErr } = await this.supabaseService.supabase
        .from('products')
        .update(productPayload)
        .eq('id', id);

      if (!updErr) {
        if (images !== undefined) {
          await this.supabaseService.supabase.from('product_images').delete().eq('product_id', id);
          if (images.length > 0) {
            const imagePayloads = images.map((imgUrl, idx) => ({
              product_id: id,
              image_url: imgUrl.trim(),
              is_primary: idx === 0,
              display_order: idx + 1
            }));
            await this.supabaseService.supabase.from('product_images').insert(imagePayloads);
          }
        }

        if (sizes !== undefined) {
          await this.supabaseService.supabase.from('product_sizes').delete().eq('product_id', id);
          if (sizes.length > 0) {
            const sizePayloads = sizes.map(sz => ({
              product_id: id,
              size: sz.size,
              stock: Number(sz.stock) || 0,
              stock_quantity: Number(sz.stock) || 0,
              is_available: (Number(sz.stock) || 0) > 0,
              status: (Number(sz.stock) || 0) > 0 ? 'in_stock' : 'sold_out'
            }));
            await this.supabaseService.supabase.from('product_sizes').insert(sizePayloads);
          }
        }

        this.clearCache();
        return (await this.getProductById(id)) as Product;
      }
    } catch (e) {
      console.warn('Direct product update notice, using API endpoint:', e);
    }

    // 2. Fallback to serverless API endpoint
    const session = (await this.supabaseService.supabase.auth.getSession()).data.session;
    const token = session ? session.access_token : '';

    const res = await fetch('/api/admin-product', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id, productPayload, images, sizes })
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to update product in database.');
      }
      this.clearCache();
      return resData.product;
    } else {
      throw new Error('Failed to update product in database.');
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    if (!id) {
      throw new Error('Product ID is required for deletion.');
    }

    this.clearCache();

    // 1. Try serverless admin API endpoint first (bypasses RLS with full authority)
    try {
      const session = (await this.supabaseService.supabase.auth.getSession()).data.session;
      const token = session ? session.access_token : '';

      const res = await fetch(`/api/admin-product?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const resData = await res.json();
        if (res.ok && resData.success) {
          this.clearCache();
          return true;
        }
        if (resData.error) {
          console.warn('Admin API delete returned error, attempting direct client fallback:', resData.error);
        }
      }
    } catch (e) {
      console.warn('Admin API deletion request notice:', e);
    }

    // 2. Direct client Supabase fallback (clearing child tables first)
    await this.supabaseService.supabase.from('product_images').delete().eq('product_id', id);
    await this.supabaseService.supabase.from('product_sizes').delete().eq('product_id', id);
    await this.supabaseService.supabase.from('cart_items').delete().eq('product_id', id);
    await this.supabaseService.supabase.from('wishlist_items').delete().eq('product_id', id);

    const { error } = await this.supabaseService.supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase direct deletion failed:', error);
      throw new Error('Unable to delete product from database: ' + error.message);
    }

    this.clearCache();
    return true;
  }

  async updateSizeStock(sizeId: string, stock: number): Promise<boolean> {
    const qty = Number(stock) || 0;
    const { error } = await this.supabaseService.supabase
      .from('product_sizes')
      .update({
        stock: qty,
        stock_quantity: qty,
        is_available: qty > 0,
        status: qty === 0 ? 'sold_out' : (qty <= 5 ? 'few_left' : 'in_stock'),
        updated_at: new Date().toISOString()
      })
      .eq('id', sizeId);

    if (error) throw error;
    return true;
  }

  /**
   * Uploads product image file to ImgBB securely via backend serverless endpoint
   */
  async uploadProductImage(file: File): Promise<string> {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      throw new Error('Unsupported image format. Allowed formats: JPG, PNG, WEBP.');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('Image is too large. Maximum allowed file size is 10MB.');
    }

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

    const res = await fetch('/api/imgbb-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: base64 })
    });

    const data = await res.json();
    if (!res.ok || !data.success || !data.url) {
      throw new Error(data.error || 'ImgBB upload request failed.');
    }

    return data.url;
  }
}
