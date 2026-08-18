import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { Product, SizeOption } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';

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
        <button (click)="openCreateModal()" class="btn-primary">
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
        <button (click)="loadData()" class="btn-outline btn-sm">Retry Loading</button>
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
              <tr *ngFor="let prod of filteredProducts">
                <td>
                  <img [src]="getPrimaryImage(prod)" [alt]="prod.name" class="table-thumb" />
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
                </td>
                <td>
                  <span class="badge" [class.badge-pink]="prod.active" [class.badge-dark]="!prod.active">
                    {{ prod.active ? 'ACTIVE' : 'INACTIVE' }}
                  </span>
                </td>
                <td>
                  <div class="action-btn-group">
                    <button (click)="openEditModal(prod)" class="edit-btn" title="Edit">Edit</button>
                    <button (click)="deleteProduct(prod)" class="delete-btn" title="Delete">Delete</button>
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
            <button (click)="closeModal()" class="close-modal-btn">&times;</button>
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

            <!-- Image URLs -->
            <div class="form-group">
              <label class="form-label">Product Image Direct URLs (1 per line)</label>
              <textarea [(ngModel)]="imageUrlsText" name="imageUrlsText" rows="3" class="form-control" placeholder="https://i.ibb.co/..."></textarea>
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
                <input type="checkbox" [(ngModel)]="formProduct.active" name="active" />
                <span>Active Product</span>
              </label>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="closeModal()" class="btn-outline">Cancel</button>
              <button type="submit" [disabled]="isSaving" class="btn-primary">
                {{ isSaving ? 'Saving...' : 'Save Product' }}
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
    .delete-btn { color: #D32F2F; font-size: 13px; font-weight: 500; background: transparent; border: none; cursor: pointer; }

    /* Modal */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .modal-box { background: #FFFFFF; width: 100%; max-width: 720px; max-height: 90vh; overflow-y: auto; border-radius: var(--radius-lg); padding: 32px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid var(--color-border-light); }
    .close-modal-btn { font-size: 28px; color: var(--color-muted); background: transparent; border: none; cursor: pointer; }

    .form-row { display: flex; gap: 16px; }
    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }

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
  selectedCategory = ''; // Default "All Categories"

  isLoading = true; // Initial loading state set to true!
  errorMessage = '';

  isModalOpen = false;
  editingProduct: Product | null = null;
  isSaving = false;

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
      // 1. Load categories
      this.categories = await this.productService.getCategories(false);
      
      // 2. Load all active and inactive products immediately
      this.products = await this.productService.getProducts({ activeOnly: false });
      
      // 3. Filter with default 'All Categories'
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
    if (prod.images && prod.images.length > 0) return prod.images[0].image_url;
    return 'https://i.ibb.co/7tQbhHpZ/Whats-App-Image-2026-08-13-at-12-31-11-PM-2.jpg';
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
    this.imageUrlsText = (prod.images || []).map(img => img.image_url).join('\n');
    
    if (prod.sizes && prod.sizes.length > 0) {
      this.formSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => {
        const found = prod.sizes?.find(s => s.size === sz);
        return { size: sz as SizeOption, stock: found ? found.stock : 0 };
      });
    }

    this.isModalOpen = true;
    this.cdr.markForCheck();
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
    this.isSaving = false;
    this.cdr.markForCheck();
  }

  async saveProduct() {
    if (!this.formProduct.name || !this.formProduct.price) {
      alert('Product Title and Price are required.');
      return;
    }

    this.isSaving = true;
    this.cdr.markForCheck();

    try {
      const imagesList = this.imageUrlsText
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      const sizesList = this.formSizes.map(sz => ({
        size: sz.size as any,
        stock: Number(sz.stock) || 0
      }));

      if (this.editingProduct) {
        await this.productService.updateProduct(
          this.editingProduct.id,
          this.formProduct,
          imagesList,
          sizesList
        );
        alert('Product updated successfully!');
      } else {
        await this.productService.createProduct(
          this.formProduct,
          imagesList,
          sizesList
        );
        alert('Product created successfully!');
      }

      this.closeModal();
      await this.loadData();
    } catch (err: any) {
      alert(err.message || 'Error saving product');
    } finally {
      this.isSaving = false;
      this.cdr.markForCheck();
    }
  }

  async deleteProduct(prod: Product) {
    if (confirm(`Are you sure you want to delete product "${prod.name}"?`)) {
      try {
        await this.productService.deleteProduct(prod.id);
        await this.loadData();
      } catch (err: any) {
        alert(err.message || 'Error deleting product');
      }
    }
  }
}
