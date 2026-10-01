import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { SeoService } from '../../core/services/seo.service';
import { Product, SizeOption, ColorVariant } from '../../core/models/product.model';
import { extractProductImages, handleImageError, ImageItem, DEFAULT_FALLBACK_IMAGE } from '../../core/utils/image.utils';

export interface GalleryMediaItem {
  type: 'image' | 'video';
  url: string;
  display_order: number;
}

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
          <!-- Integrated Media Gallery Column: Photos + Video as Natural Final Slide -->
          <div class="pd-gallery">
            <div 
              class="main-image-box"
              (touchstart)="onGalleryTouchStart($event)"
              (touchmove)="onGalleryTouchMove($event)"
              (touchend)="onGalleryTouchEnd($event)"
            >
              <!-- Shimmer Skeleton Placeholder -->
              <div class="image-skeleton" [class.hidden]="isMainLoaded || activeMedia?.type === 'video'"></div>

              <!-- 1. Active Photo Slide -->
              <img 
                *ngIf="activeMedia?.type === 'image'"
                [src]="activeMedia!.url" 
                [alt]="product.name + ' - View ' + (activeMediaIndex + 1) + ' | Petals Ethnics and Jewellers'" 
                class="pd-main-img full-res-img"
                [class.loaded]="isMainLoaded"
                loading="eager"
                fetchpriority="high"
                decoding="async"
                width="500"
                height="500"
                (load)="isMainLoaded = true"
                (error)="onImageError($event); isMainLoaded = true"
              />

              <!-- 2. Active Video Slide (Integrated seamlessly in the main gallery) -->
              <ng-container *ngIf="activeMedia?.type === 'video'">
                <ng-container *ngIf="isEmbedVideo(activeMedia!.url); else directGalleryVideo">
                  <iframe 
                    [src]="getSafeVideoUrl(activeMedia!.url)" 
                    class="pd-video-frame"
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    playsinline
                  ></iframe>
                </ng-container>
                <ng-template #directGalleryVideo>
                  <video 
                    [src]="activeMedia!.url" 
                    autoplay 
                    muted 
                    loop 
                    controls
                    playsinline 
                    preload="metadata" 
                    class="pd-video-player"
                  ></video>
                </ng-template>
              </ng-container>

              <!-- Gallery Prev / Next Navigation Arrows (if multiple media items) -->
              <button 
                *ngIf="galleryItems.length > 1" 
                type="button" 
                class="gallery-arrow prev-arrow" 
                (click)="prevMedia($event)" 
                aria-label="Previous image"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              <button 
                *ngIf="galleryItems.length > 1" 
                type="button" 
                class="gallery-arrow next-arrow" 
                (click)="nextMedia($event)" 
                aria-label="Next image"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            <!-- Thumbnail List (Images + Video thumbnail as final item) -->
            <div class="thumbnail-row" *ngIf="galleryItems.length > 1">
              <button 
                *ngFor="let item of galleryItems; let i = index"
                type="button"
                class="thumb-btn"
                [class.active]="activeMediaIndex === i"
                [class.video-thumb]="item.type === 'video'"
                (click)="selectMedia(i)"
                [attr.aria-label]="item.type === 'video' ? 'Product Video' : 'View image ' + (i + 1)"
              >
                <img 
                  *ngIf="item.type === 'image'"
                  [src]="item.url" 
                  [alt]="product.name + ' - Thumbnail ' + (i + 1)" 
                  class="thumb-img" 
                  loading="lazy" 
                  decoding="async" 
                  width="64" 
                  height="64" 
                  (error)="onImageError($event)" 
                />

                <div *ngIf="item.type === 'video'" class="thumb-video-poster">
                  <img 
                    [src]="primaryThumbUrl" 
                    [alt]="product.name + ' - Video'" 
                    class="thumb-img" 
                    loading="lazy" 
                    width="64" 
                    height="64" 
                  />
                  <div class="thumb-play-overlay">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF">
                      <polygon points="6,4 20,12 6,20"></polygon>
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Product Details Column: Compact, Balanced, and Seamlessly Aligned -->
          <div class="pd-info">
            <!-- Brand & Category Badges -->
            <div class="brand-badge-row">
              <span class="pd-dept-tag">{{ product.department === 'jewellery' ? 'Fine Jewellery' : 'Ethnic Boutique' }}</span>
              <span class="pd-category" *ngIf="product.category">{{ product.category.name }}</span>
            </div>

            <!-- Product Title -->
            <h1 class="pd-title">{{ product.name }}</h1>

            <!-- Product Status Line: New Arrival, Best Seller, Only Few Left in RED -->
            <div class="pd-status-line" *ngIf="productStatuses.length > 0">
              <ng-container *ngFor="let st of productStatuses; let last = last">
                <span [class.status-red]="st.isRed">{{ st.text }}</span>
                <span class="status-sep" *ngIf="!last"> • </span>
              </ng-container>
            </div>
            
            <div class="pd-sku" *ngIf="product.sku">SKU: {{ product.sku }}</div>

            <!-- Pricing: DARK PINK #9F3D62 -->
            <div class="pd-pricing">
              <ng-container *ngIf="isOnSale; else regularPrice">
                <span class="sale-price">₹{{ product.sale_price | number:'1.0-0' }}</span>
                <span class="original-price">₹{{ product.price | number:'1.0-0' }}</span>
                <span class="discount-badge" *ngIf="!isSoldOut">SAVE {{ discountPercentage }}%</span>
              </ng-container>
              <ng-template #regularPrice>
                <span class="regular-price">₹{{ product.price | number:'1.0-0' }}</span>
              </ng-template>
              <span class="tax-info">(Inclusive of all taxes)</span>
            </div>

            <!-- Out of Stock / Sold Out Banner -->
            <div class="out-of-stock-banner" *ngIf="!isAvailable">
              <span>{{ isSoldOut ? 'Sold Out' : 'Currently Out of Stock' }}</span>
            </div>

            <!-- Color Variations (Completely collapsed when not present) -->
            <div class="pd-colors-section" *ngIf="product.has_colors && colorVariants.length > 0">
              <div class="section-header-row">
                <span class="section-label">Select Color:</span>
                <span class="selected-val-label" *ngIf="selectedColor">{{ selectedColor }}</span>
              </div>
              <div class="color-options-row">
                <button 
                  *ngFor="let col of colorVariants" 
                  type="button"
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

            <!-- Size Selector (Completely collapsed when no sizes exist or for jewellery) -->
            <div class="pd-size-section" *ngIf="product.has_size !== false && product.department !== 'jewellery' && sizeList.length > 0">
              <div class="size-header">
                <div class="size-header-left">
                  <span class="section-label">Select Size:</span>
                  <span class="selected-val-label" *ngIf="selectedSize">{{ selectedSize }}</span>
                </div>

                <!-- Size Chart Trigger -->
                <button 
                  *ngIf="product.show_size_chart !== false" 
                  type="button"
                  (click)="isSizeChartOpen = true" 
                  class="size-chart-trigger-btn"
                >
                  View Size Chart
                </button>
              </div>

              <div class="size-options-grid">
                <button 
                  *ngFor="let sz of sizeList"
                  type="button"
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
                  <button type="button" (click)="decreaseQty()" [disabled]="quantity <= 1" class="step-btn" aria-label="Decrease quantity">-</button>
                  <span class="qty-num">{{ quantity }}</span>
                  <button type="button" (click)="increaseQty()" [disabled]="quantity >= maxQuantity" class="step-btn" aria-label="Increase quantity">+</button>
                </div>

                <!-- Add to Cart (Luxury Dark #1A1A1A) -->
                <button 
                  type="button"
                  class="btn-primary flex-1" 
                  [disabled]="!isAvailable"
                  (click)="addToCart()"
                >
                  {{ addToCartButtonText }}
                </button>

                <!-- Buy Now (Luxury Dark #262626) -->
                <button 
                  type="button"
                  class="btn-gold flex-1" 
                  [disabled]="!isAvailable"
                  (click)="buyNow()"
                >
                  Buy Now
                </button>

                <!-- Wishlist Toggle -->
                <button 
                  type="button"
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

            <!-- Description (Collapsed when not available) -->
            <div class="pd-description" *ngIf="product.description">
              <h3 class="desc-heading">Product Overview</h3>
              <p>{{ product.description }}</p>
            </div>

            <!-- Return Policy (Collapsed when not available) -->
            <div class="pd-policy-box" *ngIf="productReturnPolicy">
              <div class="policy-header" (click)="isPolicyOpen = !isPolicyOpen">
                <div class="policy-title">
                  <strong>Return & Exchange Policy</strong>
                </div>
                <span class="policy-toggle">{{ isPolicyOpen ? '▲' : '▼' }}</span>
              </div>
              <div class="policy-body" *ngIf="isPolicyOpen">
                <p>{{ productReturnPolicy }}</p>
              </div>
            </div>

            <!-- Shipping & Support Perks -->
            <div class="pd-perks">
              <div class="perk-item">
                <span>Free delivery across India on prepaid orders.</span>
              </div>
              <div class="perk-item">
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
          <button type="button" class="close-modal-btn" (click)="isSizeChartOpen = false" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body">
          <div *ngIf="product?.size_chart_url" class="custom-chart-wrapper">
            <img 
              [src]="product?.size_chart_url" 
              alt="Product Size Chart" 
              class="size-chart-img" 
              (error)="onImageError($event)" 
            />
          </div>

          <div class="size-table-container">
            <div class="table-intro">Standard Ethnic Sizing (Inches & CM)</div>
            <table class="size-guide-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Bust (in)</th>
                  <th>Waist (in)</th>
                  <th>Hip (in)</th>
                  <th>Bust (cm)</th>
                  <th>Waist (cm)</th>
                  <th>Hip (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><strong>XS</strong></td><td>34</td><td>28</td><td>36</td><td>86</td><td>71</td><td>91</td></tr>
                <tr><td><strong>S</strong></td><td>36</td><td>30</td><td>38</td><td>91</td><td>76</td><td>96</td></tr>
                <tr><td><strong>M</strong></td><td>38</td><td>32</td><td>40</td><td>96</td><td>81</td><td>101</td></tr>
                <tr><td><strong>L</strong></td><td>40</td><td>34</td><td>42</td><td>101</td><td>86</td><td>106</td></tr>
                <tr><td><strong>XL</strong></td><td>42</td><td>36</td><td>44</td><td>106</td><td>91</td><td>111</td></tr>
                <tr><td><strong>XXL</strong></td><td>44</td><td>38</td><td>46</td><td>111</td><td>96</td><td>116</td></tr>
                <tr class="highlight-row"><td><strong>3XL</strong></td><td>46</td><td>40</td><td>48</td><td>116</td><td>101</td><td>121</td></tr>
              </tbody>
            </table>
            <p class="size-guide-note">Measurements are body measurements. For relaxed fits or custom adjustments, feel free to contact us.</p>
          </div>
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
      color: #9F3D62;
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

    /* Gallery Column */
    .pd-gallery {
      display: flex;
      flex-direction: column;
      gap: 14px;
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
      touch-action: pan-y pinch-zoom;
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

    /* Embedded Video within the Main Image Box */
    .pd-video-frame {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: none;
      background: #000000;
      z-index: 2;
    }
    .pd-video-player {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      background: #000000;
      z-index: 2;
    }

    /* Gallery Navigation Arrows */
    .gallery-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 5;
      transition: all 0.2s ease;
      opacity: 0.85;
    }
    .gallery-arrow:hover {
      background: #FFFFFF;
      opacity: 1;
      transform: translateY(-50%) scale(1.08);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    .gallery-arrow.prev-arrow {
      left: 10px;
    }
    .gallery-arrow.next-arrow {
      right: 10px;
    }

    /* Thumbnail List */
    .thumbnail-row {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 4px;
      justify-content: flex-start;
    }
    .thumb-btn {
      width: 68px;
      height: 68px;
      aspect-ratio: 1 / 1;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 2px solid var(--color-border-light);
      padding: 0;
      background: #F8F9FA;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.2s ease;
      position: relative;
    }
    .thumb-btn.active {
      border-color: #9F3D62;
      box-shadow: 0 2px 8px rgba(159, 61, 98, 0.3);
    }
    .thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* Video Thumbnail Styling */
    .thumb-video-poster {
      position: relative;
      width: 100%;
      height: 100%;
      background: #000000;
    }
    .thumb-play-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.45);
    }
    .thumb-play-overlay svg {
      margin-left: 2px;
    }

    /* Details Column */
    .pd-info {
      display: flex;
      flex-direction: column;
    }
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
      color: #9F3D62;
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
      font-size: 28px;
      font-weight: 600;
      color: var(--color-text-heading);
      margin-bottom: 6px;
      line-height: 1.3;
    }

    /* Status Line */
    .pd-status-line {
      font-size: 13px;
      font-weight: 600;
      color: #B45309;
      letter-spacing: 0.3px;
      margin-bottom: 8px;
    }
    .status-red {
      color: #DC2626 !important;
      font-weight: 700;
    }
    .status-sep {
      color: #D1D5DB;
      margin: 0 6px;
    }

    .pd-sku {
      font-size: 12px;
      color: var(--color-muted);
      margin-bottom: 10px;
    }

    /* Pricing: DARK PINK #9F3D62 */
    .pd-pricing {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 14px;
    }
    .sale-price {
      font-size: 28px;
      font-weight: 700;
      color: #9F3D62;
    }
    .original-price {
      font-size: 18px;
      color: var(--color-light-muted);
      text-decoration: line-through;
    }
    .discount-badge {
      background: #FFF0F4;
      color: #9F3D62;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
    }
    .regular-price {
      font-size: 28px;
      font-weight: 700;
      color: #9F3D62;
    }
    .tax-info {
      font-size: 12px;
      color: var(--color-muted);
    }

    .out-of-stock-banner {
      display: inline-block;
      background: #FEE2E2;
      color: #991B1B;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 14px;
      width: fit-content;
    }

    .pd-description {
      font-size: 14px;
      line-height: 1.7;
      color: var(--color-text-main);
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--color-border-light);
    }

    /* Color Swatches */
    .pd-colors-section {
      margin-bottom: 18px;
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
      color: #9F3D62;
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
      border-color: #9F3D62;
    }
    .color-chip-btn.active {
      border-color: #9F3D62;
      background: #FFF5F7;
      box-shadow: 0 2px 8px rgba(159, 61, 98, 0.2);
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
      margin-bottom: 20px;
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
      color: #9F3D62;
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
      border-color: #1A1A1A;
      background: #F5F5F5;
    }
    .pd-size-btn.active {
      background-color: #1A1A1A;
      border-color: #1A1A1A;
      color: #FFFFFF;
    }
    .pd-size-btn.disabled {
      opacity: 0.35;
      cursor: not-allowed;
      text-decoration: line-through;
    }

    /* Actions */
    .pd-actions-wrapper {
      margin-bottom: 22px;
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

    /* Buttons: DARK AESTHETIC (#1A1A1A) */
    .btn-primary {
      height: 48px;
      background-color: #1A1A1A;
      color: #FFFFFF;
      border: 1px solid #1A1A1A;
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
      background-color: #2D2D2D;
      border-color: #2D2D2D;
      color: #FFFFFF;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-gold {
      height: 48px;
      background-color: #262626;
      color: #FFFFFF;
      border: 1px solid #262626;
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
      background-color: #383838;
      border-color: #383838;
      color: #FFFFFF;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
      border-color: #9F3D62;
      transform: translateY(-1px);
    }
    .btn-wishlist.active {
      background: #FFF0F4;
      border-color: #9F3D62;
    }

    /* Policy Accordion */
    .pd-policy-box {
      background: #FFFFFF;
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-sm);
      margin-bottom: 20px;
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
      padding-top: 18px;
    }
    .perk-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .perk-item a {
      color: #9F3D62;
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
    .custom-chart-wrapper {
      margin-bottom: 20px;
    }
    .size-table-container {
      overflow-x: auto;
      margin-top: 10px;
      border: 1px solid var(--color-border-light);
      border-radius: 6px;
      padding: 12px;
      background: #FFFFFF;
    }
    .table-intro {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-heading);
      margin-bottom: 10px;
      text-align: left;
      letter-spacing: 0.5px;
    }
    .size-guide-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      text-align: center;
    }
    .size-guide-table th {
      background: #FDF4F6;
      color: #9F3D62;
      padding: 9px 8px;
      font-weight: 600;
      border: 1px solid #EAE6E1;
      font-size: 11px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .size-guide-table td {
      padding: 8px 8px;
      border: 1px solid #EAE6E1;
      color: #333333;
    }
    .size-guide-table tr:nth-child(even) td {
      background-color: #FAFAFA;
    }
    .size-guide-table tr.highlight-row td {
      background-color: #FFF5F7;
      font-weight: 600;
      color: #9F3D62;
    }
    .size-guide-note {
      font-size: 12px;
      color: #666666;
      margin-top: 10px;
      text-align: left;
      line-height: 1.5;
    }

    .loading-box {
      text-align: center;
      padding: 100px 20px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(159, 61, 98, 0.2);
      border-top-color: #9F3D62;
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
        width: 58px;
        height: 58px;
      }
      .pd-title {
        font-size: 22px;
      }
      .pd-actions-row {
        flex-wrap: wrap;
        gap: 10px;
      }
      .btn-primary, .btn-gold {
        flex: 1 1 calc(50% - 6px);
        min-width: 120px;
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

    @media (max-width: 480px) {
      .pd-title {
        font-size: 19px;
        line-height: 1.3;
      }
      .pd-pricing {
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 12px;
      }
      .sale-price {
        font-size: 22px;
        color: #9F3D62;
      }
      .original-price {
        font-size: 15px;
      }
      .pd-actions-row {
        gap: 8px;
      }
      .btn-primary, .btn-gold {
        flex: 1 1 100%;
        width: 100%;
      }
      .quantity-stepper {
        flex: 1;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  galleryItems: GalleryMediaItem[] = [];
  activeMediaIndex = 0;
  isMainLoaded = false;
  
  sizeList: { size: SizeOption; stock: number }[] = [];
  selectedSize: SizeOption | string = 'M';
  quantity = 1;

  colorVariants: ColorVariant[] = [];
  selectedColor = '';

  isSizeChartOpen = false;
  isPolicyOpen = true;

  relatedProducts: Product[] = [];

  readonly defaultReturnPolicy = '7-Day Hassle-Free Returns & Exchanges. Items must be in original condition with tags and boutique packaging intact. Contact our support team for quick assistance.';

  private galleryTouchStartX = 0;
  private galleryTouchStartY = 0;
  private galleryTouchMoved = false;

  private cachedSafeVideoUrl: SafeResourceUrl | null = null;
  private cachedRawVideoUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private seoService: SeoService,
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
    this.galleryItems = [];
    this.activeMediaIndex = 0;
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
    this.seoService.setProductSeo(this.product);

    let images: ImageItem[] = [];
    let videoUrl = this.product.video_url || null;

    // Load Colors
    this.colorVariants = this.product.color_variants || [];
    if (this.product.has_colors && this.colorVariants.length > 0) {
      this.selectedColor = this.colorVariants[0].name;
      const variantImgs = this.colorVariants[0].images || this.colorVariants[0].image_urls || [];
      if (variantImgs.length > 0) {
        images = variantImgs.map((url: string, i: number) => ({
          image_url: url,
          is_primary: i === 0,
          display_order: i + 1
        }));
      } else {
        images = extractProductImages(this.product);
      }
      if (this.colorVariants[0].video_url) {
        videoUrl = this.colorVariants[0].video_url;
      }
    } else {
      images = extractProductImages(this.product);
    }

    // Build the integrated gallery: Images + Video as natural final slide
    this.buildGalleryMedia(images, videoUrl);

    // Build Sizes (if product has sizes)
    this.updateSizesForSelectedColor(true);

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

  buildGalleryMedia(imagesList: ImageItem[], videoUrl: string | null | undefined) {
    const list: GalleryMediaItem[] = imagesList.map((img, i) => ({
      type: 'image' as const,
      url: img.image_url,
      display_order: i + 1
    }));

    if (list.length === 0) {
      list.push({ type: 'image' as const, url: DEFAULT_FALLBACK_IMAGE, display_order: 1 });
    }

    const cleanVideo = videoUrl?.trim();
    if (cleanVideo) {
      list.push({
        type: 'video' as const,
        url: cleanVideo,
        display_order: list.length + 1
      });
    }

    this.galleryItems = list;
    this.activeMediaIndex = 0;
    this.isMainLoaded = false;
    this.cdr.markForCheck();
  }

  get activeMedia(): GalleryMediaItem | null {
    if (this.galleryItems.length === 0) return null;
    if (this.activeMediaIndex < 0 || this.activeMediaIndex >= this.galleryItems.length) {
      return this.galleryItems[0];
    }
    return this.galleryItems[this.activeMediaIndex];
  }

  get activeImageUrl(): string {
    const current = this.activeMedia;
    if (current && current.type === 'image') return current.url;
    const firstImg = this.galleryItems.find(item => item.type === 'image');
    return firstImg ? firstImg.url : DEFAULT_FALLBACK_IMAGE;
  }

  get primaryThumbUrl(): string {
    const firstImg = this.galleryItems.find(item => item.type === 'image');
    return firstImg ? firstImg.url : DEFAULT_FALLBACK_IMAGE;
  }

  selectMedia(index: number) {
    if (index >= 0 && index < this.galleryItems.length) {
      this.activeMediaIndex = index;
      this.isMainLoaded = false;
      this.cdr.markForCheck();
    }
  }

  prevMedia(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.galleryItems.length <= 1) return;
    this.activeMediaIndex = (this.activeMediaIndex - 1 + this.galleryItems.length) % this.galleryItems.length;
    this.isMainLoaded = false;
    this.cdr.markForCheck();
  }

  nextMedia(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.galleryItems.length <= 1) return;
    this.activeMediaIndex = (this.activeMediaIndex + 1) % this.galleryItems.length;
    this.isMainLoaded = false;
    this.cdr.markForCheck();
  }

  onGalleryTouchStart(e: TouchEvent) {
    if (this.galleryItems.length <= 1) return;
    this.galleryTouchStartX = e.changedTouches[0].clientX;
    this.galleryTouchStartY = e.changedTouches[0].clientY;
    this.galleryTouchMoved = false;
  }

  onGalleryTouchMove(e: TouchEvent) {
    if (this.galleryItems.length <= 1) return;
    const diffX = Math.abs(e.changedTouches[0].clientX - this.galleryTouchStartX);
    const diffY = Math.abs(e.changedTouches[0].clientY - this.galleryTouchStartY);
    if (diffX > 8 && diffX > diffY) {
      this.galleryTouchMoved = true;
    }
  }

  onGalleryTouchEnd(e: TouchEvent) {
    if (this.galleryItems.length <= 1 || !this.galleryTouchMoved) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - this.galleryTouchStartX;
    const diffY = endY - this.galleryTouchStartY;

    if (Math.abs(diffX) > 30 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        this.prevMedia();
      } else {
        this.nextMedia();
      }
    }
  }

  updateSizesForSelectedColor(isInitial = false) {
    if (!this.product || this.product.has_size === false || this.product.department === 'jewellery') {
      this.sizeList = [];
      this.selectedSize = 'One Size';
      return;
    }

    let activeVariant: ColorVariant | undefined;
    if (this.product.has_colors && this.colorVariants.length > 0) {
      activeVariant = this.colorVariants.find(
        cv => (cv.name || '').trim().toLowerCase() === (this.selectedColor || '').trim().toLowerCase()
      );
    }

    if (activeVariant && activeVariant.sizes && activeVariant.sizes.length > 0) {
      this.sizeList = activeVariant.sizes.map(s => ({
        size: (s.size === 'XXL' ? '2XL' : s.size) as SizeOption,
        stock: Number(s.stock) || 0
      }));
    } else if (this.product.sizes && this.product.sizes.length > 0) {
      this.sizeList = this.product.sizes.map(s => ({
        size: (s.size === 'XXL' ? '2XL' : s.size) as SizeOption,
        stock: Number(s.stock) || 0
      }));
    } else {
      const defaultSizes: SizeOption[] = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
      this.sizeList = defaultSizes.map(size => ({ size, stock: this.product!.stock > 0 ? 5 : 0 }));
    }

    if (isInitial) {
      const inStock = this.sizeList.find(s => s.stock > 0);
      if (inStock) {
        this.selectedSize = inStock.size;
      } else if (this.sizeList.length > 0) {
        this.selectedSize = this.sizeList[0].size;
      } else {
        this.selectedSize = '';
      }
    } else {
      const matchingSize = this.sizeList.find(s => s.size === this.selectedSize);
      if (!matchingSize) {
        this.selectedSize = '';
      }
    }
  }

  selectColorVariant(variant: ColorVariant) {
    this.selectedColor = variant.name;
    const variantImgs = variant.images || variant.image_urls || [];
    let imgs: ImageItem[] = [];
    if (variantImgs.length > 0) {
      imgs = variantImgs.map((url: string, i: number) => ({
        image_url: url,
        is_primary: i === 0,
        display_order: i + 1
      }));
    } else {
      imgs = extractProductImages(this.product!);
    }

    const video = variant.video_url || this.product?.video_url;
    this.buildGalleryMedia(imgs, video);

    this.updateSizesForSelectedColor(false);
    this.cdr.markForCheck();
  }

  isEmbedVideo(url: string): boolean {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  }

  getSafeVideoUrl(url: string): SafeResourceUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('');
    if (this.cachedRawVideoUrl === url && this.cachedSafeVideoUrl) {
      return this.cachedSafeVideoUrl;
    }

    let embedUrl = url;
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      const videoId = ytMatch[1];
      embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`;
    } else {
      const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (vimeoMatch && vimeoMatch[1]) {
        embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&loop=1`;
      }
    }

    this.cachedRawVideoUrl = url;
    this.cachedSafeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    return this.cachedSafeVideoUrl;
  }

  get isSoldOut(): boolean {
    if (!this.product) return false;
    return this.product.availability === 'sold_out' || Boolean(this.product.is_sold_out) || this.product.stock === 0;
  }

  get isOnSale(): boolean {
    return Boolean(
      this.product?.sale_price && 
      this.product.price && 
      Number(this.product.sale_price) < Number(this.product.price) && 
      Number(this.product.price) > 0
    );
  }

  get productStatuses(): { text: string; isRed?: boolean }[] {
    if (!this.product) return [];
    const list: { text: string; isRed?: boolean }[] = [];

    // 1. New status
    if (this.product.new_arrival) {
      list.push({ text: 'New Arrival' });
    } else if ((this.product as any).is_new) {
      list.push({ text: 'New Product' });
    }

    // 2. Best Seller
    if (this.product.best_seller) {
      list.push({ text: 'Best Seller' });
    }

    // 3. Stock / Availability status
    if (this.product.stock_display !== 'hide' && !this.isSoldOut) {
      if (this.product.stock_display === 'custom' && this.product.custom_stock_message?.trim()) {
        const msg = this.product.custom_stock_message.trim();
        const isFew = /few left|low stock/i.test(msg);
        list.push({ text: msg, isRed: isFew });
      } else if (this.product.availability === 'few_left' || this.product.stock_display === 'few_left') {
        list.push({ text: 'Only Few Left', isRed: true });
      } else if ((this.product.availability as string) === 'limited' || (this.product as any).is_limited) {
        list.push({ text: 'Limited Stock' });
      } else if (this.isLowStock && this.product.stock > 0) {
        list.push({ text: 'Only Few Left', isRed: true });
      }
    }

    return list;
  }

  get addToCartButtonText(): string {
    if (!this.product) return 'Add to Cart';
    if (this.isSoldOut) {
      return 'Sold Out';
    }
    if (this.product.department !== 'jewellery' && this.product.has_size !== false && !this.selectedSize) {
      return 'Select a Size';
    }
    if (!this.isAvailable) {
      return 'Out of Stock';
    }
    return 'Add to Cart';
  }

  get isAvailable(): boolean {
    if (!this.product) return false;
    if (this.isSoldOut) return false;
    if (this.product.department !== 'jewellery' && this.product.has_size !== false) {
      if (!this.selectedSize) return false;
      return !!(this.selectedSizeConfig && this.selectedSizeConfig.stock > 0);
    }
    if (this.product.has_colors && this.colorVariants.length > 0) {
      const activeVariant = this.colorVariants.find(
        cv => (cv.name || '').trim().toLowerCase() === (this.selectedColor || '').trim().toLowerCase()
      );
      if (activeVariant && activeVariant.stock !== undefined) {
        return activeVariant.stock > 0;
      }
    }
    return this.product.stock > 0 && this.product.availability !== 'sold_out';
  }

  get isLowStock(): boolean {
    if (!this.product) return false;
    if (this.product.stock_display === 'few_left') return true;
    if (this.product.stock_display === 'hide') return false;

    if (this.product.department !== 'jewellery' && this.product.has_size !== false) {
      return !!(this.selectedSizeConfig && this.selectedSizeConfig.stock > 0 && this.selectedSizeConfig.stock <= 5);
    }
    if (this.product.has_colors && this.colorVariants.length > 0) {
      const activeVariant = this.colorVariants.find(
        cv => (cv.name || '').trim().toLowerCase() === (this.selectedColor || '').trim().toLowerCase()
      );
      if (activeVariant && activeVariant.stock !== undefined) {
        return activeVariant.stock > 0 && activeVariant.stock <= 5;
      }
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
    if (this.product?.department !== 'jewellery' && this.product?.has_size !== false) {
      return this.selectedSizeConfig ? this.selectedSizeConfig.stock : 1;
    }
    if (this.product?.has_colors && this.colorVariants.length > 0) {
      const activeVariant = this.colorVariants.find(
        cv => (cv.name || '').trim().toLowerCase() === (this.selectedColor || '').trim().toLowerCase()
      );
      if (activeVariant && activeVariant.stock !== undefined) {
        return Math.max(1, activeVariant.stock);
      }
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
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.petalsethnic.com';
    const isJewel = this.product.department === 'jewellery';
    const colorText = this.selectedColor ? ` | Color: ${this.selectedColor}` : '';
    const sizeText = (!isJewel && this.product.has_size !== false && this.selectedSize) ? ` | Size: ${this.selectedSize}` : '';
    const text = encodeURIComponent(
      `Hello Petals Ethnics and Jewellers! I am interested in enquiry for:\n*${this.product.name}* (Price: ₹${this.product.sale_price || this.product.price}${colorText}${sizeText})\nProduct Link: ${origin}/product/${this.product.slug}`
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
      const isJewel = this.product.department === 'jewellery';
      const sizeToPass = (!isJewel && this.product.has_size !== false) ? (this.selectedSize as SizeOption) : undefined;
      this.cartService.addToCart(this.product, sizeToPass, this.quantity, this.selectedColor || undefined, this.activeImageUrl);
      alert(`Added ${this.quantity} item(s) of ${this.product.name} to cart!`);
    } catch (e: any) {
      alert(e.message || 'Error adding to cart');
    }
  }

  buyNow() {
    if (!this.product || !this.isAvailable) return;
    const isJewel = this.product.department === 'jewellery';
    const sizeToPass = (!isJewel && this.product.has_size !== false) ? (this.selectedSize as SizeOption) : undefined;
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
