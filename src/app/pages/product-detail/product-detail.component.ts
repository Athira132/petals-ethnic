import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { Product, ProductImage, SizeOption, ColorVariant } from '../../core/models/product.model';
import { extractProductImages, handleImageError, getResponsiveImageUrl, ImageItem, DEFAULT_FALLBACK_IMAGE } from '../../core/utils/image.utils';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent],
  template: `
    <div class="product-detail-page" *ngIf="product; else loadingOrError">
      <div class="container pd-container">
        <!-- Breadcrumbs -->
        <nav class="breadcrumbs">
          <a routerLink="/">Home</a> &gt;
          <a [routerLink]="[product.department === 'jewellery' ? '/jewellery' : '/ethnics']">
            {{ product.department === 'jewellery' ? 'Jewellery' : 'Ethnics' }}
          </a> &gt;
          <a *ngIf="product.category" [routerLink]="[product.department === 'jewellery' ? '/jewellery' : '/ethnics']" [queryParams]="{category: product.category.slug}">
            {{ product.category.name }}
          </a> &gt;
          <span>{{ product.name }}</span>
        </nav>

        <div class="pd-grid">
          <!-- Image Gallery Column -->
          <div class="pd-gallery">
            <div class="main-image-box">
              <!-- Shimmer Skeleton Placeholder -->
              <div class="image-skeleton" [class.hidden]="isMainLoaded"></div>

              <!-- High-Resolution Primary Product Photo -->
              <img 
                *ngIf="activeImageUrl"
                [src]="activeImageUrl" 
                [alt]="product.name" 
                class="pd-main-img full-res-img"
                [class.loaded]="isMainLoaded"
                loading="eager"
                fetchpriority="high"
                decoding="async"
                (load)="isMainLoaded = true"
                (error)="onImageError($event); isMainLoaded = true"
              />
            </div>

            <!-- Thumbnail List -->
            <div class="thumbnail-row" *ngIf="images.length > 1">
              <button 
                *ngFor="let img of images"
                class="thumb-btn"
                [class.active]="img.image_url === activeImageUrl"
                (click)="activeImageUrl = img.image_url; isMainLoaded = false"
                [attr.aria-label]="'View image ' + img.display_order"
              >
                <img 
                  [src]="img.image_url" 
                  [alt]="product.name" 
                  class="thumb-img" 
                  loading="lazy"
                  decoding="async"
                  (error)="onImageError($event)" 
                />
              </button>
            </div>
          </div>

          <!-- Product Details Column -->
          <div class="pd-info">
            <!-- Brand & Category Badges -->
            <div class="brand-badge-row">
              <span class="pd-dept-tag">{{ product.department === 'jewellery' ? '✨ Fine Jewellery' : '🌸 Ethnic Boutique' }}</span>
              <span class="pd-category" *ngIf="product.category">{{ product.category.name }}</span>
            </div>

            <h1 class="pd-title">{{ product.name }}</h1>
            
            <div class="pd-sku" *ngIf="product.sku">SKU: {{ product.sku }}</div>

            <!-- Pricing -->
            <div class="pd-pricing">
              <ng-container *ngIf="product.sale_price && product.sale_price < product.price; else regularPrice">
                <span class="sale-price">₹{{ product.sale_price | number:'1.0-0' }}</span>
                <span class="original-price">₹{{ product.price | number:'1.0-0' }}</span>
                <span class="discount-badge">SAVE {{ discountPercentage }}%</span>
              </ng-container>
              <ng-template #regularPrice>
                <span class="regular-price">₹{{ product.price | number:'1.0-0' }}</span>
              </ng-template>
              <span class="tax-info">(Inclusive of all taxes)</span>
            </div>

            <!-- Availability & Low Stock Notice -->
            <div class="stock-status-banner" *ngIf="isLowStock && isAvailable">
              <span class="pulse-dot"></span>
              <span class="status-msg">{{ lowStockMessage }}</span>
            </div>

            <div class="out-of-stock-banner" *ngIf="!isAvailable">
              <span>❌ Currently Out of Stock</span>
            </div>

            <!-- Color Variations (if configured) -->
            <div class="pd-colors-section" *ngIf="product.has_colors && colorVariants.length > 0">
              <div class="section-header-row">
                <span class="section-label">Select Color:</span>
                <span class="selected-val-label" *ngIf="selectedColor">{{ selectedColor }}</span>
              </div>
              <div class="color-options-row">
                <button 
                  *ngFor="let col of colorVariants" 
                  class="color-chip-btn"
                  [class.active]="selectedColor === col.name"
                  (click)="selectColorVariant(col)"
                  [title]="col.name"
                >
                  <span 
                    class="color-swatch-circle" 
                    [style.background-color]="col.color_code || '#c05676'"
                  ></span>
                  <span class="color-chip-text">{{ col.name }}</span>
                </button>
              </div>
            </div>

            <!-- Size Selector (Only for Products with Sizes) -->
            <div class="pd-size-section" *ngIf="product.has_size !== false && sizeList.length > 0">
              <div class="size-header">
                <div class="size-header-left">
                  <span class="section-label">Select Size:</span>
                  <span class="selected-val-label" *ngIf="selectedSize">{{ selectedSize }}</span>
                </div>

                <!-- Size Chart Trigger (Only if configured) -->
                <button 
                  *ngIf="product.show_size_chart && product.size_chart_url" 
                  (click)="isSizeChartOpen = true" 
                  class="size-chart-trigger-btn"
                >
                  📏 View Size Chart
                </button>
              </div>

              <div class="size-options-grid">
                <button 
                  *ngFor="let sz of sizeList"
                  class="pd-size-btn"
                  [class.active]="selectedSize === sz.size"
                  [class.disabled]="sz.stock === 0"
                  [disabled]="sz.stock === 0"
                  (click)="selectSize(sz.size)"
                >
                  {{ sz.size }}
                </button>
              </div>
            </div>

            <!-- Actions: Quantity + Add to Cart + Buy Now + Wishlist -->
            <div class="pd-actions-wrapper">
              <div class="pd-actions-row">
                <!-- Quantity Stepper -->
                <div class="quantity-stepper" *ngIf="isAvailable">
                  <button (click)="decreaseQty()" [disabled]="quantity <= 1" class="step-btn" aria-label="Decrease quantity">-</button>
                  <span class="qty-num">{{ quantity }}</span>
                  <button (click)="increaseQty()" [disabled]="quantity >= maxQuantity" class="step-btn" aria-label="Increase quantity">+</button>
                </div>

                <!-- Add to Cart -->
                <button 
                  class="btn-primary flex-1" 
                  [disabled]="!isAvailable"
                  (click)="addToCart()"
                >
                  {{ isAvailable ? '🛒 Add to Cart' : 'Out of Stock' }}
                </button>

                <!-- Buy Now -->
                <button 
                  class="btn-gold flex-1" 
                  [disabled]="!isAvailable"
                  (click)="buyNow()"
                >
                  ⚡ Buy Now
                </button>

                <!-- Wishlist Toggle -->
                <button 
                  class="btn-wishlist" 
                  (click)="toggleWishlist()"
                  [class.active]="isWishlisted()"
                  [title]="isWishlisted() ? 'Remove from Wishlist' : 'Add to Wishlist'"
                  aria-label="Wishlist"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" [attr.fill]="isWishlisted() ? '#C2185B' : 'none'" stroke="#C2185B" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Description (Conditional) -->
            <div class="pd-description" *ngIf="product.description">
              <h3 class="desc-heading">Product Overview</h3>
              <p>{{ product.description }}</p>
            </div>

            <!-- Return Policy (Conditional) -->
            <div class="pd-policy-box" *ngIf="productReturnPolicy">
              <div class="policy-header" (click)="isPolicyOpen = !isPolicyOpen">
                <div class="policy-title">
                  <span>🔄</span>
                  <strong>Return & Exchange Policy</strong>
                </div>
                <span class="policy-toggle">{{ isPolicyOpen ? '▲' : '▼' }}</span>
              </div>
              <div class="policy-body" *ngIf="isPolicyOpen">
                <p>{{ productReturnPolicy }}</p>
              </div>
            </div>

            <!-- Embedded Product Video (Conditional) -->
            <div class="product-video-card" *ngIf="activeVideoUrl">
              <div class="video-header">
                <span class="video-icon">🎥</span>
                <span class="video-title">Product Video Showcase</span>
              </div>
              <div class="video-container">
                <ng-container *ngIf="isEmbedVideo(activeVideoUrl); else directVideo">
                  <iframe 
                    [src]="getSafeVideoUrl(activeVideoUrl)" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    class="video-frame"
                  ></iframe>
                </ng-container>
                <ng-template #directVideo>
                  <video 
                    [src]="activeVideoUrl" 
                    controls 
                    playsinline 
                    preload="metadata" 
                    class="video-player"
                  ></video>
                </ng-template>
              </div>
            </div>

            <!-- Shipping & Support Perks -->
            <div class="pd-perks">
              <div class="perk-item">
                <span>🚚</span>
                <span>Free delivery across India on prepaid orders.</span>
              </div>
              <div class="perk-item">
                <span>💬</span>
                <span>Need styling advice? <a [href]="whatsAppEnquiryUrl" target="_blank">Chat with our store concierge on WhatsApp</a></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Related Products Section -->
        <section class="related-section" *ngIf="relatedProducts.length > 0">
          <div class="section-header">
            <span class="section-subtitle">RECOMMENDED FOR YOU</span>
            <h2 class="section-title">Related {{ product.department === 'jewellery' ? 'Jewellery' : 'Ethnic' }} Styles</h2>
          </div>

          <div class="product-grid">
            <app-product-card 
              *ngFor="let rel of relatedProducts" 
              [product]="rel"
              (quickAdd)="onQuickAddRelated($event)"
            ></app-product-card>
          </div>
        </section>
      </div>
    </div>

    <!-- Size Chart Modal -->
    <div class="modal-backdrop" *ngIf="isSizeChartOpen" (click)="isSizeChartOpen = false">
      <div class="modal-card size-chart-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Size Chart</h3>
          <button class="close-modal-btn" (click)="isSizeChartOpen = false">&times;</button>
        </div>
        <div class="modal-body">
          <img 
            [src]="product?.size_chart_url" 
            alt="Product Size Chart" 
            class="size-chart-img" 
            (error)="onImageError($event)" 
          />
        </div>
      </div>
    </div>

    <ng-template #loadingOrError>
      <div class="loading-box">
        <div class="spinner"></div>
        <p>Loading product details...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .product-detail-page {
      padding: 32px 0 80px 0;
      background: #FAFAFA;
      min-height: 100vh;
    }
    .breadcrumbs {
      font-size: 13px;
      color: var(--color-muted);
      margin-bottom: 24px;
    }
    .breadcrumbs a {
      color: var(--color-text);
      text-decoration: none;
    }
    .breadcrumbs a:hover {
      color: var(--color-pink-dark);
    }

    .pd-grid {
      display: grid;
      grid-template-columns: minmax(0, 480px) minmax(0, 1fr);
      gap: 48px;
      margin-bottom: 60px;
      align-items: start;
    }
    @media (max-width: 992px) {
      .pd-grid {
        grid-template-columns: minmax(0, 1fr);
        gap: 32px;
      }
    }

    /* Gallery */
    .pd-gallery {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      max-width: 500px;
      margin: 0 auto;
    }
    .main-image-box {
      width: 100%;
      max-width: 500px;
      aspect-ratio: 1 / 1;
      position: relative;
      background-color: var(--color-bg-alt, #F8F9FA);
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--color-border-light);
      margin: 0 auto;
    }
    .image-skeleton {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, #F0ECE1 25%, #FAF7F0 50%, #F0ECE1 75%);
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.5s infinite;
      z-index: 1;
      transition: opacity 400ms ease;
    }
    .image-skeleton.hidden { opacity: 0; pointer-events: none; }

    @keyframes skeleton-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    .pd-main-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      transition: opacity 0.4s ease;
    }
    .pd-main-img.full-res-img {
      z-index: 2;
      opacity: 0;
    }
    .pd-main-img.full-res-img.loaded {
      opacity: 1;
    }

    .thumbnail-row {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding-bottom: 6px;
      justify-content: flex-start;
    }
    .thumb-btn {
      width: 72px;
      height: 72px;
      aspect-ratio: 1 / 1;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 2px solid var(--color-border-light);
      padding: 0;
      background: #F8F9FA;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }
    .thumb-btn.active {
      border-color: var(--color-pink-dark);
      box-shadow: 0 2px 8px rgba(192, 86, 118, 0.3);
    }
    .thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Product Video Showcase */
    .product-video-card {
      margin-top: 16px;
      background: #FFFFFF;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border-light);
      overflow: hidden;
    }
    .video-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: #FDF9F6;
      border-bottom: 1px solid var(--color-border-light);
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-heading);
    }
    .video-container {
      position: relative;
      width: 100%;
      padding-top: 56.25%; /* 16:9 Aspect Ratio */
      background: #000000;
    }
    .video-frame, .video-player {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: none;
    }

    /* Info Column */
    .brand-badge-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }
    .pd-dept-tag {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      padding: 3px 8px;
      border-radius: 4px;
      background: #FFF0F4;
      color: var(--color-pink-dark);
    }
    .pd-category {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--color-gold);
    }
    .pd-title {
      font-family: var(--font-serif);
      font-size: 30px;
      font-weight: 600;
      color: var(--color-text-heading);
      margin-bottom: 8px;
      line-height: 1.3;
    }
    .pd-sku {
      font-size: 12px;
      color: var(--color-muted);
      margin-bottom: 16px;
    }

    /* Pricing */
    .pd-pricing {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 16px;
    }
    .sale-price {
      font-size: 28px;
      font-weight: 700;
      color: var(--color-pink-dark);
    }
    .original-price {
      font-size: 18px;
      color: var(--color-light-muted);
      text-decoration: line-through;
    }
    .discount-badge {
      background: #FFF0F4;
      color: var(--color-pink-dark);
      font-size: 12px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
    }
    .regular-price {
      font-size: 28px;
      font-weight: 700;
      color: var(--color-text-heading);
    }
    .tax-info {
      font-size: 12px;
      color: var(--color-muted);
    }

    /* Stock Banner (No Numbers) */
    .stock-status-banner {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      padding: 6px 14px;
      border-radius: 20px;
      margin-bottom: 16px;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #D97706;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.3); }
    }
    .status-msg {
      font-size: 12px;
      font-weight: 600;
      color: #B45309;
      letter-spacing: 0.3px;
    }
    .out-of-stock-banner {
      display: inline-block;
      background: #FEE2E2;
      color: #991B1B;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .pd-description {
      font-size: 14px;
      line-height: 1.7;
      color: var(--color-text-main);
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--color-border-light);
    }

    /* Color Swatches */
    .pd-colors-section {
      margin-bottom: 22px;
    }
    .section-header-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    .section-label {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--color-text-heading);
    }
    .selected-val-label {
      font-size: 13px;
      font-weight: 700;
      color: var(--color-pink-dark);
    }
    .color-options-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .color-chip-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 30px;
      border: 1px solid var(--color-border);
      background: #FFFFFF;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .color-chip-btn:hover {
      border-color: var(--color-pink-dark);
    }
    .color-chip-btn.active {
      border-color: var(--color-pink-dark);
      background: #FFF5F7;
      box-shadow: 0 2px 8px rgba(192, 86, 118, 0.2);
    }
    .color-swatch-circle {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 1px solid rgba(0,0,0,0.15);
      flex-shrink: 0;
    }
    .color-chip-text {
      font-size: 13px;
      font-weight: 500;
      color: var(--color-text-heading);
    }

    /* Size Section */
    .pd-size-section {
      margin-bottom: 24px;
    }
    .size-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .size-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .size-chart-trigger-btn {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-pink-dark);
      background: transparent;
      border: none;
      cursor: pointer;
      text-decoration: underline;
    }
    .size-options-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .pd-size-btn {
      min-width: 48px;
      height: 42px;
      padding: 0 14px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: #FFFFFF;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-heading);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .pd-size-btn:hover:not(.disabled) {
      border-color: var(--color-pink-dark);
    }
    .pd-size-btn.active {
      background-color: var(--color-pink-dark);
      border-color: var(--color-pink-dark);
      color: #FFFFFF;
    }
    .pd-size-btn.disabled {
      opacity: 0.35;
      cursor: not-allowed;
      text-decoration: line-through;
    }

    /* Actions */
    .pd-actions-wrapper {
      margin-bottom: 24px;
    }
    .pd-actions-row {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .quantity-stepper {
      display: flex;
      align-items: center;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: #FFFFFF;
      height: 48px;
    }
    .step-btn {
      width: 40px;
      height: 100%;
      border: none;
      background: transparent;
      font-size: 18px;
      cursor: pointer;
    }
    .qty-num {
      padding: 0 12px;
      font-weight: 600;
      font-size: 15px;
    }
    .btn-primary {
      height: 48px;
      background-color: var(--color-pink-dark);
      color: #FFFFFF;
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-primary:hover:not(:disabled) {
      background-color: var(--color-pink);
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-gold {
      height: 48px;
      background-color: #B28742;
      color: #FFFFFF;
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-gold:hover:not(:disabled) {
      background-color: #9A7233;
    }
    .btn-gold:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .desc-heading {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--color-text-heading);
      margin-bottom: 8px;
    }

    /* Wishlist Button */
    .btn-wishlist {
      width: 48px;
      height: 48px;
      border: 1px solid var(--color-border);
      background: #FFFFFF;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .btn-wishlist:hover {
      background: #FFF0F4;
      border-color: var(--color-pink-dark);
      transform: translateY(-1px);
    }
    .btn-wishlist.active {
      background: #FFF0F4;
      border-color: var(--color-pink-dark);
    }

    /* Policy Accordion */
    .pd-policy-box {
      background: #FFFFFF;
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-sm);
      margin-bottom: 24px;
      overflow: hidden;
    }
    .policy-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 18px;
      cursor: pointer;
      background: #FAFAFA;
      user-select: none;
    }
    .policy-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--color-text-heading);
    }
    .policy-toggle {
      font-size: 11px;
      color: var(--color-muted);
    }
    .policy-body {
      padding: 14px 18px;
      font-size: 13px;
      line-height: 1.6;
      color: var(--color-text-main);
      border-top: 1px solid var(--color-border-light);
      background: #FFFFFF;
    }

    /* Perks */
    .pd-perks {
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-size: 13px;
      color: var(--color-muted);
      border-top: 1px solid var(--color-border-light);
      padding-top: 20px;
    }
    .perk-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .perk-item a {
      color: var(--color-pink-dark);
      text-decoration: underline;
    }

    /* Related Products Section */
    .related-section {
      margin-top: 60px;
    }
    .section-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .section-subtitle {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      color: var(--color-gold);
      text-transform: uppercase;
      display: block;
      margin-bottom: 6px;
    }
    .section-title {
      font-family: var(--font-serif);
      font-size: 26px;
      color: var(--color-text-heading);
    }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    @media (max-width: 992px) {
      .product-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
    }

    /* Size Chart Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.65);
      backdrop-filter: blur(4px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .modal-card.size-chart-modal {
      background: #FFFFFF;
      border-radius: var(--radius-md);
      max-width: 600px;
      width: 100%;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.25);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--color-border-light);
    }
    .modal-header h3 {
      font-size: 17px;
      font-weight: 600;
      margin: 0;
    }
    .close-modal-btn {
      background: transparent;
      border: none;
      font-size: 24px;
      cursor: pointer;
    }
    .modal-body {
      padding: 20px;
      text-align: center;
      max-height: 80vh;
      overflow-y: auto;
    }
    .size-chart-img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
    }

    .loading-box {
      text-align: center;
      padding: 100px 20px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(192, 86, 118, 0.2);
      border-top-color: var(--color-pink-dark);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 576px) {
      .product-detail-page {
        padding: 16px 0 60px 0;
      }
      .pd-grid {
        gap: 20px;
      }
      .main-image-box {
        max-width: 100%;
        border-radius: 8px;
      }
      .thumb-btn {
        width: 60px;
        height: 60px;
      }
      .pd-title {
        font-size: 22px;
      }
      .pd-actions-row {
        flex-wrap: wrap;
        gap: 10px;
      }
      .btn-primary, .btn-gold {
        min-width: 130px;
        font-size: 13px;
        height: 44px;
      }
      .btn-wishlist {
        height: 44px;
        width: 44px;
      }
      .quantity-stepper {
        height: 44px;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  images: ImageItem[] = [];
  activeImageUrl = '';
  activeVideoUrl: string | null = null;
  isMainLoaded = false;
  
  sizeList: { size: SizeOption; stock: number }[] = [];
  selectedSize: SizeOption | string = 'M';
  quantity = 1;

  colorVariants: ColorVariant[] = [];
  selectedColor = '';

  isSizeChartOpen = false;
  isPolicyOpen = true;

  relatedProducts: Product[] = [];

  readonly defaultReturnPolicy = '📦 7-Day Hassle-Free Returns & Exchanges. Items must be in original condition with tags and boutique packaging intact. Contact our support team for quick assistance.';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.route.params.subscribe(async params => {
      const slug = params['slug'];
      if (slug) {
        await this.loadProductDetails(slug);
      }
    });
  }

  async loadProductDetails(slug: string) {
    this.product = null;
    this.images = [];
    this.activeImageUrl = '';
    this.activeVideoUrl = null;
    this.isMainLoaded = false;
    this.relatedProducts = [];
    this.quantity = 1;
    this.selectedColor = '';
    this.cdr.markForCheck();

    const targetProduct = await this.productService.getProductBySlug(slug);
    if (!targetProduct) {
      this.router.navigate(['/ethnics']);
      return;
    }

    this.product = targetProduct;
    this.activeVideoUrl = this.product.video_url || null;

    // Load Colors
    this.colorVariants = this.product.color_variants || [];
    if (this.product.has_colors && this.colorVariants.length > 0) {
      this.selectedColor = this.colorVariants[0].name;
      // If the first color variant has specific images, load them
      const variantImgs = this.colorVariants[0].images || this.colorVariants[0].image_urls || [];
      if (variantImgs.length > 0) {
        this.images = variantImgs.map((url: string, i: number) => ({
          image_url: url,
          is_primary: i === 0,
          display_order: i + 1
        }));
      } else {
        this.images = extractProductImages(this.product);
      }
      if (this.colorVariants[0].video_url) {
        this.activeVideoUrl = this.colorVariants[0].video_url;
      }
    } else {
      this.images = extractProductImages(this.product);
    }

    if (this.images.length > 0) {
      this.activeImageUrl = this.images[0].image_url;
    }

    // Build Sizes (if product has sizes)
    if (this.product.has_size !== false) {
      const availableSizesList: SizeOption[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      if (this.product.sizes && this.product.sizes.length > 0) {
        this.sizeList = this.product.sizes.map(s => ({ size: s.size, stock: s.stock }));
      } else {
        this.sizeList = availableSizesList.map(size => ({ size, stock: this.product!.stock > 0 ? 5 : 0 }));
      }

      const inStock = this.sizeList.find(s => s.stock > 0);
      if (inStock) {
        this.selectedSize = inStock.size;
      } else if (this.sizeList.length > 0) {
        this.selectedSize = this.sizeList[0].size;
      }
    } else {
      this.selectedSize = 'One Size';
    }

    this.cdr.markForCheck();

    // Load related products
    if (this.product.category_id) {
      const catId = this.product.category_id;
      const currentId = this.product.id;
      this.productService.getProducts({ categoryId: catId }).then(allCategoryProducts => {
        this.relatedProducts = allCategoryProducts.filter(p => p.id !== currentId).slice(0, 4);
        this.cdr.markForCheck();
      }).catch(err => console.warn('Related products load notice:', err));
    }
  }

  selectColorVariant(variant: ColorVariant) {
    this.selectedColor = variant.name;
    // Swap images immediately without page reload!
    const variantImgs = variant.images || variant.image_urls || [];
    if (variantImgs.length > 0) {
      this.images = variantImgs.map((url: string, i: number) => ({
        image_url: url,
        is_primary: i === 0,
        display_order: i + 1
      }));
      this.activeImageUrl = this.images[0].image_url;
      this.isMainLoaded = false;
    } else {
      // Fallback to base product images
      this.images = extractProductImages(this.product!);
      if (this.images.length > 0) {
        this.activeImageUrl = this.images[0].image_url;
      }
    }

    // Swap video if variant has its own video
    if (variant.video_url) {
      this.activeVideoUrl = variant.video_url;
    } else {
      this.activeVideoUrl = this.product?.video_url || null;
    }

    this.cdr.markForCheck();
  }

  isEmbedVideo(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  }

  getSafeVideoUrl(url: string): SafeResourceUrl {
    let embedUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
      embedUrl = url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
      embedUrl = url.replace('youtu.be/', 'www.youtube.com/embed/');
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  get isAvailable(): boolean {
    if (!this.product) return false;
    if (this.product.has_size !== false) {
      return !!(this.selectedSizeConfig && this.selectedSizeConfig.stock > 0);
    }
    return this.product.stock > 0 && this.product.availability !== 'sold_out';
  }

  get isLowStock(): boolean {
    if (!this.product) return false;
    if (this.product.stock_display === 'few_left') return true;
    if (this.product.stock_display === 'hide') return false;

    if (this.product.has_size !== false) {
      return !!(this.selectedSizeConfig && this.selectedSizeConfig.stock > 0 && this.selectedSizeConfig.stock <= 5);
    }
    return (this.product.stock > 0 && this.product.stock <= 5) || this.product.availability === 'few_left';
  }

  get lowStockMessage(): string {
    return this.product?.custom_stock_message || 'Only a Few Items Left!';
  }

  get productReturnPolicy(): string {
    return this.product?.return_policy || this.defaultReturnPolicy;
  }

  get selectedSizeConfig() {
    return this.sizeList.find(s => s.size === this.selectedSize);
  }

  get maxQuantity(): number {
    if (this.product?.has_size !== false) {
      return this.selectedSizeConfig ? this.selectedSizeConfig.stock : 1;
    }
    return this.product?.stock || 5;
  }

  get discountPercentage(): number {
    if (this.product && this.product.sale_price && this.product.price > 0) {
      return Math.round(((this.product.price - this.product.sale_price) / this.product.price) * 100);
    }
    return 0;
  }

  get whatsAppEnquiryUrl(): string {
    if (!this.product) return 'https://wa.me/918113899319';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://petalethnics.com';
    const colorText = this.selectedColor ? ` | Color: ${this.selectedColor}` : '';
    const sizeText = (this.product.has_size !== false && this.selectedSize) ? ` | Size: ${this.selectedSize}` : '';
    const text = encodeURIComponent(
      `Hello Petal Ethnics & Jewellers! I am interested in enquiry for:\n*${this.product.name}* (Price: ₹${this.product.sale_price || this.product.price}${colorText}${sizeText})\nProduct Link: ${origin}/product/${this.product.slug}`
    );
    return `https://wa.me/918113899319?text=${text}`;
  }

  selectSize(size: SizeOption) {
    this.selectedSize = size;
    this.quantity = 1;
  }

  increaseQty() {
    if (this.quantity < this.maxQuantity) {
      this.quantity++;
    }
  }

  decreaseQty() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (!this.product || !this.isAvailable) return;
    try {
      const sizeToPass = this.product.has_size !== false ? (this.selectedSize as SizeOption) : undefined;
      this.cartService.addToCart(this.product, sizeToPass, this.quantity, this.selectedColor || undefined, this.activeImageUrl);
      alert(`Added ${this.quantity} item(s) of ${this.product.name} to cart!`);
    } catch (e: any) {
      alert(e.message || 'Error adding to cart');
    }
  }

  buyNow() {
    if (!this.product || !this.isAvailable) return;
    const sizeToPass = this.product.has_size !== false ? (this.selectedSize as SizeOption) : undefined;
    this.cartService.addToCart(this.product, sizeToPass, this.quantity, this.selectedColor || undefined, this.activeImageUrl);
    this.router.navigate(['/checkout']);
  }

  isWishlisted(): boolean {
    return this.product ? this.wishlistService.isInWishlist(this.product.id) : false;
  }

  toggleWishlist() {
    if (!this.product) return;
    const added = this.wishlistService.toggleWishlist(this.product);
    if (added) {
      alert(`Added ${this.product.name} to your Wishlist!`);
    } else {
      alert(`Removed ${this.product.name} from your Wishlist.`);
    }
  }

  onQuickAddRelated(event: { product: Product; size?: SizeOption }) {
    this.cartService.addToCart(event.product, event.size, 1);
    alert(`Added ${event.product.name} to cart!`);
  }

  onImageError(event: Event) {
    handleImageError(event);
  }
}
