import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { Product, SizeOption, ColorVariant } from '../../core/models/product.model';
import { Category, DepartmentType } from '../../core/models/category.model';
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
          <p class="page-subtitle">Create, edit, and configure store products, sizing, variations, and inventory.</p>
        </div>
        <button type="button" (click)="openCreateModal()" class="btn-primary">
          + Create New Product
        </button>
      </div>

      <!-- Department Filter Tabs -->
      <div class="admin-dept-filter-bar">
        <button 
          class="dept-filter-btn" 
          [class.active]="selectedDeptFilter === 'all'"
          (click)="setDeptFilter('all')"
        >
          All Products ({{ products.length }})
        </button>
        <button 
          class="dept-filter-btn" 
          [class.active]="selectedDeptFilter === 'ethnic'"
          (click)="setDeptFilter('ethnic')"
        >
          🌸 Ethnics ({{ getDeptCount('ethnic') }})
        </button>
        <button 
          class="dept-filter-btn" 
          [class.active]="selectedDeptFilter === 'jewellery'"
          (click)="setDeptFilter('jewellery')"
        >
          ✨ Jewellery ({{ getDeptCount('jewellery') }})
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
          <option *ngFor="let cat of filterDropdownCategories" [value]="cat.id">
            {{ cat.name }} ({{ (cat.department || 'ethnic') | uppercase }})
          </option>
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
                <th>Department</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock / Mode</th>
                <th>Flags</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading Spinner -->
              <tr *ngIf="isLoading">
                <td colspan="9" class="text-center loading-cell">
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
                  <div class="mode-tag" *ngIf="prod.purchase_mode === 'enquiry'">💬 WhatsApp Enquiry Only</div>
                </td>
                <td>
                  <span class="badge" [class.badge-pink]="(prod.department || 'ethnic') === 'ethnic'" [class.badge-dark]="prod.department === 'jewellery'">
                    {{ (prod.department || 'ethnic') | uppercase }}
                  </span>
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
                  <div class="size-hint" *ngIf="prod.has_size !== false && prod.sizes && prod.sizes.length > 0">
                    Sizes: {{ prod.sizes.length }}
                  </div>
                  <div class="size-hint text-muted" *ngIf="prod.has_size === false">
                    Direct Qty
                  </div>
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

              <!-- Empty State -->
              <tr *ngIf="!isLoading && filteredProducts.length === 0">
                <td colspan="9" class="text-center empty-cell">No products found matching your filter criteria.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Product Form Modal -->
      <div class="modal-backdrop" *ngIf="isModalOpen">
        <div class="modal-box">
          <div class="modal-header">
            <div>
              <h2>{{ editingProduct ? 'Edit Product' : 'Create New Product' }}</h2>
              <p class="modal-subtitle">Configure basic details, pricing, sizing, color variants, media, and policies.</p>
            </div>
            <button type="button" (click)="closeModal()" class="close-modal-btn">&times;</button>
          </div>

          <form (ngSubmit)="saveProduct()" class="modal-body">
            
            <!-- SECTION 1: DEPARTMENT & BASIC INFO -->
            <div class="form-section">
              <h3 class="section-title">1. Department & Basic Information</h3>

              <!-- Department Selection -->
              <div class="form-group">
                <label class="form-label">Department *</label>
                <div class="dept-selector-row">
                  <label class="dept-radio-label" [class.selected]="formProduct.department === 'ethnic'">
                    <input type="radio" name="prod_dept" value="ethnic" [ngModel]="formProduct.department" (ngModelChange)="onDepartmentChange('ethnic')" />
                    <span>🌸 Ethnics Boutique (Clothing)</span>
                  </label>
                  <label class="dept-radio-label" [class.selected]="formProduct.department === 'jewellery'">
                    <input type="radio" name="prod_dept" value="jewellery" [ngModel]="formProduct.department" (ngModelChange)="onDepartmentChange('jewellery')" />
                    <span>✨ Handcrafted Jewellery</span>
                  </label>
                </div>
                <small class="help-text">
                  {{ formProduct.department === 'jewellery' ? 'Jewellery items default to direct quantity ordering without size options.' : 'Ethnic wear defaults to standard sizing (XS–XXL) with size chart support.' }}
                </small>
              </div>

              <div class="form-row">
                <div class="form-group flex-2">
                  <label class="form-label">Product Name *</label>
                  <input type="text" [(ngModel)]="formProduct.name" name="name" required class="form-control" (input)="autoGenerateSlug()" placeholder="e.g. Royal Emerald Chanderi Anarkali" />
                </div>

                <div class="form-group flex-1">
                  <label class="form-label">Slug *</label>
                  <input type="text" [(ngModel)]="formProduct.slug" name="slug" required class="form-control" placeholder="e.g. royal-emerald-chanderi" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Category *</label>
                  <select [(ngModel)]="formProduct.category_id" name="category_id" required class="form-control">
                    <option [value]="null">-- Select Category --</option>
                    <option *ngFor="let cat of formFilteredCategories" [value]="cat.id">
                      {{ cat.name }} ({{ (cat.department || 'ethnic') | uppercase }})
                    </option>
                  </select>
                  <small class="help-text" *ngIf="formFilteredCategories.length === 0">
                    No categories found for this department. Create one in Categories tab.
                  </small>
                </div>

                <div class="form-group flex-1">
                  <label class="form-label">SKU</label>
                  <input type="text" [(ngModel)]="formProduct.sku" name="sku" class="form-control" placeholder="PE-AN-001" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Product Description</label>
                <textarea [(ngModel)]="formProduct.description" name="description" rows="3" class="form-control" placeholder="Detailed product details, fabric, craftsmanship, styling notes..."></textarea>
              </div>
            </div>

            <!-- SECTION 2: PRICING & PURCHASE MODE -->
            <div class="form-section">
              <h3 class="section-title">2. Pricing & Purchase Mode</h3>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Regular Price (₹) *</label>
                  <input type="number" [(ngModel)]="formProduct.price" name="price" required min="0" class="form-control" placeholder="2999" />
                </div>

                <div class="form-group flex-1">
                  <label class="form-label">Sale Price (₹) <small>(Optional discount)</small></label>
                  <input type="number" [(ngModel)]="formProduct.sale_price" name="sale_price" min="0" class="form-control" placeholder="2499" />
                </div>
              </div>

              <!-- Purchase Mode Selector -->
              <div class="form-group">
                <label class="form-label">Purchase Mode</label>
                <div class="dept-selector-row">
                  <label class="dept-radio-label" [class.selected]="formProduct.purchase_mode !== 'enquiry'">
                    <input type="radio" name="purchase_mode" value="online" [(ngModel)]="formProduct.purchase_mode" />
                    <span>🛒 Online Purchase (Add to Cart & Checkout)</span>
                  </label>
                  <label class="dept-radio-label" [class.selected]="formProduct.purchase_mode === 'enquiry'">
                    <input type="radio" name="purchase_mode" value="enquiry" [(ngModel)]="formProduct.purchase_mode" />
                    <span>💬 WhatsApp Enquiry Only</span>
                  </label>
                </div>
                <small class="help-text">
                  {{ formProduct.purchase_mode === 'enquiry' ? 'Customers will see an "Enquire on WhatsApp" button instead of direct checkout.' : 'Standard ecommerce purchase with Razorpay online payment.' }}
                </small>
              </div>

              <!-- Stock Display Mode -->
              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Stock Status Display</label>
                  <select [(ngModel)]="formProduct.stock_display" name="stock_display" class="form-control">
                    <option value="normal">Standard (In Stock / Sold Out)</option>
                    <option value="few_left">Show "Only a few left" if low (never shows numbers)</option>
                    <option value="custom">Custom Stock Message</option>
                  </select>
                </div>

                <div class="form-group flex-1" *ngIf="formProduct.stock_display === 'custom'">
                  <label class="form-label">Custom Stock Message</label>
                  <input type="text" [(ngModel)]="formProduct.custom_stock_message" name="custom_stock_message" class="form-control" placeholder="e.g. Handcrafted Piece — Selling Fast" />
                </div>
              </div>
            </div>

            <!-- SECTION 3: SIZING & INVENTORY -->
            <div class="form-section">
              <h3 class="section-title">3. Sizing & Stock Inventory</h3>

              <div class="toggle-row">
                <label class="checkbox-label font-bold">
                  <input type="checkbox" [(ngModel)]="formProduct.has_size" name="has_size" />
                  <span>Enable Size Variations (XS, S, M, L, XL, XXL)</span>
                </label>
              </div>

              <!-- When has_size is TRUE: Show XS-XXL stock grid -->
              <div class="size-config-box" *ngIf="formProduct.has_size">
                <label class="form-label">Size Inventory (Stock per size)</label>
                <div class="size-inputs-grid">
                  <div *ngFor="let sz of formSizes" class="size-input-box">
                    <span class="sz-name">{{ sz.size }}</span>
                    <input type="number" [(ngModel)]="sz.stock" [name]="'size_' + sz.size" min="0" class="form-control sz-input" />
                  </div>
                </div>

                <div class="size-chart-section">
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="formProduct.show_size_chart" name="show_size_chart" />
                    <span>Show Size Chart Link on Product Page</span>
                  </label>

                  <div class="form-group mt-2" *ngIf="formProduct.show_size_chart">
                    <input 
                      type="text" 
                      [(ngModel)]="formProduct.size_chart_url" 
                      name="size_chart_url" 
                      class="form-control" 
                      placeholder="Size chart image URL (optional, standard ethnic size guide used by default)"
                    />
                  </div>
                </div>
              </div>

              <!-- When has_size is FALSE: Direct total stock quantity -->
              <div class="no-size-stock-box" *ngIf="!formProduct.has_size">
                <div class="form-group">
                  <label class="form-label">Total Stock Quantity *</label>
                  <input type="number" [(ngModel)]="formProduct.stock" name="stock" min="0" class="form-control inline-number-input" placeholder="10" />
                  <small class="help-text">Product will be sold as a direct quantity item (no size selection required by customer).</small>
                </div>
              </div>
            </div>

            <!-- SECTION 4: COLOR VARIATIONS -->
            <div class="form-section">
              <div class="section-header-flex">
                <h3 class="section-title">4. Color Variations</h3>
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="formProduct.has_colors" name="has_colors" />
                  <span>Enable Color Variations</span>
                </label>
              </div>

              <div *ngIf="formProduct.has_colors" class="color-variants-container">
                <p class="section-subtitle">Add available color variations. Selecting a color on the product page instantly switches the product image without reloading!</p>

                <div class="color-variant-card" *ngFor="let cv of formColorVariants; let i = index">
                  <div class="cv-header">
                    <span class="cv-num">Color #{{ i + 1 }}</span>
                    <button type="button" (click)="removeColorVariant(i)" class="btn-remove-cv">&times; Remove</button>
                  </div>

                  <div class="form-row">
                    <div class="form-group flex-2">
                      <label class="form-label">Color Name *</label>
                      <input type="text" [(ngModel)]="cv.name" [name]="'cv_name_' + i" class="form-control" placeholder="e.g. Royal Emerald Green" />
                    </div>

                    <div class="form-group flex-1">
                      <label class="form-label">Color Swatch</label>
                      <div class="color-picker-box">
                        <input type="color" [(ngModel)]="cv.color_code" [name]="'cv_hex_' + i" class="color-picker-input" />
                        <span class="color-hex-text">{{ cv.color_code }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Variant Image URL (Instant Switch)</label>
                    <input 
                      type="text" 
                      [(ngModel)]="cv.image_urls_text" 
                      [name]="'cv_img_' + i" 
                      class="form-control" 
                      placeholder="https://i.ibb.co/... Direct image for this color"
                    />
                  </div>
                </div>

                <button type="button" (click)="addColorVariant()" class="btn-outline btn-sm mt-2">
                  + Add Color Variant
                </button>
              </div>
            </div>

            <!-- SECTION 5: MEDIA & VIDEO -->
            <div class="form-section">
              <h3 class="section-title">5. Product Media & Video</h3>

              <!-- Upload Images -->
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

              <!-- Direct URLs -->
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

              <!-- Product Video -->
              <div class="form-group">
                <label class="form-label">Product Video URL (Optional)</label>
                <input 
                  type="text" 
                  [(ngModel)]="formProduct.video_url" 
                  name="video_url" 
                  class="form-control" 
                  placeholder="https://... Direct MP4, YouTube, or Vimeo link"
                />
                <small class="help-text">Renders an interactive responsive video showcase on the product detail page.</small>
              </div>
            </div>

            <!-- SECTION 6: RETURN POLICY & PROMOTIONS -->
            <div class="form-section">
              <h3 class="section-title">6. Return Policy & Display Flags</h3>

              <div class="form-group">
                <label class="form-label">Return Policy Preset</label>
                <select [ngModel]="selectedPolicyPresetIndex" (ngModelChange)="onPolicyPresetChange($event)" name="policy_preset" class="form-control">
                  <option *ngFor="let p of returnPolicyPresets; let idx = index" [value]="idx">
                    {{ p.label }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Return Policy Details</label>
                <textarea [(ngModel)]="formProduct.return_policy" name="return_policy" rows="2" class="form-control" placeholder="Specify return conditions, exchange timeline, or non-returnable notice..."></textarea>
              </div>

              <!-- Product Flags -->
              <div class="flags-grid">
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
                  <span>Active (Visible in Store)</span>
                </label>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="closeModal()" class="btn-outline">Cancel</button>
              <button type="submit" [disabled]="isSaving || isUploadingImages" class="btn-primary">
                {{ isSaving ? 'Saving Product...' : (isUploadingImages ? 'Uploading Images...' : 'Save Product') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-title { font-size: 28px; margin-bottom: 4px; font-weight: 700; color: #1A1A1A; }
    .page-subtitle { font-size: 14px; color: #666; }

    .admin-dept-filter-bar { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
    .dept-filter-btn { padding: 8px 18px; border: 1px solid #E0E0E0; background: #FFFFFF; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; color: #333333; transition: all 0.2s; }
    .dept-filter-btn:hover { border-color: var(--color-primary, #C2185B); color: var(--color-primary, #C2185B); }
    .dept-filter-btn.active { background: var(--color-primary, #C2185B); color: #FFFFFF; border-color: var(--color-primary, #C2185B); box-shadow: 0 2px 6px rgba(194, 24, 91, 0.2); }

    .admin-filter-bar { display: flex; gap: 16px; margin-bottom: 24px; }
    .filter-input { flex: 2; }
    .filter-select { flex: 1; }

    .error-card { background: #FFEBEE; border: 1px solid #FFCDD2; color: #C62828; padding: 20px; border-radius: var(--radius-md, 8px); margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
    .btn-sm { padding: 6px 12px; font-size: 12px; }

    .table-card { background: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .table-responsive { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .admin-table th, .admin-table td { padding: 14px 16px; border-bottom: 1px solid #EAEAEA; text-align: left; vertical-align: middle; }
    .admin-table th { background-color: #FAFAFA; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #757575; letter-spacing: 0.5px; }

    .loading-cell { padding: 40px 16px !important; color: #757575; font-size: 14px; }
    .empty-cell { padding: 30px 16px !important; color: #757575; }

    .spinner { width: 24px; height: 24px; border: 3px solid rgba(194, 24, 91, 0.2); border-top-color: #C2185B; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 10px auto; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .table-thumb { width: 44px; height: 56px; object-fit: cover; border-radius: 4px; border: 1px solid #E0E0E0; }
    .sku-text { font-size: 11px; color: #888; }
    .mode-tag { font-size: 10px; color: #2E7D32; font-weight: 600; margin-top: 2px; }
    .sale-price { color: #C2185B; margin-right: 6px; }
    .orig-price { font-size: 11px; text-decoration: line-through; color: #9E9E9E; }

    .stock-badge { font-weight: 600; color: #2E7D32; }
    .stock-badge.low { color: #E65100; }
    .stock-badge.out { color: #C62828; }
    .size-hint { font-size: 11px; color: #757575; margin-top: 2px; }

    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; }
    .badge-pink { background: rgba(194, 24, 91, 0.1); color: #C2185B; }
    .badge-gold { background: rgba(212, 175, 55, 0.15); color: #8D6E10; }
    .badge-dark { background: #ECEFF1; color: #37474F; }

    .action-btn-group { display: flex; gap: 8px; }
    .edit-btn { color: #1976D2; font-size: 13px; font-weight: 500; background: transparent; border: none; cursor: pointer; }
    .edit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .delete-btn { color: #D32F2F; font-size: 13px; font-weight: 500; background: transparent; border: none; cursor: pointer; }
    .delete-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Modal */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal-box { background: #FFFFFF; width: 100%; max-width: 820px; max-height: 92vh; overflow-y: auto; border-radius: 12px; padding: 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #EAEAEA; }
    .modal-subtitle { font-size: 13px; color: #757575; margin-top: 4px; }
    .close-modal-btn { font-size: 28px; color: #757575; background: transparent; border: none; cursor: pointer; line-height: 1; }

    /* Form Sections */
    .form-section { background: #FAF9F6; border: 1px solid #EAEAEA; border-radius: 8px; padding: 18px; margin-bottom: 20px; }
    .section-title { font-size: 15px; font-weight: 600; color: #2C2C2C; margin-bottom: 14px; }
    .section-subtitle { font-size: 12px; color: #666; margin-bottom: 12px; }
    .section-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }

    .dept-selector-row { display: flex; gap: 12px; margin-top: 6px; }
    .dept-radio-label { flex: 1; display: flex; align-items: center; gap: 8px; padding: 10px 14px; border: 1px solid #E0E0E0; border-radius: 8px; cursor: pointer; background: #FFFFFF; font-size: 13px; font-weight: 500; transition: all 0.2s; }
    .dept-radio-label.selected { border-color: var(--color-primary, #C2185B); background: rgba(194, 24, 91, 0.05); color: var(--color-primary, #C2185B); }

    .form-row { display: flex; gap: 16px; margin-bottom: 12px; }
    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }
    .form-group { margin-bottom: 12px; }
    .form-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #333; }
    .form-control { width: 100%; padding: 8px 12px; border: 1px solid #CCCCCC; border-radius: 6px; font-size: 14px; background: #FFFFFF; transition: border-color 0.2s; }
    .form-control:focus { outline: none; border-color: var(--color-primary, #C2185B); }
    .help-text { display: block; font-size: 12px; color: #757575; margin-top: 4px; }

    .file-upload-container { display: flex; flex-direction: column; gap: 8px; }
    .form-control-file { padding: 8px; border: 1px dashed #CCCCCC; border-radius: 6px; background: #FFFFFF; width: 100%; cursor: pointer; }
    .upload-status-badge { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; padding: 8px 12px; border-radius: 6px; background: #E8F5E9; color: #2E7D32; border: 1px solid #C8E6C9; }
    .upload-status-badge.error { background: #FFEBEE; color: #C62828; border-color: #FFCDD2; }
    .inline-spinner { width: 14px; height: 14px; border: 2px solid rgba(46, 125, 50, 0.2); border-top-color: #2E7D32; border-radius: 50%; animation: spin 0.8s linear infinite; }

    /* Sizes */
    .toggle-row { margin-bottom: 14px; }
    .font-bold { font-weight: 600; }
    .size-config-box { background: #FFFFFF; padding: 14px; border-radius: 6px; border: 1px solid #EAEAEA; }
    .size-inputs-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 14px; }
    .size-input-box { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .sz-name { font-size: 12px; font-weight: 700; color: #444; }
    .sz-input { text-align: center; padding: 6px; }
    .size-chart-section { border-top: 1px solid #EAEAEA; padding-top: 12px; }
    .mt-2 { margin-top: 8px; }

    .no-size-stock-box { background: #FFFFFF; padding: 14px; border-radius: 6px; border: 1px solid #EAEAEA; }
    .inline-number-input { max-width: 200px; }

    /* Color variations */
    .color-variants-container { margin-top: 8px; }
    .color-variant-card { background: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 6px; padding: 12px; margin-bottom: 10px; }
    .cv-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .cv-num { font-size: 12px; font-weight: 600; color: #666; }
    .btn-remove-cv { color: #D32F2F; font-size: 12px; background: transparent; border: none; cursor: pointer; }
    .color-picker-box { display: flex; align-items: center; gap: 8px; }
    .color-picker-input { width: 36px; height: 36px; border: 1px solid #E0E0E0; border-radius: 4px; cursor: pointer; padding: 2px; }
    .color-hex-text { font-family: monospace; font-size: 12px; color: #555; }

    .flags-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 14px; }
    .checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; user-select: none; }

    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #EAEAEA; }
    .text-center { text-align: center; }
  `]
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];

  searchQuery = '';
  selectedCategory = '';
  selectedDeptFilter: 'all' | 'ethnic' | 'jewellery' = 'all';

  isLoading = true;
  errorMessage = '';

  isModalOpen = false;
  editingProduct: Product | null = null;
  isSaving = false;
  deletingId: string | null = null;

  isUploadingImages = false;
  uploadStatusText = '';
  uploadHasError = false;

  selectedPolicyPresetIndex = 0;
  returnPolicyPresets = [
    { label: 'Standard 7 Days Return & Exchange', text: 'Hassle-free 7 days return and exchange policy. Product must be in original condition with tags intact.' },
    { label: 'Exchange Only (Within 3 Days)', text: 'Exchange available within 3 days of delivery for damaged or defective items with unboxing video proof.' },
    { label: 'Non-Returnable / Final Sale', text: 'This item is handcrafted / delicate and non-returnable. Please inspect sizing details before purchasing.' },
    { label: 'Custom Policy', text: '' }
  ];

  private catSub?: Subscription;

  formProduct: Partial<Product> = {
    name: '',
    slug: '',
    department: 'ethnic',
    description: '',
    price: 0,
    sale_price: null,
    sku: '',
    stock: 10,
    has_size: true,
    show_size_chart: true,
    size_chart_url: '',
    has_colors: false,
    color_variants: [],
    purchase_mode: 'online',
    stock_display: 'normal',
    custom_stock_message: '',
    video_url: '',
    return_policy: '',
    featured: false,
    new_arrival: true,
    best_seller: false,
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

  formColorVariants: { name: string; color_code: string; image_urls_text: string }[] = [];

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

  get filterDropdownCategories(): Category[] {
    if (this.selectedDeptFilter === 'all') return this.categories;
    return this.categories.filter(c => (c.department || 'ethnic') === this.selectedDeptFilter);
  }

  get formFilteredCategories(): Category[] {
    const dept = this.formProduct.department || 'ethnic';
    return this.categories.filter(c => (c.department || 'ethnic') === dept);
  }

  getDeptCount(dept: 'ethnic' | 'jewellery'): number {
    return this.products.filter(p => (p.department || 'ethnic') === dept).length;
  }

  setDeptFilter(dept: 'all' | 'ethnic' | 'jewellery') {
    this.selectedDeptFilter = dept;
    this.selectedCategory = '';
    this.onSearch();
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
      const pDept = p.department || 'ethnic';
      const matchesDept = this.selectedDeptFilter === 'all' || pDept === this.selectedDeptFilter;

      const matchesSearch = !this.searchQuery || 
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        (p.sku && p.sku.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesCat = !this.selectedCategory || p.category_id === this.selectedCategory;

      return matchesDept && matchesSearch && matchesCat;
    });
    this.cdr.markForCheck();
  }

  onDepartmentChange(dept: 'ethnic' | 'jewellery') {
    this.formProduct.department = dept;
    if (dept === 'jewellery') {
      this.formProduct.has_size = false;
      this.formProduct.show_size_chart = false;
    } else {
      this.formProduct.has_size = true;
      this.formProduct.show_size_chart = true;
    }

    const available = this.formFilteredCategories;
    if (available.length > 0 && (!this.formProduct.category_id || !available.some(c => c.id === this.formProduct.category_id))) {
      this.formProduct.category_id = available[0].id;
    }
    this.cdr.markForCheck();
  }

  onPolicyPresetChange(idx: number) {
    this.selectedPolicyPresetIndex = idx;
    if (idx >= 0 && idx < this.returnPolicyPresets.length) {
      const p = this.returnPolicyPresets[idx];
      if (p.text) {
        this.formProduct.return_policy = p.text;
      }
    }
  }

  addColorVariant() {
    this.formColorVariants.push({
      name: '',
      color_code: '#C2185B',
      image_urls_text: ''
    });
    this.cdr.markForCheck();
  }

  removeColorVariant(index: number) {
    this.formColorVariants.splice(index, 1);
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

    // Refresh categories from backend/cache immediately so newly created categories appear without reload
    try {
      this.categories = await this.productService.refreshCategories(false);
    } catch (e) {
      console.warn('Category refresh notice:', e);
    }

    const defaultDept = this.selectedDeptFilter === 'jewellery' ? 'jewellery' : 'ethnic';
    const deptCats = this.categories.filter(c => (c.department || 'ethnic') === defaultDept);

    this.formProduct = {
      name: '',
      slug: '',
      department: defaultDept,
      description: '',
      price: 1999,
      sale_price: null,
      sku: 'PE-' + Math.floor(1000 + Math.random() * 9000),
      category_id: deptCats.length > 0 ? deptCats[0].id : (this.categories.length > 0 ? this.categories[0].id : null),
      stock: 10,
      has_size: defaultDept !== 'jewellery',
      show_size_chart: defaultDept !== 'jewellery',
      size_chart_url: '',
      has_colors: false,
      color_variants: [],
      purchase_mode: 'online',
      stock_display: 'normal',
      custom_stock_message: '',
      video_url: '',
      return_policy: this.returnPolicyPresets[0].text,
      featured: false,
      new_arrival: true,
      best_seller: false,
      active: true
    };

    this.selectedPolicyPresetIndex = 0;
    this.formColorVariants = [];
    this.imageUrlsText = '';
    this.uploadStatusText = '';
    this.uploadHasError = false;
    this.isUploadingImages = false;

    this.formSizes = [
      { size: 'XS', stock: 5 },
      { size: 'S', stock: 5 },
      { size: 'M', stock: 5 },
      { size: 'L', stock: 5 },
      { size: 'XL', stock: 5 },
      { size: 'XXL', stock: 5 }
    ];

    setTimeout(() => {
      const fileInput = document.querySelector('.form-control-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }, 0);

    this.isModalOpen = true;
    this.cdr.markForCheck();
  }

  async openEditModal(prod: Product) {
    this.editingProduct = prod;

    // Refresh categories so newly created categories appear
    try {
      this.categories = await this.productService.refreshCategories(false);
    } catch (e) {
      console.warn('Category refresh notice:', e);
    }

    const dept = prod.department || 'ethnic';
    this.formProduct = { 
      ...prod,
      department: dept,
      has_size: prod.has_size !== undefined ? prod.has_size : (dept !== 'jewellery'),
      show_size_chart: Boolean(prod.show_size_chart),
      purchase_mode: prod.purchase_mode || 'online',
      stock_display: prod.stock_display || 'normal',
      has_colors: Boolean(prod.has_colors),
      return_policy: prod.return_policy || this.returnPolicyPresets[0].text
    };

    // Match policy preset index
    const matchingPreset = this.returnPolicyPresets.findIndex(p => p.text === prod.return_policy);
    this.selectedPolicyPresetIndex = matchingPreset >= 0 ? matchingPreset : 3;

    // Extract exact image URLs
    const extractedImgs = extractProductImages(prod);
    const validUrls = extractedImgs
      .map(img => img.image_url)
      .filter(url => url && url !== DEFAULT_FALLBACK_IMAGE);
    this.imageUrlsText = validUrls.join('\n');

    this.uploadStatusText = '';
    this.uploadHasError = false;
    this.isUploadingImages = false;

    if (prod.sizes && prod.sizes.length > 0) {
      this.formSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => {
        const found = prod.sizes?.find(s => s.size === sz);
        return { size: sz as SizeOption, stock: found ? found.stock : 0 };
      });
    } else {
      this.formSizes = [
        { size: 'XS', stock: 0 },
        { size: 'S', stock: 0 },
        { size: 'M', stock: 0 },
        { size: 'L', stock: 0 },
        { size: 'XL', stock: 0 },
        { size: 'XXL', stock: 0 }
      ];
    }

    if (prod.color_variants && prod.color_variants.length > 0) {
      this.formColorVariants = prod.color_variants.map(cv => ({
        name: cv.name || '',
        color_code: cv.color_code || '#C2185B',
        image_urls_text: (cv.image_urls || []).join('\n')
      }));
    } else {
      this.formColorVariants = [];
    }

    setTimeout(() => {
      const fileInput = document.querySelector('.form-control-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }, 0);

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
      department: 'ethnic',
      description: '',
      price: 0,
      sale_price: null,
      sku: '',
      stock: 10,
      has_size: true,
      show_size_chart: true,
      size_chart_url: '',
      has_colors: false,
      color_variants: [],
      purchase_mode: 'online',
      stock_display: 'normal',
      custom_stock_message: '',
      video_url: '',
      return_policy: '',
      featured: false,
      new_arrival: true,
      best_seller: false,
      active: true
    };
    this.imageUrlsText = '';
    this.formColorVariants = [];
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

    if (!this.formProduct.name || !this.formProduct.name.trim()) {
      alert('Product Name is required.');
      return;
    }

    if (!this.formProduct.price || this.formProduct.price <= 0) {
      alert('A valid Product Price is required.');
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

      // Format color variations
      const colorVariants: ColorVariant[] = this.formProduct.has_colors
        ? this.formColorVariants
            .map(cv => ({
              name: cv.name.trim(),
              color_code: cv.color_code || '#C2185B',
              image_urls: cv.image_urls_text ? cv.image_urls_text.split(/[\n,]+/).map(u => u.trim()).filter(Boolean) : []
            }))
            .filter(cv => cv.name)
        : [];

      this.formProduct.color_variants = colorVariants;

      // Format sizes list
      let sizesList = this.formSizes.map(sz => ({
        size: sz.size as any,
        stock: Number(sz.stock) || 0
      }));

      if (!this.formProduct.has_size) {
        sizesList = [];
      }

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

      // 1. Ensure category relation object is populated for UI rendering
      if (savedProduct && savedProduct.id) {
        if (!savedProduct.category && savedProduct.category_id) {
          const cat = this.categories.find(c => c.id === savedProduct.category_id);
          if (cat) savedProduct.category = cat;
        }

        // 2. Ensure explicit image array association on saved product object
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

        // 3. Immediately update component local state (Newest product prepended to top of list!)
        const existingIdx = this.products.findIndex(p => p.id === savedProduct.id);
        if (existingIdx >= 0) {
          this.products[existingIdx] = { ...savedProduct };
        } else {
          this.products = [{ ...savedProduct }, ...this.products];
        }

        // 4. Update service cache in-place
        this.productService.addProductToCache(savedProduct);

        // 5. Recompute filtered products list for instant UI rendering (0ms UI display!)
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

    if (this.deletingId === prod.id) {
      return;
    }

    if (!confirm(`Are you sure you want to delete product "${prod.name}"?`)) {
      return;
    }

    this.deletingId = prod.id;
    this.cdr.markForCheck();

    try {
      await this.productService.deleteProduct(prod.id);
      this.products = this.products.filter(p => p.id !== prod.id);
      this.onSearch();
      this.productService.removeProductFromCache(prod.id);
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
