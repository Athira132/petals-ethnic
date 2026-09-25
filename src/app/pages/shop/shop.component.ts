import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductService, ProductFilterOptions } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product, SizeOption } from '../../core/models/product.model';
import { Category, DepartmentType } from '../../core/models/category.model';
import { handleImageError } from '../../core/utils/image.utils';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent],
  template: `
    <div class="shop-page">
      <!-- Breadcrumb Navigation -->
      <div class="breadcrumb-container">
        <div class="container">
          <nav class="breadcrumb-nav" aria-label="Breadcrumb">
            <a [routerLink]="['/']">Home</a>
            <span class="sep">/</span>
            <a [routerLink]="[currentDepartment === 'jewellery' ? '/shop/jewellery' : '/shop/ethnics']">
              {{ currentDepartment === 'jewellery' ? 'Jewellery' : 'Ethnics' }}
            </a>
            <ng-container *ngIf="selectedCategorySlug">
              <span class="sep">/</span>
              <span class="current">{{ activeCategoryName }}</span>
            </ng-container>
          </nav>
        </div>
      </div>

      <!-- Department Selector Switcher -->
      <div class="department-switch-bar">
        <div class="container">
          <div class="dept-pills">
            <a 
              [routerLink]="['/shop/ethnics']" 
              class="dept-pill" 
              [class.active]="currentDepartment === 'ethnic'"
            >
              🌸 Ethnics Boutique
            </a>
            <a 
              [routerLink]="['/shop/jewellery']" 
              class="dept-pill" 
              [class.active]="currentDepartment === 'jewellery'"
            >
              ✨ Handcrafted Jewellery
            </a>
          </div>
        </div>
      </div>

      <!-- Category Hero Section -->
      <div class="category-hero" [style.background-image]="'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.4)), url(' + activeCategoryBannerImage + ')'">
        <div class="hero-content">
          <span class="hero-tagline">{{ heroTagline }}</span>
          <h1 class="hero-title">{{ activeCategoryName }}</h1>
          <p class="hero-description">{{ activeCategoryDescription }}</p>
        </div>
      </div>

      <!-- Visual Category Cards Row -->
      <div class="category-cards-section" *ngIf="displayedCategories.length > 0">
        <div class="container">
          <div class="category-cards-scroll">
            <button 
              class="category-mini-card"
              [class.active]="!selectedCategorySlug"
              (click)="selectCategoryBySlug('')"
            >
              <div class="mini-card-icon-wrap all-icon">
                <span>✦</span>
              </div>
              <span class="mini-card-title">All {{ currentDepartment === 'jewellery' ? 'Jewellery' : 'Ethnics' }}</span>
            </button>

            <button 
              *ngFor="let cat of displayedCategories; trackBy: trackByCategoryId" 
              class="category-mini-card"
              [class.active]="selectedCategorySlug === cat.slug"
              (click)="selectCategoryBySlug(cat.slug)"
            >
              <div class="mini-card-img-wrap">
                <img 
                  [src]="cat.image_url || defaultCardImage" 
                  [alt]="cat.name" 
                  class="mini-card-img" 
                  loading="lazy"
                  (error)="onImageError($event)" 
                />
              </div>
              <span class="mini-card-title">{{ cat.name }}</span>
            </button>
          </div>
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
            <label class="filter-label">Search {{ currentDepartment === 'jewellery' ? 'Jewellery' : 'Ethnics' }}</label>
            <input 
              type="text" 
              [placeholder]="'Search ' + (currentDepartment === 'jewellery' ? 'jewellery, earrings...' : 'kurtis, sarees...') + '...'" 
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
                <span>All {{ currentDepartment === 'jewellery' ? 'Jewellery' : 'Ethnics' }}</span>
              </label>
              <label *ngFor="let cat of displayedCategories; trackBy: trackByCategoryId" class="radio-label">
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

          <!-- Size Filter (Only for Ethnics!) -->
          <div class="filter-group" *ngIf="currentDepartment !== 'jewellery'">
            <label class="filter-label">Select Size</label>
            <div class="size-filter-chips">
              <button 
                *ngFor="let sz of availableSizes; trackBy: trackBySize"
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
          <!-- Top Bar (Mobile Filter Toggle + Sorting) -->
          <div class="shop-toolbar">
            <button class="mobile-filter-btn" (click)="toggleMobileFilter()">
              ⚡ Filter & Refine
            </button>

            <span class="results-count" *ngIf="!isLoading">
              Showing {{ products.length }} {{ products.length === 1 ? 'item' : 'items' }}
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

          <!-- Product Grid (4-Columns Desktop) -->
          <div *ngIf="!isLoading; else loadingBlock">
            <div class="product-grid" *ngIf="products.length > 0; else emptyState">
              <app-product-card 
                *ngFor="let prod of products; let i = index; trackBy: trackByProductId" 
                [product]="prod"
                [priority]="i < 4"
                (quickAdd)="onQuickAdd($event)"
              ></app-product-card>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Skeleton Loading Placeholder Grid -->
    <ng-template #loadingBlock>
      <div class="product-grid">
        <div class="skeleton-card" *ngFor="let s of [1,2,3,4,5,6,7,8]; trackBy: trackByIndex">
          <div class="skeleton-img"></div>
          <div class="skeleton-content">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line title"></div>
            <div class="skeleton-line price"></div>
          </div>
        </div>
      </div>
    </ng-template>

    <!-- Empty Collection State -->
    <ng-template #emptyState>
      <div class="empty-products-box">
        <div class="empty-icon">{{ currentDepartment === 'jewellery' ? '✨' : '🌸' }}</div>
        <h3>No {{ currentDepartment === 'jewellery' ? 'Jewellery' : 'Ethnics' }} Available in this Selection</h3>
        <p>Try clearing your filter or explore our other collections.</p>
        <button (click)="resetFilters()" class="btn-primary">View All {{ currentDepartment === 'jewellery' ? 'Jewellery' : 'Ethnics' }}</button>
      </div>
    </ng-template>
  `,
  styles: [`
    .shop-page {
      background-color: #FAFAFA;
      min-height: 100vh;
    }

    /* Breadcrumbs */
    .breadcrumb-container {
      background: #FFFFFF;
      border-bottom: 1px solid var(--color-border-light);
      padding: 12px 0;
    }
    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--color-muted);
    }
    .breadcrumb-nav a {
      color: var(--color-text-heading);
      text-decoration: none;
      transition: var(--transition);
    }
    .breadcrumb-nav a:hover, .breadcrumb-nav a.active {
      color: var(--color-pink-dark);
    }
    .breadcrumb-nav .sep {
      color: var(--color-border);
    }
    .breadcrumb-nav .current {
      color: var(--color-pink-dark);
      font-weight: 600;
    }

    /* Department Switcher */
    .department-switch-bar {
      background: #FFFFFF;
      border-bottom: 1px solid var(--color-border-light);
      padding: 10px 0;
    }
    .dept-pills {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    .dept-pill {
      display: inline-flex;
      align-items: center;
      padding: 8px 20px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-heading);
      background: #F3F4F6;
      text-decoration: none;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }
    .dept-pill:hover {
      background: #E5E7EB;
    }
    .dept-pill.active {
      background: var(--color-pink-dark);
      color: #FFFFFF;
      border-color: var(--color-pink-dark);
      box-shadow: 0 4px 10px rgba(192, 86, 118, 0.25);
    }

    /* Category Hero Header */
    .category-hero {
      position: relative;
      background-size: cover;
      background-position: center;
      padding: 60px 20px;
      text-align: center;
      color: #FFFFFF;
      margin-bottom: 0;
    }
    .hero-content {
      max-width: 700px;
      margin: 0 auto;
    }
    .hero-tagline {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #E8B4C0;
      margin-bottom: 10px;
      display: block;
    }
    .hero-title {
      font-family: var(--font-serif);
      font-size: 38px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 10px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }
    .hero-description {
      font-size: 15px;
      font-weight: 300;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.95);
      text-shadow: 0 1px 6px rgba(0,0,0,0.5);
    }
    @media (max-width: 768px) {
      .category-hero { padding: 40px 16px; }
      .hero-title { font-size: 26px; }
      .hero-description { font-size: 13px; }
    }

    /* Visual Category Cards Strip */
    .category-cards-section {
      background: #FFFFFF;
      border-bottom: 1px solid var(--color-border-light);
      padding: 16px 0;
      position: sticky;
      top: 65px;
      z-index: 90;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .category-cards-scroll {
      display: flex;
      align-items: center;
      gap: 16px;
      overflow-x: auto;
      white-space: nowrap;
      scrollbar-width: none;
      -ms-overflow-style: none;
      padding: 4px 0;
    }
    .category-cards-scroll::-webkit-scrollbar {
      display: none;
    }
    .category-mini-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 14px 6px 6px;
      border-radius: 40px;
      border: 1px solid var(--color-border);
      background: #FFFFFF;
      cursor: pointer;
      transition: all 0.25s ease;
      flex-shrink: 0;
    }
    .category-mini-card:hover {
      border-color: var(--color-pink-dark);
      transform: translateY(-1px);
    }
    .category-mini-card.active {
      background: var(--color-pink-dark);
      border-color: var(--color-pink-dark);
      box-shadow: 0 2px 8px rgba(192, 86, 118, 0.25);
    }
    .category-mini-card.active .mini-card-title {
      color: #FFFFFF;
    }
    .mini-card-img-wrap, .mini-card-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      overflow: hidden;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .mini-card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .all-icon {
      background: #FFF0F4;
      color: var(--color-pink-dark);
      font-size: 16px;
      font-weight: 700;
    }
    .category-mini-card.active .all-icon {
      background: #FFFFFF;
      color: var(--color-pink-dark);
    }
    .mini-card-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-heading);
      white-space: nowrap;
    }

    /* Main Container Layout */
    .shop-container {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 36px;
      padding-top: 36px;
      padding-bottom: 80px;
    }
    @media (max-width: 992px) {
      .shop-container { grid-template-columns: 1fr; gap: 20px; }
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
      font-size: 17px;
      font-weight: 600;
    }
    .reset-btn {
      font-size: 12px;
      color: var(--color-pink-dark);
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
      font-size: 12px;
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
      padding: 14px 20px;
      background-color: #FFFFFF;
      border: 1px solid var(--color-border-light);
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
      margin-left: auto;
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
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    @media (max-width: 1200px) {
      .product-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 768px) {
      .product-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
    }

    .empty-products-box {
      text-align: center;
      padding: 60px 20px;
      background: #FFFFFF;
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-md);
    }
    .empty-icon {
      font-size: 36px;
      margin-bottom: 16px;
    }
    .empty-products-box h3 {
      font-size: 20px;
      margin-bottom: 8px;
      color: var(--color-text-heading);
    }
    .empty-products-box p {
      color: var(--color-muted);
      margin-bottom: 24px;
    }
    .btn-primary {
      background-color: var(--color-pink-dark);
      color: #FFFFFF;
      padding: 12px 24px;
      border-radius: var(--radius-sm);
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
    }
    .btn-primary:hover {
      background-color: var(--color-pink);
    }

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
export class ShopComponent implements OnInit, OnDestroy {
  allCategories: Category[] = [];
  products: Product[] = [];
  isLoading = true;

  currentDepartment: DepartmentType = 'ethnic';
  selectedCategorySlug = '';
  searchQuery = '';
  selectedSize: SizeOption | '' = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy: 'featured' | 'newest' | 'price-low' | 'price-high' = 'newest';

  isMobileFilterOpen = false;

  readonly availableSizes: SizeOption[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  readonly defaultCardImage = 'https://i.ibb.co/TD42QpNd/Chat-GPT-Image-Aug-13-2026-12-50-56-PM.png';

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // 1. Detect department from route data or URL
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (data && data['department']) {
        this.currentDepartment = data['department'];
      } else {
        const url = this.router.url.toLowerCase();
        if (url.includes('/jewellery')) {
          this.currentDepartment = 'jewellery';
        } else {
          this.currentDepartment = 'ethnic';
        }
      }
    });

    // 2. React to query parameters
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(async params => {
      this.selectedCategorySlug = params['category'] || '';
      this.searchQuery = params['search'] || '';
      this.selectedSize = (params['size'] as SizeOption) || '';
      
      this.trySyncCachedProducts();
      await this.loadInitialData();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get displayedCategories(): Category[] {
    return this.allCategories.filter(c => (c.department || 'ethnic') === this.currentDepartment);
  }

  get heroTagline(): string {
    return this.currentDepartment === 'jewellery' 
      ? 'PETAL JEWELLERS • EXQUISITE DESIGNS' 
      : 'PETAL ETHNICS • ARTISANAL BOUTIQUE';
  }

  get activeCategoryName(): string {
    if (this.selectedCategorySlug) {
      const found = this.displayedCategories.find(c => c.slug === this.selectedCategorySlug);
      if (found) return found.name;
    }
    return this.currentDepartment === 'jewellery' 
      ? 'Handcrafted Jewellery Collection' 
      : 'Ethnic Wear & Boutique Collection';
  }

  get activeCategoryDescription(): string {
    if (this.selectedCategorySlug) {
      const found = this.displayedCategories.find(c => c.slug === this.selectedCategorySlug);
      if (found && found.description) return found.description;
    }
    return this.currentDepartment === 'jewellery' 
      ? 'Discover temple necklaces, earrings, bangles, and rings crafted with timeless artistry.'
      : 'Explore handcrafted Kurtis, Sarees, Anarkalis, Co-ord Sets, and Midi Dresses.';
  }

  get activeCategoryBannerImage(): string {
    if (this.selectedCategorySlug && this.displayedCategories.length > 0) {
      const found = this.displayedCategories.find(c => c.slug === this.selectedCategorySlug);
      if (found && found.image_url) return found.image_url;
    }
    return this.currentDepartment === 'jewellery' 
      ? 'https://i.ibb.co/0yhmLfnt/Chat-GPT-Image-Aug-13-2026-11-59-23-AM.png'
      : 'https://i.ibb.co/TD42QpNd/Chat-GPT-Image-Aug-13-2026-12-50-56-PM.png';
  }

  selectCategoryBySlug(slug: string) {
    this.selectedCategorySlug = slug;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: slug || null },
      queryParamsHandling: 'merge'
    });
    this.onFilterChange();
  }

  private trySyncCachedProducts() {
    try {
      const syncCats = this.productService.getCachedCategoriesSync();
      if (syncCats && syncCats.length > 0) {
        this.allCategories = syncCats;
      }
      const syncProds = this.productService.getProductsSync(this.getFilterOptions());
      if (syncProds && syncProds.length > 0) {
        // Enforce strict department separation
        this.products = syncProds.filter(p => (p.department || 'ethnic') === this.currentDepartment);
        this.isLoading = false;
      }
    } catch {}
  }

  private getFilterOptions(): ProductFilterOptions {
    let catId: string | undefined = undefined;
    if (this.selectedCategorySlug && this.displayedCategories.length > 0) {
      const found = this.displayedCategories.find(c => c.slug === this.selectedCategorySlug);
      if (found) catId = found.id;
    }
    return {
      categoryId: catId,
      searchQuery: this.searchQuery,
      size: (this.currentDepartment === 'ethnic') ? (this.selectedSize || undefined) : undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      sortBy: this.sortBy,
      activeOnly: true
    };
  }

  async loadInitialData() {
    try {
      this.allCategories = await this.productService.getCategories();
      this.trySyncCachedProducts();
      await this.fetchFilteredProducts();
    } catch (e) {
      console.error('Error loading shop data:', e);
    } finally {
      this.isLoading = false;
    }
  }

  async fetchFilteredProducts() {
    if (this.products.length === 0) {
      this.isLoading = true;
    }
    try {
      const options = this.getFilterOptions();
      const freshProds = await this.productService.getProducts(options);
      // Strictly separate ethnics and jewellery
      this.products = freshProds.filter(p => (p.department || 'ethnic') === this.currentDepartment);
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
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
    this.fetchFilteredProducts();
  }

  toggleMobileFilter() {
    this.isMobileFilterOpen = !this.isMobileFilterOpen;
  }

  trackByCategoryId(index: number, category: Category): string {
    return category.id;
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  trackBySize(index: number, size: string): string {
    return size;
  }

  trackByIndex(index: number): number {
    return index;
  }

  onImageError(event: Event) {
    handleImageError(event);
  }

  onQuickAdd(event: { product: Product; size?: SizeOption }) {
    try {
      this.cartService.addToCart(event.product, event.size, 1);
      alert(`Added ${event.product.name} to your cart!`);
    } catch (err: any) {
      alert(err.message || 'Could not add to cart');
    }
  }
}
