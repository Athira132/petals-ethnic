import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { Product, SizeOption } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { extractProductImages, parseImageUrlsInput, handleImageError, isIbbShareUrl, DEFAULT_FALLBACK_IMAGE } from '../../core/utils/image.utils';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="product-admin">
      <div class="header-flex">
        <div>
          <h1 class="page-title">Products Management</h1>
          <p class="page-subtitle">Create, edit, and deactivate store products and size inventory.</p>
        </div>
        <button type="button" (click)="openCreateModal()" class="btn-primary">
          + Create New Product
        </button>
      </div>

      <!-- Search & Filters Bar -->
      <div class="admin-filter-bar">
        <input 
          type="text" 
          placeholder="Search by product title or SKU..." 
          [(ngModel)]="searchQuery" 
          (input)="onSearch()" 
          class="form-control filter-input"
        />

        <select [(ngModel)]="selectedCategory" (change)="onSearch()" class="form-control filter-select">
          <option value="">All Categories</option>
          <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
        </select>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="error-card">
        <p>⚠️ {{ errorMessage }}</p>
        <button type="button" (click)="loadData()" class="btn-outline btn-sm">Retry Loading</button>
      </div>

      <!-- Products Table / Loading -->
      <div class="table-card" *ngIf="!errorMessage">
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title / SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Flags</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading Skeleton / Spinner State -->
              <tr *ngIf="isLoading">
                <td colspan="8" class="text-center loading-cell">
                  <div class="spinner"></div>
                  <span>Loading products...</span>
                </td>
              </tr>

              <!-- Product Data Rows -->
              <tr *ngFor="let prod of filteredProducts; trackBy: trackByProductId">
                <td>
                  <img [src]="getPrimaryImage(prod)" [alt]="prod.name" class="table-thumb" (error)="onImageError($event)" />
                </td>
                <td>
                  <strong>{{ prod.name }}</strong>
                  <div class="sku-text" *ngIf="prod.sku">SKU: {{ prod.sku }}</div>
                </td>
                <td>{{ prod.category?.name || 'Uncategorized' }}</td>
                <td>
                  <span *ngIf="prod.sale_price; else stdPrice">
                    <strong class="sale-price">₹{{ prod.sale_price }}</strong>
                    <small class="orig-price">₹{{ prod.price }}</small>
                  </span>
                  <ng-template #stdPrice>₹{{ prod.price }}</ng-template>
                </td>
                <td>
                  <span class="stock-badge" [class.out]="prod.stock === 0" [class.low]="prod.stock > 0 && prod.stock <= 5">
                    {{ prod.stock }} units
                  </span>
                </td>
                <td>
                  <span *ngIf="prod.featured" class="badge badge-pink">Featured</span>
                  <span *ngIf="prod.new_arrival" class="badge badge-gold">New</span>
                  <span *ngIf="prod.best_seller" class="badge badge-dark">Best Seller</span>
                </td>
                <td>
                  <span class="badge" [class.badge-pink]="prod.active" [class.badge-dark]="!prod.active">
                    {{ prod.active ? 'ACTIVE' : 'INACTIVE' }}
                  </span>
                </td>
                <td>
                  <div class="action-btn-group">
                    <button type="button" (click)="openEditModal(prod)" [disabled]="deletingId === prod.id" class="edit-btn" title="Edit">Edit</button>
                    <button type="button" (click)="deleteProduct($event, prod)" [disabled]="deletingId === prod.id" class="delete-btn" title="Delete">
                      {{ deletingId === prod.id ? 'Deleting...' : 'Delete' }}
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Genuine Empty State (Only after loading completes) -->
              <tr *ngIf="!isLoading && filteredProducts.length === 0">
                <td colspan="8" class="text-center empty-cell">No products found matching your filter criteria.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Product Form Modal -->
      <div class="modal-backdrop" *ngIf="isModalOpen">
        <div class="modal-box">
          <div class="modal-header">
            <h2>{{ editingProduct ? 'Edit Product' : 'Create New Product' }}</h2>
            <button type="button" (click)="closeModal()" class="close-modal-btn">&times;</button>
          </div>

          <form (ngSubmit)="saveProduct()" class="modal-body">
            <div class="form-row">
              <div class="form-group flex-2">
                <label class="form-label">Product Name *</label>
                <input type="text" [(ngModel)]="formProduct.name" name="name" required class="form-control" (input)="autoGenerateSlug()" />
              </div>

              <div class="form-group flex-1">
                <label class="form-label">Slug *</label>
                <input type="text" [(ngModel)]="formProduct.slug" name="slug" required class="form-control" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Category *</label>
                <select [(ngModel)]="formProduct.category_id" name="category_id" required class="form-control">
                  <option [value]="null">Select Category</option>
                  <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
                </select>
              </div>

              <div class="form-group flex-1">
                <label class="form-label">SKU</label>
                <input type="text" [(ngModel)]="formProduct.sku" name="sku" class="form-control" placeholder="PE-AN-001" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Regular Price (₹) *</label>
                <input type="number" [(ngModel)]="formProduct.price" name="price" required class="form-control" />
              </div>

              <div class="form-group flex-1">
                <label class="form-label">Sale Price (₹)</label>
                <input type="number" [(ngModel)]="formProduct.sale_price" name="sale_price" class="form-control" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea [(ngModel)]="formProduct.description" name="description" rows="3" class="form-control"></textarea>
            </div>

            <!-- Secure Product Image Upload & Direct URLs -->
            <div class="form-group">
              <label class="form-label">Upload Product Images (JPG, PNG, WEBP — Max 10MB)</label>
              <div class="file-upload-container">
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp" 
                  multiple 
                  (change)="onFileSelected($event)" 
                  [disabled]="isUploadingImages || isSaving"
                  class="form-control-file"
                />
                <div *ngIf="uploadStatusText" class="upload-status-badge" [class.error]="uploadHasError">
                  <span *ngIf="isUploadingImages" class="inline-spinner"></span>
                  {{ uploadStatusText }}
                </div>
              </div>
            </div>

            <!-- Image Direct URLs List -->
            <div class="form-group">
              <label class="form-label">Product Image Direct URLs (1 per line)</label>
              <textarea 
                [(ngModel)]="imageUrlsText" 
                name="imageUrlsText" 
                rows="3" 
                class="form-control" 
                placeholder="https://i.ibb.co/..."
              ></textarea>
            </div>

            <!-- Size Specific Stock Grid -->
            <div class="form-group">
              <label class="form-label">Size Inventory (XS to XXL Stock)</label>
              <div class="size-inputs-grid">
                <div *ngFor="let sz of formSizes" class="size-input-box">
                  <span class="sz-name">{{ sz.size }}</span>
                  <input type="number" [(ngModel)]="sz.stock" [name]="'size_' + sz.size" min="0" class="form-control sz-input" />
                </div>
              </div>
            </div>

            <!-- Toggles -->
            <div class="form-row margin-top-16">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="formProduct.featured" name="featured" />
                <span>Featured Product</span>
              </label>

              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="formProduct.new_arrival" name="new_arrival" />
                <span>New Arrival</span>
              </label>

              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="formProduct.best_seller" name="best_seller" />
                <span>Best Seller</span>
              </label>

              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="formProduct.active" name="active" />
                <span>Active Product</span>
              </label>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="closeModal()" class="btn-outline">Cancel</button>
              <button type="submit" [disabled]="isSaving || isUploadingImages" class="btn-primary">
                {{ isSaving ? 'Saving...' : (isUploadingImages ? 'Uploading Images...' : 'Save Product') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-title { font-size: 28px; margin-bottom: 4px; }
    .page-subtitle { font-size: 14px; color: var(--color-muted); }

    .admin-filter-bar { display: flex; gap: 16px; margin-bottom: 24px; }
    .filter-input { flex: 2; }
    .filter-select { flex: 1; }

    .error-card { background: #FFEBEE; border: 1px solid #FFCDD2; color: #C62828; padding: 20px; border-radius: var(--radius-md); margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
    .btn-sm { padding: 6px 12px; font-size: 12px; }

    .table-card { background: #FFFFFF; border: 1px solid var(--color-border-light); border-radius: var(--radius-md); }
    .table-responsive { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .admin-table th, .admin-table td { padding: 14px 16px; border-bottom: 1px solid var(--color-border-light); text-align: left; }
    .admin-table th { background-color: var(--color-bg-alt); font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--color-muted); }

    .loading-cell { padding: 40px 16px !important; color: var(--color-muted); font-size: 14px; }
    .empty-cell { padding: 30px 16px !important; color: var(--color-muted); }

    .spinner { width: 24px; height: 24px; border: 3px solid rgba(192, 86, 118, 0.2); border-top-color: #C05676; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 10px auto; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .table-thumb { width: 44px; height: 56px; object-fit: cover; border-radius: 4px; }
    .sku-text { font-size: 11px; color: var(--color-muted); }
    .sale-price { color: #C05676; margin-right: 6px; }
    .orig-price { font-size: 11px; text-decoration: line-through; color: var(--color-light-muted); }

    .stock-badge { font-weight: 600; color: #2E7D32; }
    .stock-badge.low { color: #E65100; }
    .stock-badge.out { color: #C62828; }

    .action-btn-group { display: flex; gap: 8px; }
    .edit-btn { color: #1976D2; font-size: 13px; font-weight: 500; background: transparent; border: none; cursor: pointer; }
    .edit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .delete-btn { color: #D32F2F; font-size: 13px; font-weight: 500; background: transparent; border: none; cursor: pointer; }
    .delete-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Modal */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .modal-box { background: #FFFFFF; width: 100%; max-width: 720px; max-height: 90vh; overflow-y: auto; border-radius: var(--radius-lg); padding: 32px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid var(--color-border-light); }
    .close-modal-btn { font-size: 28px; color: var(--color-muted); background: transparent; border: none; cursor: pointer; }

    .form-row { display: flex; gap: 16px; }
    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }

    .file-upload-container { display: flex; flex-direction: column; gap: 8px; }
    .form-control-file { padding: 8px; border: 1px dashed var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-alt); width: 100%; cursor: pointer; }

    .upload-status-badge { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; padding: 8px 12px; border-radius: var(--radius-sm); background: #E8F5E9; color: #2E7D32; border: 1px solid #C8E6C9; }
    .upload-status-badge.error { background: #FFEBEE; color: #C62828; border-color: #FFCDD2; }
    .inline-spinner { width: 14px; height: 14px; border: 2px solid rgba(46, 125, 50, 0.2); border-top-color: #2E7D32; border-radius: 50%; animation: spin 0.8s linear infinite; }

    .size-inputs-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
    .size-input-box { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .sz-name { font-size: 12px; font-weight: 700; }
    .sz-input { text-align: center; padding: 6px; }

    .checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; }
    .margin-top-16 { margin-top: 16px; }

    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--color-border-light); }
    .text-center { text-align: center; }
  `]
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];

  searchQuery = '';
  selectedCategory = '';

  isLoading = true;
  errorMessage = '';

  isModalOpen = false;
  editingProduct: Product | null = null;
  isSaving = false;
  deletingId: string | null = null;

  isUploadingImages = false;
  uploadStatusText = '';
  uploadHasError = false;

  private catSub?: Subscription;

  formProduct: Partial<Product> = {
    name: '',
    slug: '',
    description: '',
    price: 0,
    sale_price: null,
    sku: '',
    featured: false,
    new_arrival: true,
    active: true
  };

  imageUrlsText = '';
  formSizes: { size: SizeOption; stock: number }[] = [
    { size: 'XS', stock: 5 },
    { size: 'S', stock: 5 },
    { size: 'M', stock: 5 },
    { size: 'L', stock: 5 },
    { size: 'XL', stock: 5 },
    { size: 'XXL', stock: 5 }
  ];

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.catSub = this.productService.categories$.subscribe(cats => {
      this.categories = cats;
      this.cdr.markForCheck();
    });

    await this.loadData();
  }

  ngOnDestroy() {
    if (this.catSub) this.catSub.unsubscribe();
  }

  async loadData() {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    try {
      this.categories = await this.productService.getCategories(false);
      this.products = await this.productService.getProducts({ activeOnly: false });
      this.onSearch();
    } catch (err: any) {
      console.error('Error loading products in admin:', err);
      this.errorMessage = 'Unable to load products. Please try again.';
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  onSearch() {
    this.filteredProducts = this.products.filter(p => {
      const matchesSearch = !this.searchQuery || 
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        (p.sku && p.sku.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesCat = !this.selectedCategory || p.category_id === this.selectedCategory;

      return matchesSearch && matchesCat;
    });
    this.cdr.markForCheck();
  }

  getPrimaryImage(prod: Product): string {
    const images = extractProductImages(prod);
    return images.length > 0 ? images[0].image_url : DEFAULT_FALLBACK_IMAGE;
  }

  onImageError(event: Event) {
    handleImageError(event);
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  async openCreateModal() {
    this.editingProduct = null;
    await this.productService.refreshCategories(false);

    this.formProduct = {
      name: '',
      slug: '',
      description: '',
      price: 1999,
      sale_price: null,
      sku: 'PE-' + Math.floor(1000 + Math.random() * 9000),
      category_id: this.categories.length > 0 ? this.categories[0].id : null,
      featured: false,
      new_arrival: true,
      active: true
    };
    this.imageUrlsText = '';
    this.uploadStatusText = '';
    this.uploadHasError = false;
    this.isUploadingImages = false;

    // Reset DOM file input element to prevent stale file selection state
    setTimeout(() => {
      const fileInput = document.querySelector('.form-control-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }, 0);

    this.formSizes = [
      { size: 'XS', stock: 5 },
      { size: 'S', stock: 5 },
      { size: 'M', stock: 5 },
      { size: 'L', stock: 5 },
      { size: 'XL', stock: 5 },
      { size: 'XXL', stock: 5 }
    ];
    this.isModalOpen = true;
    this.cdr.markForCheck();
  }

  async openEditModal(prod: Product) {
    this.editingProduct = prod;
    await this.productService.refreshCategories(false);

    this.formProduct = { ...prod };

    // Extract exact image URLs for editing product
    const extractedImgs = extractProductImages(prod);
    const validUrls = extractedImgs
      .map(img => img.image_url)
      .filter(url => url && url !== DEFAULT_FALLBACK_IMAGE);
    this.imageUrlsText = validUrls.join('\n');

    this.uploadStatusText = '';
    this.uploadHasError = false;
    this.isUploadingImages = false;

    setTimeout(() => {
      const fileInput = document.querySelector('.form-control-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }, 0);

    if (prod.sizes && prod.sizes.length > 0) {
      this.formSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => {
        const found = prod.sizes?.find(s => s.size === sz);
        return { size: sz as SizeOption, stock: found ? found.stock : 0 };
      });
    }

    this.isModalOpen = true;
    this.cdr.markForCheck();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    this.isUploadingImages = true;
    this.uploadHasError = false;
    this.uploadStatusText = `Starting upload of ${files.length} image(s)...`;
    this.cdr.markForCheck();

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.uploadStatusText = `Uploading image ${i + 1} of ${files.length}... (${file.name})`;
        this.cdr.markForCheck();

        const url = await this.productService.uploadProductImage(file);
        uploadedUrls.push(url);
      }

      const currentList = parseImageUrlsInput(this.imageUrlsText);
      const combined = [...currentList, ...uploadedUrls];
      this.imageUrlsText = combined.join('\n');

      this.uploadStatusText = `✓ Successfully uploaded ${files.length} image(s)!`;
      this.uploadHasError = false;
    } catch (err: any) {
      console.error('Error uploading product images:', err);
      this.uploadStatusText = `⚠️ Upload failed: ${err.message || 'Image upload request failed.'}`;
      this.uploadHasError = true;
    } finally {
      this.isUploadingImages = false;
      input.value = '';
      this.cdr.markForCheck();
    }
  }

  autoGenerateSlug() {
    if (!this.editingProduct && this.formProduct.name) {
      this.formProduct.slug = this.formProduct.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingProduct = null;
    this.formProduct = {
      name: '',
      slug: '',
      description: '',
      price: 0,
      sale_price: null,
      sku: '',
      featured: false,
      new_arrival: true,
      active: true
    };
    this.imageUrlsText = '';
    this.uploadStatusText = '';
    this.uploadHasError = false;
    this.isUploadingImages = false;
    this.isSaving = false;

    const fileInput = document.querySelector('.form-control-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    this.cdr.markForCheck();
  }

  async saveProduct() {
    if (this.isUploadingImages) {
      alert('Please wait for image uploads to complete before saving.');
      return;
    }

    if (!this.formProduct.name || !this.formProduct.price) {
      alert('Product Title and Price are required.');
      return;
    }

    this.isSaving = true;
    this.cdr.markForCheck();

    try {
      const imagesList = parseImageUrlsInput(this.imageUrlsText);

      const invalidShareUrl = imagesList.find(url => isIbbShareUrl(url));
      if (invalidShareUrl) {
        alert('Please use direct image URLs (e.g. https://i.ibb.co/...).');
        this.isSaving = false;
        return;
      }

      const sizesList = this.formSizes.map(sz => ({
        size: sz.size as any,
        stock: Number(sz.stock) || 0
      }));

      let savedProduct: Product;
      if (this.editingProduct) {
        savedProduct = await this.productService.updateProduct(
          this.editingProduct.id,
          this.formProduct,
          imagesList,
          sizesList
        );
        alert('Product updated successfully!');
      } else {
        savedProduct = await this.productService.createProduct(
          this.formProduct,
          imagesList,
          sizesList
        );
        alert('Product created successfully!');
      }

      // Close modal & reset form state completely
      this.closeModal();

      // 1. Clear ProductService memory cache
      this.productService.clearCache();

      // 2. Fetch fresh products from database
      await this.loadData();

      // 3. Ensure explicit image array association on saved product object
      if (savedProduct && savedProduct.id) {
        if (!savedProduct.images || savedProduct.images.length === 0) {
          savedProduct.images = imagesList.map((url, idx) => ({
            product_id: savedProduct.id,
            image_url: url,
            is_primary: idx === 0,
            display_order: idx + 1
          }));
        }
        if (!savedProduct.image_url && imagesList.length > 0) {
          savedProduct.image_url = imagesList[0];
        }

        const existingIdx = this.products.findIndex(p => p.id === savedProduct.id);
        if (existingIdx >= 0) {
          this.products[existingIdx] = { ...savedProduct };
        } else {
          this.products = [{ ...savedProduct }, ...this.products];
        }
        this.onSearch();
      }

    } catch (err: any) {
      console.error('Error saving product:', err);
      alert(err.message || 'Error saving product');
    } finally {
      this.isSaving = false;
      this.cdr.markForCheck();
    }
  }

  async deleteProduct(event: Event, prod: Product) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!prod || !prod.id) {
      alert('Cannot delete product: Invalid product ID');
      return;
    }

    // Double-click guard
    if (this.deletingId === prod.id) {
      return;
    }

    if (!confirm(`Are you sure you want to delete product "${prod.name}"?`)) {
      return;
    }

    this.deletingId = prod.id;
    this.cdr.markForCheck();

    try {
      // 1. Perform async deletion in database/backend (API + Supabase)
      await this.productService.deleteProduct(prod.id);

      // 2. ONLY AFTER DATABASE CONFIRMS SUCCESS: Update local component state & service cache (0ms UI removal)
      this.products = this.products.filter(p => p.id !== prod.id);
      this.onSearch();
      this.productService.removeProductFromCache(prod.id);

      // 3. Complete UI update without full list re-fetching or page reloads
      this.cdr.markForCheck();
      alert('Product deleted successfully.');

    } catch (err: any) {
      console.error('Failed to delete product:', err);
      alert(err.message || 'Unable to delete product. Please try again.');
    } finally {
      this.deletingId = null;
      this.cdr.markForCheck();
    }
  }
}
