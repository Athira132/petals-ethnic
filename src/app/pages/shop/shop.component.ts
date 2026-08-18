import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductService, ProductFilterOptions } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product, SizeOption } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent],
  template: `
    <div class="shop-page">
      <!-- Header Banner -->
      <div class="shop-header-banner">
        <div class="container">
          <h1 class="shop-title">Our Ethnic Fashion Collection</h1>
          <p class="shop-subtitle">Explore handcrafted Kurtis, Anarkalis, Co-ord Sets, and Midi Dresses.</p>
        </div>
      </div>

      <div class="container shop-container">
        <!-- Sidebar Filter Drawer/Column -->
        <aside class="filter-sidebar" [class.open-mobile]="isMobileFilterOpen">
          <div class="filter-header">
            <h3>Filters</h3>
            <button class="reset-btn" (click)="resetFilters()">Reset All</button>
            <button class="close-filter-mobile" (click)="toggleMobileFilter()">&times;</button>
          </div>

          <!-- Search Input -->
          <div class="filter-group">
            <label class="filter-label">Search Products</label>
            <input 
              type="text" 
              placeholder="Search keyword..." 
              [(ngModel)]="searchQuery"
              (ngModelChange)="onFilterChange()"
              class="form-control"
            />
          </div>

          <!-- Category Filter -->
          <div class="filter-group">
            <label class="filter-label">Categories</label>
            <div class="category-radio-list">
              <label class="radio-label">
                <input 
                  type="radio" 
                  name="category" 
                  [value]="''" 
                  [(ngModel)]="selectedCategorySlug"
                  (change)="onFilterChange()" 
                />
                <span>All Categories</span>
              </label>
              <label *ngFor="let cat of categories" class="radio-label">
                <input 
                  type="radio" 
                  name="category" 
                  [value]="cat.slug" 
                  [(ngModel)]="selectedCategorySlug"
                  (change)="onFilterChange()" 
                />
                <span>{{ cat.name }}</span>
              </label>
            </div>
          </div>

          <!-- Size Filter -->
          <div class="filter-group">
            <label class="filter-label">Select Size</label>
            <div class="size-filter-chips">
              <button 
                *ngFor="let sz of availableSizes"
                class="size-filter-chip"
                [class.active]="selectedSize === sz"
                (click)="toggleSizeFilter(sz)"
              >
                {{ sz }}
              </button>
            </div>
          </div>

          <!-- Price Range Filter -->
          <div class="filter-group">
            <label class="filter-label">Price Range (₹)</label>
            <div class="price-inputs">
              <input 
                type="number" 
                placeholder="Min" 
                [(ngModel)]="minPrice" 
                (change)="onFilterChange()" 
                class="form-control price-input"
              />
              <span>-</span>
              <input 
                type="number" 
                placeholder="Max" 
                [(ngModel)]="maxPrice" 
                (change)="onFilterChange()" 
                class="form-control price-input"
              />
            </div>
          </div>
        </aside>

        <!-- Main Product Listing Content -->
        <main class="shop-main-content">
          <!-- Top Bar (Mobile Filter Toggle + Results Count + Sorting) -->
          <div class="shop-toolbar">
            <button class="mobile-filter-btn" (click)="toggleMobileFilter()">
              Filters & Refine
            </button>

            <span class="results-count">
              Showing <strong>{{ products.length }}</strong> products
            </span>

            <div class="sort-box">
              <label for="sortBy">Sort By:</label>
              <select id="sortBy" [(ngModel)]="sortBy" (change)="onFilterChange()" class="sort-select">
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="featured">Featured First</option>
              </select>
            </div>
          </div>

          <!-- Product Grid -->
          <div *ngIf="!isLoading; else loadingBlock">
            <div class="product-grid" *ngIf="products.length > 0; else emptyState">
              <app-product-card 
                *ngFor="let prod of products" 
                [product]="prod"
                (quickAdd)="onQuickAdd($event)"
              ></app-product-card>
            </div>
          </div>
        </main>
      </div>
    </div>

    <ng-template #loadingBlock>
      <div class="product-grid">
        <div class="skeleton-card" *ngFor="let s of [1,2,3,4,5,6]">
          <div class="skeleton-img"></div>
          <div class="skeleton-content">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line title"></div>
            <div class="skeleton-line price"></div>
          </div>
        </div>
      </div>
    </ng-template>

    <ng-template #emptyState>
      <div class="empty-products-box">
        <h3>No Products Found</h3>
        <p>We couldn't find any products matching your filter criteria.</p>
        <button (click)="resetFilters()" class="btn-primary">Clear Filters</button>
      </div>
    </ng-template>
  `,
  styles: [`
    .shop-header-banner {
      position: relative;
      background: linear-gradient(rgba(0,0,0,0.68), rgba(0,0,0,0.68)), url('https://i.ibb.co/TD42QpNd/Chat-GPT-Image-Aug-13-2026-12-50-56-PM.png') center/cover no-repeat;
      padding: 60px 20px;
      text-align: center;
      color: #FFFFFF;
    }
    .shop-title {
      font-size: 36px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 8px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }
    .shop-subtitle {
      font-size: 15px;
      color: rgba(255, 255, 255, 0.9);
      text-shadow: 0 1px 4px rgba(0,0,0,0.5);
    }
    @media (max-width: 768px) {
      .shop-header-banner { padding: 40px 16px; }
      .shop-title { font-size: 24px; }
      .shop-subtitle { font-size: 13px; }
    }

    .shop-container {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 40px;
      padding-top: 40px;
      padding-bottom: 80px;
    }
    @media (max-width: 992px) {
      .shop-container { grid-template-columns: 1fr; }
    }

    /* Sidebar Filters */
    .filter-sidebar {
      background: #FFFFFF;
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-md);
      padding: 24px;
      height: fit-content;
    }
    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--color-border-light);
    }
    .filter-header h3 {
      font-size: 18px;
    }
    .reset-btn {
      font-size: 12px;
      color: var(--color-gold);
      font-weight: 600;
      text-transform: uppercase;
      background: transparent;
      border: none;
      cursor: pointer;
    }
    .close-filter-mobile {
      display: none;
      font-size: 24px;
      background: transparent;
      border: none;
      cursor: pointer;
    }

    @media (max-width: 992px) {
      .filter-sidebar {
        position: fixed;
        inset: 0;
        z-index: 1000;
        overflow-y: auto;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        border-radius: 0;
      }
      .filter-sidebar.open-mobile {
        transform: translateX(0);
      }
      .close-filter-mobile { display: block; }
    }

    .filter-group {
      margin-bottom: 24px;
    }
    .filter-label {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--color-text-heading);
      margin-bottom: 12px;
      display: block;
    }

    .category-radio-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .radio-label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      color: var(--color-muted);
      cursor: pointer;
    }
    .radio-label input:checked + span {
      color: var(--color-pink-dark);
      font-weight: 600;
    }

    .size-filter-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .size-filter-chip {
      padding: 6px 12px;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: #FFFFFF;
      color: var(--color-text);
      transition: var(--transition);
      cursor: pointer;
    }
    .size-filter-chip.active {
      background-color: var(--color-pink-dark);
      border-color: var(--color-pink-dark);
      color: #FFFFFF;
    }

    .price-inputs {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .price-input {
      padding: 8px;
    }

    /* Toolbar */
    .shop-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding: 16px 20px;
      background-color: var(--color-bg-alt);
      border-radius: var(--radius-md);
    }
    .mobile-filter-btn {
      display: none;
      background: var(--color-text-heading);
      color: #FFFFFF;
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      font-weight: 500;
      font-size: 13px;
      border: none;
      cursor: pointer;
    }
    @media (max-width: 992px) {
      .mobile-filter-btn { display: block; }
    }
    .results-count {
      font-size: 14px;
      color: var(--color-muted);
    }
    .sort-box {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }
    .sort-select {
      padding: 8px 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: #FFFFFF;
    }

    /* Product Grid */
    .product-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    @media (max-width: 1200px) {
      .product-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 576px) {
      .product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    }

    .empty-products-box, .loading-box {
      text-align: center;
      padding: 60px 0;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid var(--color-pink-light);
      border-top-color: var(--color-pink-dark);
      border-radius: 50%;
      animation: spin 1s infinite linear;
      margin: 0 auto 16px auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Skeleton Placeholder Cards */
    .skeleton-card {
      background: #FFFFFF;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--color-border-light);
    }
    .skeleton-img {
      width: 100%;
      padding-top: 133%;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .skeleton-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .skeleton-line {
      height: 12px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }
    .skeleton-line.short { width: 35%; }
    .skeleton-line.title { width: 85%; height: 16px; }
    .skeleton-line.price { width: 50%; }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class ShopComponent implements OnInit {
  categories: Category[] = [];
  products: Product[] = [];
  isLoading = true;

  searchQuery = '';
  selectedCategorySlug = '';
  selectedSize: SizeOption | '' = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy: 'newest' | 'price-low' | 'price-high' | 'featured' = 'newest';

  isMobileFilterOpen = false;

  readonly availableSizes: SizeOption[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      if (params['category']) this.selectedCategorySlug = params['category'];
      if (params['search']) this.searchQuery = params['search'];
      if (params['size']) this.selectedSize = params['size'] as SizeOption;
      
      await this.loadInitialData();
    });
  }

  async loadInitialData() {
    try {
      this.categories = await this.productService.getCategories();
      await this.fetchFilteredProducts();
    } catch (e) {
      console.error('Error loading shop data:', e);
    } finally {
      this.isLoading = false;
    }
  }

  async fetchFilteredProducts() {
    this.isLoading = true;
    try {
      let catId: string | undefined = undefined;
      if (this.selectedCategorySlug) {
        const found = this.categories.find(c => c.slug === this.selectedCategorySlug);
        if (found) catId = found.id;
      }

      const options: ProductFilterOptions = {
        categoryId: catId,
        searchQuery: this.searchQuery,
        size: this.selectedSize || undefined,
        minPrice: this.minPrice || undefined,
        maxPrice: this.maxPrice || undefined,
        sortBy: this.sortBy,
        activeOnly: true
      };

      this.products = await this.productService.getProducts(options);
    } catch (err) {
      console.error('Error filtering products:', err);
    } finally {
      this.isLoading = false;
    }
  }

  onFilterChange() {
    this.fetchFilteredProducts();
  }

  toggleSizeFilter(size: SizeOption) {
    this.selectedSize = this.selectedSize === size ? '' : size;
    this.onFilterChange();
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedCategorySlug = '';
    this.selectedSize = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.sortBy = 'newest';
    this.router.navigate([], { queryParams: {} });
    this.fetchFilteredProducts();
  }

  toggleMobileFilter() {
    this.isMobileFilterOpen = !this.isMobileFilterOpen;
  }

  onQuickAdd(event: { product: Product; size: SizeOption }) {
    try {
      this.cartService.addToCart(event.product, event.size, 1);
      alert(`Added ${event.product.name} (Size: ${event.size}) to your cart!`);
    } catch (err: any) {
      alert(err.message || 'Could not add to cart');
    }
  }
}
