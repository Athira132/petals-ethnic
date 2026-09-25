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
  // PARSING & COMPATIBILITY HELPERS
  // ==========================================
  parseCategoryMeta(category: any): Category {
    if (!category) return category;
    const c: Category = { ...category };

    // Resolve department
    if (!c.department) {
      if (c.description && c.description.includes('<!--DEPT:')) {
        const match = c.description.match(/<!--DEPT:(ethnic|jewellery)-->/);
        if (match && match[1]) {
          c.department = match[1] as 'ethnic' | 'jewellery';
          c.description = c.description.replace(/<!--DEPT:(ethnic|jewellery)-->/, '').trim();
        }
      }
      if (!c.department) {
        const isJewellery = /jewel|necklace|earring|bangle|ring|bracelet|chain|pendant|anklet|choker|antique/i.test((c.slug || '') + ' ' + (c.name || ''));
        c.department = isJewellery ? 'jewellery' : 'ethnic';
      }
    }
    return c;
  }

  parseProductMeta(product: any): Product {
    if (!product) return product;
    const p: Product = { ...product };

    if (p.category) {
      p.category = this.parseCategoryMeta(p.category);
    }

    // Parse fallback <!--PRODUCT_META:...--> tag from description if exists
    if (p.description && p.description.includes('<!--PRODUCT_META:')) {
      try {
        const match = p.description.match(/<!--PRODUCT_META:([\s\S]*?)-->/);
        if (match && match[1]) {
          const meta = JSON.parse(match[1]);
          if (p.has_size === undefined && meta.has_size !== undefined) p.has_size = meta.has_size;
          if (p.show_size_chart === undefined && meta.show_size_chart !== undefined) p.show_size_chart = meta.show_size_chart;
          if (!p.size_chart_url && meta.size_chart_url) p.size_chart_url = meta.size_chart_url;
          if (!p.purchase_mode && meta.purchase_mode) p.purchase_mode = meta.purchase_mode;
          if (!p.video_url && meta.video_url) p.video_url = meta.video_url;
          if (p.has_colors === undefined && meta.has_colors !== undefined) p.has_colors = meta.has_colors;
          if ((!p.color_variants || p.color_variants.length === 0) && meta.color_variants) p.color_variants = meta.color_variants;
          if (!p.stock_display && meta.stock_display) p.stock_display = meta.stock_display;
          if (!p.custom_stock_message && meta.custom_stock_message) p.custom_stock_message = meta.custom_stock_message;
          if (!p.return_policy && meta.return_policy) p.return_policy = meta.return_policy;
          if (!p.department && meta.department) p.department = meta.department;

          p.description = p.description.replace(/<!--PRODUCT_META:[\s\S]*?-->/, '').trim();
        }
      } catch (e) {
        console.warn('Error parsing product meta tag:', e);
      }
    }

    // Department inference if missing
    if (!p.department) {
      if (p.category?.department) {
        p.department = p.category.department;
      } else {
        const catName = (p.category?.name || '').toLowerCase();
        const catSlug = (p.category?.slug || '').toLowerCase();
        const prodName = (p.name || '').toLowerCase();
        const isJewellery = /jewel|necklace|earring|bangle|ring|bracelet|chain|pendant|anklet|choker|antique/i.test(catName + ' ' + catSlug + ' ' + prodName);
        p.department = isJewellery ? 'jewellery' : 'ethnic';
      }
    }

    // Default fallbacks
    if (p.has_size === undefined || p.has_size === null) {
      p.has_size = p.department !== 'jewellery';
    }
    if (p.show_size_chart === undefined || p.show_size_chart === null) {
      p.show_size_chart = false;
    }
    if (!p.purchase_mode) {
      p.purchase_mode = 'online';
    }
    if (p.has_colors === undefined || p.has_colors === null) {
      p.has_colors = Boolean(p.color_variants && p.color_variants.length > 0);
    }
    if (!p.color_variants) {
      p.color_variants = [];
    }
    if (!p.stock_display) {
      p.stock_display = 'normal';
    }

    return p;
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
        const parsed = data.map(c => this.parseCategoryMeta(c));
        this.cachedCategories = parsed;
        this.categoriesSubject.next(parsed);
        return activeOnly ? parsed.filter(c => c.active) : parsed;
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
          let cats = (resData.categories as any[]).map(c => this.parseCategoryMeta(c));
          this.cachedCategories = cats;
          this.categoriesSubject.next(cats);
          return activeOnly ? cats.filter(c => c.active) : cats;
        }
      }
    } catch (e) {
      console.error('API category fallback error:', e);
    }

    return [];
  }

  async refreshCategories(activeOnly = false): Promise<Category[]> {
    this.cachedCategories = null;
    return this.getCategories(activeOnly);
  }

  addCategoryToCache(category: Category) {
    const parsed = this.parseCategoryMeta(category);
    if (!this.cachedCategories) {
      this.cachedCategories = [parsed];
    } else {
      const idx = this.cachedCategories.findIndex(c => c.id === parsed.id);
      if (idx >= 0) {
        this.cachedCategories[idx] = { ...parsed };
      } else {
        this.cachedCategories = [parsed, ...this.cachedCategories];
      }
    }
    this.categoriesSubject.next([...this.cachedCategories]);
  }

  updateCategoryInCache(category: Category) {
    const parsed = this.parseCategoryMeta(category);
    if (!this.cachedCategories) {
      this.cachedCategories = [parsed];
    } else {
      const idx = this.cachedCategories.findIndex(c => c.id === parsed.id);
      if (idx >= 0) {
        this.cachedCategories[idx] = { ...this.cachedCategories[idx], ...parsed };
      } else {
        this.cachedCategories = [...this.cachedCategories, parsed];
      }
    }
    this.categoriesSubject.next([...this.cachedCategories]);
  }

  removeCategoryFromCache(id: string) {
    if (this.cachedCategories) {
      this.cachedCategories = this.cachedCategories.filter(c => c.id !== id);
      this.categoriesSubject.next([...this.cachedCategories]);
    }
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

    const dept = category.department || 'ethnic';
    const payload: any = {
      name: rawName,
      slug: rawSlug,
      department: dept,
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
      const parsed = this.parseCategoryMeta(data);
      this.addCategoryToCache(parsed);
      return parsed;
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
      const parsed = this.parseCategoryMeta(resData.category);
      this.addCategoryToCache(parsed);
      return parsed;
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
    if (category.department !== undefined) payload.department = category.department;
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
      const parsed = this.parseCategoryMeta(data);
      this.updateCategoryInCache(parsed);
      return parsed;
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
      const parsed = this.parseCategoryMeta(resData.category);
      this.updateCategoryInCache(parsed);
      return parsed;
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
      this.removeCategoryFromCache(id);
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
      this.removeCategoryFromCache(id);
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
          fetched = data.map(p => this.parseProductMeta(p));
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
              fetched = (resData.products as any[]).map(p => this.parseProductMeta(p));
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

  async getProductBySlug(slugKey: string): Promise<Product | null> {
    if (!slugKey) return null;
    const cleanKey = decodeURIComponent(slugKey).trim().toLowerCase();

    // 1. Instant memory cache lookup (by slug or by id)
    if (this.cachedProducts && this.cachedProducts.length > 0) {
      const found = this.cachedProducts.find(p => 
        (p.slug && p.slug.toLowerCase() === cleanKey) || 
        p.id === slugKey
      );
      if (found) return this.parseProductMeta(found);
    }

    // 2. Direct single-row database query
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugKey);
      let query = this.supabaseService.supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          sizes:product_sizes(*)
        `);

      if (isUuid) {
        query = query.eq('id', slugKey);
      } else {
        query = query.eq('slug', cleanKey);
      }

      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        return this.parseProductMeta(data as Product);
      }
    } catch (e) {
      console.warn('Direct product slug query notice:', e);
    }

    // 3. Fallback to full list search
    const products = await this.getProducts({ activeOnly: false });
    const match = products.find(p => 
      (p.slug && p.slug.toLowerCase() === cleanKey) || 
      p.id === slugKey
    ) || null;
    return match ? this.parseProductMeta(match) : null;
  }

  async getProductById(id: string): Promise<Product | null> {
    if (!id) return null;

    // 1. Instant memory cache lookup
    if (this.cachedProducts && this.cachedProducts.length > 0) {
      const found = this.cachedProducts.find(p => p.id === id);
      if (found) return this.parseProductMeta(found);
    }

    // 2. Direct single-row database query
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          sizes:product_sizes(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return this.parseProductMeta(data as Product);
      }
    } catch (e) {
      console.warn('Direct product ID query notice:', e);
    }

    // 3. Fallback to full list search
    const products = await this.getProducts({ activeOnly: false });
    const match = products.find(p => p.id === id) || null;
    return match ? this.parseProductMeta(match) : null;
  }

  addProductToCache(product: Product) {
    if (this.cachedProducts) {
      const idx = this.cachedProducts.findIndex(p => p.id === product.id);
      if (idx >= 0) {
        this.cachedProducts[idx] = product;
      } else {
        this.cachedProducts = [product, ...this.cachedProducts];
      }
    }
  }

  async createProduct(
    productData: Partial<Product>, 
    images: string[] = [], 
    sizes: { size: ProductSize; stock: number }[] = []
  ): Promise<Product> {
    const rawName = (productData.name || '').trim();
    if (!rawName) throw new Error('Product Name is required.');

    let rawSlug = (productData.slug || '').trim().toLowerCase();
    if (!rawSlug) {
      rawSlug = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const dept = productData.department || 'ethnic';
    const hasSize = productData.has_size !== undefined ? Boolean(productData.has_size) : (dept !== 'jewellery');
    const totalStock = hasSize
      ? sizes.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0)
      : (productData.stock !== undefined ? Number(productData.stock) : 10);

    const productPayload: any = {
      name: rawName,
      slug: rawSlug,
      description: productData.description ? productData.description.trim() : null,
      price: Number(productData.price) || 0,
      sale_price: productData.sale_price ? Number(productData.sale_price) : null,
      sku: productData.sku ? productData.sku.trim() : null,
      category_id: productData.category_id || null,
      department: dept,
      has_size: hasSize,
      show_size_chart: Boolean(productData.show_size_chart),
      size_chart_url: productData.size_chart_url || null,
      purchase_mode: productData.purchase_mode || 'online',
      video_url: productData.video_url || null,
      has_colors: Boolean(productData.has_colors),
      color_variants: productData.color_variants || [],
      stock_display: productData.stock_display || 'normal',
      custom_stock_message: productData.custom_stock_message || null,
      return_policy: productData.return_policy || null,
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

        const formattedImages = (images || []).map((imgUrl, idx) => ({
          product_id: productId,
          image_url: imgUrl.trim(),
          is_primary: idx === 0,
          display_order: idx + 1
        }));

        if (formattedImages.length > 0) {
          await this.supabaseService.supabase.from('product_images').insert(formattedImages);
        }

        if (hasSize && sizes && sizes.length > 0) {
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

        const categories = await this.getCategories(false);
        const cat = categories.find(c => c.id === insertedProduct.category_id);

        const fullProduct: Product = this.parseProductMeta({
          ...insertedProduct,
          category: cat,
          images: formattedImages,
          sizes: hasSize && sizes ? sizes.map(s => ({ size: s.size, stock: s.stock, status: s.stock > 0 ? 'available' : 'sold_out' })) : []
        });

        this.addProductToCache(fullProduct);
        return fullProduct;
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
      body: JSON.stringify({ productPayload, images, sizes: hasSize ? sizes : [] })
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const resData = await res.json();
      if (!res.ok || !resData.success || !resData.product) {
        throw new Error(resData.error || 'Failed to create product in database.');
      }
      const categories = await this.getCategories(false);
      const cat = categories.find(c => c.id === resData.product.category_id);
      const fullProduct: Product = this.parseProductMeta({
        ...resData.product,
        category: cat || resData.product.category
      });
      this.addProductToCache(fullProduct);
      return fullProduct;
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
    const hasSize = productData.has_size !== undefined ? Boolean(productData.has_size) : undefined;
    const totalStock = (sizes && sizes.length > 0)
      ? sizes.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0) 
      : (productData.stock !== undefined ? Number(productData.stock) : undefined);

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
    if (productData.department !== undefined) productPayload.department = productData.department;
    if (productData.has_size !== undefined) productPayload.has_size = Boolean(productData.has_size);
    if (productData.show_size_chart !== undefined) productPayload.show_size_chart = Boolean(productData.show_size_chart);
    if (productData.size_chart_url !== undefined) productPayload.size_chart_url = productData.size_chart_url;
    if (productData.purchase_mode !== undefined) productPayload.purchase_mode = productData.purchase_mode;
    if (productData.video_url !== undefined) productPayload.video_url = productData.video_url;
    if (productData.has_colors !== undefined) productPayload.has_colors = Boolean(productData.has_colors);
    if (productData.color_variants !== undefined) productPayload.color_variants = productData.color_variants;
    if (productData.stock_display !== undefined) productPayload.stock_display = productData.stock_display;
    if (productData.custom_stock_message !== undefined) productPayload.custom_stock_message = productData.custom_stock_message;
    if (productData.return_policy !== undefined) productPayload.return_policy = productData.return_policy;
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

        if (sizes !== undefined && (hasSize !== false)) {
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
        } else if (hasSize === false) {
          // If sizes disabled, clear sizes table for this product
          await this.supabaseService.supabase.from('product_sizes').delete().eq('product_id', id);
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
      return this.parseProductMeta(resData.product);
    } else {
      throw new Error('Failed to update product in database.');
    }
  }

  removeProductFromCache(id: string) {
    if (this.cachedProducts) {
      this.cachedProducts = this.cachedProducts.filter(p => p.id !== id);
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    if (!id || typeof id !== 'string') {
      throw new Error('Product ID is required for deletion.');
    }

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
          this.removeProductFromCache(id);
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
    try {
      await this.supabaseService.supabase.from('product_images').delete().eq('product_id', id);
      await this.supabaseService.supabase.from('product_sizes').delete().eq('product_id', id);
      await this.supabaseService.supabase.from('cart_items').delete().eq('product_id', id);
      await this.supabaseService.supabase.from('wishlist_items').delete().eq('product_id', id);
    } catch (childErr) {
      console.warn('Child tables deletion notice (continuing to product delete):', childErr);
    }

    const { error } = await this.supabaseService.supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase direct deletion failed:', error);
      throw new Error('Unable to delete product from database: ' + error.message);
    }

    this.removeProductFromCache(id);
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

  /**
   * Uploads category banner image file to ImgBB securely via backend serverless endpoint
   */
  async uploadCategoryImage(file: File): Promise<string> {
    return this.uploadProductImage(file);
  }
}
