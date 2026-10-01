import { Component, Input, Output, EventEmitter, OnInit, OnChanges, AfterViewInit, SimpleChanges, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Product, SizeOption } from '../../../core/models/product.model';
import { extractProductImages, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../../core/utils/image.utils';
import { ImageLoaderService } from '../../../core/services/image-loader.service';

export interface CardMediaItem {
  type: 'image' | 'video';
  url: string;
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="product-card" [class.out-of-stock]="product.stock === 0" (mouseenter)="onCardHover()">
      <!-- Product Media Container with 3:4 Aspect Ratio -->
      <div 
        class="card-media"
        (touchstart)="onTouchStart($event)"
        (touchmove)="onTouchMove($event)"
        (touchend)="onTouchEnd($event)"
      >
        <a [routerLink]="['/product', product.slug]" (click)="onCardClick($event)" class="media-link" tabindex="-1">
          <!-- Shimmer Skeleton Placeholder for THIS product card -->
          <div class="image-skeleton" *ngIf="!isFullLoaded"></div>

          <!-- Slider Track for Smooth Transitions -->
          <div 
            class="slider-track" 
            [style.transform]="'translateX(-' + (currentSlideIndex * 100) + '%)'"
          >
            <div 
              *ngFor="let item of mediaItems; let i = index" 
              class="slide-item" 
              [class.image-slide]="item.type === 'image'"
              [class.video-slide]="item.type === 'video'"
            >
              <!-- 1. IMAGE SLIDE -->
              <ng-container *ngIf="item.type === 'image'">
                <img 
                  *ngIf="i === 0"
                  #fullImg
                  [src]="item.url" 
                  [alt]="product.name + ' - ' + (product.category?.name || 'Ethnic Wear') + ' | Petals Ethnics and Jewellers'" 
                  class="product-img full-res-img"
                  [class.loaded]="isFullLoaded"
                  [attr.loading]="priority ? 'eager' : 'lazy'"
                  [attr.fetchpriority]="priority ? 'high' : 'auto'"
                  decoding="async"
                  width="320"
                  height="426"
                  (load)="onFullResLoaded()"
                  (error)="onFullResError($event)"
                />
                <img 
                  *ngIf="i > 0"
                  [src]="item.url" 
                  [alt]="product.name + ' - View ' + (i + 1) + ' | Petals Ethnics and Jewellers'" 
                  class="product-img slide-img"
                  loading="lazy"
                  decoding="async"
                  width="320"
                  height="426"
                  (error)="onImageError($event)"
                />
              </ng-container>

              <!-- 2. PRODUCT VIDEO SLIDE (Appears after all product images) -->
              <ng-container *ngIf="item.type === 'video'">
                <!-- Play video ONLY when this slide is active (lazy loaded, zero audio interference) -->
                <ng-container *ngIf="currentSlideIndex === i">
                  <ng-container *ngIf="isEmbedVideo(item.url); else directVideo">
                    <iframe 
                      [src]="getSafeVideoUrl(item.url)" 
                      class="product-video-frame"
                      frameborder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowfullscreen
                      loading="lazy"
                    ></iframe>
                  </ng-container>
                  <ng-template #directVideo>
                    <video 
                      [src]="item.url" 
                      autoplay 
                      muted 
                      loop 
                      playsinline 
                      preload="metadata" 
                      class="product-video-element"
                    ></video>
                  </ng-template>
                </ng-container>

                <!-- When NOT active, display placeholder poster with video play badge -->
                <div class="video-poster" *ngIf="currentSlideIndex !== i">
                  <img 
                    [src]="primaryImageUrl" 
                    [alt]="product.name"
                    class="product-img slide-img" 
                    loading="lazy" 
                    width="320"
                    height="426"
                  />
                  <div class="video-play-badge">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#FFFFFF">
                      <polygon points="6,4 20,12 6,20"></polygon>
                    </svg>
                  </div>
                </div>
              </ng-container>
            </div>
          </div>
        </a>

        <!-- Slider Navigation Controls (Desktop hover arrows) -->
        <button 
          *ngIf="mediaItems.length > 1" 
          type="button"
          class="slider-btn prev-btn" 
          (click)="prevSlide($event)" 
          aria-label="Previous slide"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <button 
          *ngIf="mediaItems.length > 1" 
          type="button"
          class="slider-btn next-btn" 
          (click)="nextSlide($event)" 
          aria-label="Next slide"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        <!-- Slider Indicator Dots -->
        <div class="slider-dots" *ngIf="mediaItems.length > 1">
          <button 
            *ngFor="let item of mediaItems; let i = index" 
            type="button"
            class="slider-dot"
            [class.active]="currentSlideIndex === i"
            [class.video-dot]="item.type === 'video'"
            (click)="goToSlide($event, i)"
            [attr.aria-label]="'Slide ' + (i + 1)"
          >
            <span *ngIf="item.type === 'video'" class="dot-play-icon">▶</span>
          </button>
        </div>

        <!-- Top Badge: Priority: SOLD OUT > Discount > None -->
        <div class="card-badges" *ngIf="topBadge">
          <span 
            class="badge" 
            [class.badge-sold-out]="topBadge.type === 'sold_out'"
            [class.badge-discount]="topBadge.type === 'discount'"
          >
            {{ topBadge.text }}
          </span>
        </div>

        <!-- Quick Add / Enquiry Bar (appears on hover) -->
        <div class="size-quick-bar" *ngIf="!isSoldOut && product.stock > 0">
          <ng-container *ngIf="product.purchase_mode === 'enquiry'; else normalQuickBar">
            <a [href]="whatsAppEnquiryUrl" target="_blank" rel="noopener" class="quick-enquiry-btn">
              Enquire on WhatsApp
            </a>
          </ng-container>
          <ng-template #normalQuickBar>
            <ng-container *ngIf="product.has_size !== false && availableSizes.length > 0; else singleQuickAdd">
              <span class="quick-title">Quick Add:</span>
              <div class="size-chips">
                <button 
                  *ngFor="let sizeOpt of availableSizes" 
                  type="button"
                  class="size-chip"
                  [class.disabled]="sizeOpt.stock === 0"
                  [disabled]="sizeOpt.stock === 0"
                  (click)="onQuickAdd(sizeOpt.size)"
                  [title]="sizeOpt.stock > 0 ? 'Add Size ' + sizeOpt.size : 'Size ' + sizeOpt.size + ' Out of Stock'"
                >
                  {{ sizeOpt.size }}
                </button>
              </div>
            </ng-container>
            <ng-template #singleQuickAdd>
              <button type="button" class="quick-single-add-btn" (click)="onQuickAdd()">
                + Quick Add to Cart
              </button>
            </ng-template>
          </ng-template>
        </div>
      </div>

      <!-- Product Details -->
      <div class="card-content">
        <span class="product-cat" *ngIf="product.category?.name">{{ product.category?.name }}</span>
        <h3 class="product-title">
          <a [routerLink]="['/product', product.slug]">{{ product.name }}</a>
        </h3>

        <!-- Status Information Directly Under Product Name -->
        <div class="product-status-line" *ngIf="productStatuses.length > 0">
          <ng-container *ngFor="let st of productStatuses; let last = last">
            <span [class.status-red]="st.isRed">{{ st.text }}</span>
            <span class="status-sep" *ngIf="!last"> • </span>
          </ng-container>
        </div>

        <!-- Price Display (DARK PINK #9F3D62) -->
        <div class="product-price">
          <ng-container *ngIf="isOnSale; else regularPrice">
            <span class="sale-price">₹{{ product.sale_price | number:'1.0-0' }}</span>
            <span class="original-price">₹{{ product.price | number:'1.0-0' }}</span>
          </ng-container>
          <ng-template #regularPrice>
            <span class="regular-price">₹{{ product.price | number:'1.0-0' }}</span>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      position: relative;
      background: #FFFFFF;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--color-border-light);
      transition: var(--transition);
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .product-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-4px);
      border-color: #E5A9BD;
    }
    .product-card.out-of-stock {
      opacity: 0.75;
    }

    .card-media {
      position: relative;
      width: 100%;
      aspect-ratio: 3 / 4;
      overflow: hidden;
      background-color: var(--color-bg-alt, #FAF8F6);
      user-select: none;
      -webkit-user-select: none;
      touch-action: pan-y pinch-zoom;
    }

    .media-link {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
      text-decoration: none;
    }

    /* Slider track */
    .slider-track {
      display: flex;
      width: 100%;
      height: 100%;
      transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1);
      will-change: transform;
    }

    .slide-item {
      position: relative;
      flex: 0 0 100%;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000000;
    }

    .slide-item.image-slide {
      background-color: var(--color-bg-alt, #FAF8F6);
    }

    /* Per-Product Image Skeleton Loader */
    .image-skeleton {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg, 
        #FAF8F6 0%, 
        #F0ECE8 50%, 
        #FAF8F6 100%
      );
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.5s infinite ease-in-out;
      z-index: 1;
    }
    @keyframes skeleton-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .product-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }

    /* Direct Product Image: Fades in smoothly as soon as primary image completes loading */
    .full-res-img {
      z-index: 2;
      opacity: 0;
      transition: opacity 300ms ease-in-out, transform 0.35s ease;
    }
    .full-res-img.loaded {
      opacity: 1;
    }

    .slide-img {
      opacity: 1;
      transition: transform 0.35s ease;
    }

    .product-card:hover .image-slide .product-img {
      transform: scale(1.04);
    }

    /* Video Player Elements */
    .product-video-frame {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
      pointer-events: none;
    }

    .product-video-element {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .video-poster {
      position: relative;
      width: 100%;
      height: 100%;
      background: #000000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .video-play-badge {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.25);
      pointer-events: none;
      z-index: 3;
    }
    .video-play-badge svg {
      margin-left: 2px;
    }

    /* Slider Navigation Arrows */
    .slider-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 6;
      opacity: 0;
      transition: opacity 0.2s ease, transform 0.2s ease, background 0.2s ease;
    }
    .slider-btn:hover {
      background: #FFFFFF;
      transform: translateY(-50%) scale(1.08);
    }
    .slider-btn.prev-btn {
      left: 8px;
    }
    .slider-btn.next-btn {
      right: 8px;
    }
    .product-card:hover .slider-btn {
      opacity: 1;
    }

    /* Slider Dots */
    .slider-dots {
      position: absolute;
      bottom: 8px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 5px;
      z-index: 6;
      pointer-events: auto;
    }
    .slider-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.65);
      border: 1px solid rgba(0, 0, 0, 0.15);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      padding: 0;
      margin: 0;
      cursor: pointer;
      transition: all 0.25s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .slider-dot.active {
      background: #FFFFFF;
      width: 14px;
      border-radius: 3px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
    }
    .slider-dot.video-dot {
      background: rgba(255, 255, 255, 0.85);
      font-size: 7px;
      color: #1A1A1A;
    }
    .slider-dot.video-dot.active {
      background: #FFFFFF;
      width: 16px;
      border-radius: 3px;
      color: #9F3D62;
    }
    .dot-play-icon {
      font-size: 7px;
      line-height: 1;
      display: block;
      margin-left: 1px;
    }

    .card-badges {
      position: absolute;
      top: 12px;
      left: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      z-index: 4;
      pointer-events: none;
    }

    .size-quick-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(4px);
      padding: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      transform: translateY(100%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 7;
    }
    .product-card:hover .size-quick-bar {
      transform: translateY(0);
    }
    .quick-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--color-muted);
    }
    .size-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: center;
    }
    .size-chip {
      font-size: 12px;
      font-weight: 600;
      padding: 4px 8px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: #FFFFFF;
      color: var(--color-text);
      cursor: pointer;
      transition: var(--transition);
    }
    .size-chip:hover:not(.disabled) {
      border-color: #1A1A1A;
      background: #1A1A1A;
      color: #FFFFFF;
    }
    .size-chip.disabled {
      opacity: 0.4;
      cursor: not-allowed;
      text-decoration: line-through;
    }

    /* DARK QUICK ADD BUTTON */
    .quick-single-add-btn {
      width: 100%;
      background: #1A1A1A;
      color: #FFFFFF;
      border: 1px solid #1A1A1A;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 600;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: var(--transition);
    }
    .quick-single-add-btn:hover {
      background: #2D2D2D;
      border-color: #2D2D2D;
      transform: translateY(-1px);
    }
    .quick-enquiry-btn {
      width: 100%;
      background: #25D366;
      color: #FFFFFF;
      text-decoration: none;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 600;
      border-radius: var(--radius-sm);
      text-align: center;
      transition: var(--transition);
      display: block;
    }
    .quick-enquiry-btn:hover {
      background: #1EBE5B;
    }

    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }
    .badge-discount {
      background: #9F3D62;
      color: #FFFFFF;
      box-shadow: 0 2px 6px rgba(159, 61, 98, 0.35);
    }
    .badge-sold-out {
      background: #111827;
      color: #FFFFFF;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
      letter-spacing: 1px;
    }

    .card-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    .product-cat {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--color-gold);
      margin-bottom: 4px;
      font-weight: 600;
    }
    .product-title {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 6px;
      color: var(--color-text-heading);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      min-height: 42px;
    }
    .product-title a:hover {
      color: #9F3D62;
    }
    .product-status-line {
      font-size: 11.5px;
      font-weight: 600;
      color: #B45309;
      letter-spacing: 0.3px;
      margin-bottom: 6px;
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .status-red {
      color: #DC2626 !important;
      font-weight: 700;
    }
    .status-sep {
      color: #D1D5DB;
      margin: 0 4px;
    }

    /* Price Display: Customer facing prices in DARK PINK (#9F3D62) */
    .product-price {
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: auto;
      font-size: 16px;
      font-weight: 700;
    }
    .sale-price {
      color: #9F3D62;
    }
    .original-price {
      font-size: 13px;
      color: var(--color-muted);
      text-decoration: line-through;
      font-weight: 400;
    }
    .regular-price {
      color: #9F3D62;
    }

    @media (max-width: 768px) {
      .slider-btn {
        opacity: 0.85;
        width: 26px;
        height: 26px;
      }
      .card-content {
        padding: 12px;
      }
      .product-cat {
        font-size: 10px;
        margin-bottom: 2px;
      }
      .product-title {
        font-size: 13px;
        line-height: 1.3;
        margin-bottom: 4px;
      }
      .product-status-line {
        font-size: 10.5px;
        margin-bottom: 4px;
      }
      .product-price {
        font-size: 14px;
        gap: 6px;
      }
      .original-price {
        font-size: 11px;
      }
      .card-badges {
        top: 8px;
        left: 8px;
        gap: 4px;
      }
      .card-badges .badge {
        font-size: 9px;
        padding: 2px 6px;
      }
      .size-quick-bar {
        display: none;
      }
    }
  `]
})
export class ProductCardComponent implements OnInit, OnChanges, AfterViewInit {
  @Input({ required: true }) product!: Product;
  @Input() priority: boolean = false;
  @Output() quickAdd = new EventEmitter<{ product: Product; size?: SizeOption }>();

  @ViewChild('fullImg') fullImgRef?: ElementRef<HTMLImageElement>;

  isFullLoaded = false;
  showHoverImage = false;

  primaryImageUrl: string = DEFAULT_FALLBACK_IMAGE;
  secondaryImageUrl: string | null = null;

  mediaItems: CardMediaItem[] = [];
  currentSlideIndex = 0;

  private touchStartX = 0;
  private touchStartY = 0;
  private touchMoved = false;
  private isSwiping = false;

  private cachedSafeVideoUrl: SafeResourceUrl | null = null;
  private cachedRawVideoUrl: string | null = null;

  constructor(
    private imageLoader: ImageLoaderService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.updateImages();
  }

  ngAfterViewInit() {
    this.checkNativeImageStatus();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['product']) {
      this.updateImages();
      setTimeout(() => this.checkNativeImageStatus(), 0);
    }
  }

  onCardHover() {
    // If not hovered yet and has secondary image
    if (!this.showHoverImage && this.secondaryImageUrl) {
      this.showHoverImage = true;
      this.cdr.markForCheck();
    }
  }

  private updateImages() {
    const images = extractProductImages(this.product);
    const primary = images.length > 0 ? images[0].image_url : DEFAULT_FALLBACK_IMAGE;
    const secondary = images.length > 1 ? images[1].image_url : null;

    this.primaryImageUrl = primary;
    this.secondaryImageUrl = secondary;

    const media: CardMediaItem[] = images.map(img => ({ type: 'image' as const, url: img.image_url }));
    if (media.length === 0) {
      media.push({ type: 'image' as const, url: DEFAULT_FALLBACK_IMAGE });
    }

    // Append video as the final slide item if present
    const rawVideoUrl = this.product.video_url?.trim();
    if (rawVideoUrl) {
      media.push({ type: 'video' as const, url: rawVideoUrl });
    }

    this.mediaItems = media;
    if (this.currentSlideIndex >= this.mediaItems.length) {
      this.currentSlideIndex = 0;
    }

    if (this.imageLoader.isLoaded(primary)) {
      this.isFullLoaded = true;
    } else {
      this.isFullLoaded = false;
    }
    this.cdr.markForCheck();
  }

  private checkNativeImageStatus() {
    if (this.fullImgRef?.nativeElement) {
      const img = this.fullImgRef.nativeElement;
      if (img.complete && img.naturalWidth > 0) {
        this.onFullResLoaded();
      }
    }
  }

  prevSlide(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.mediaItems.length <= 1) return;
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.mediaItems.length) % this.mediaItems.length;
    this.cdr.markForCheck();
  }

  nextSlide(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.mediaItems.length <= 1) return;
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.mediaItems.length;
    this.cdr.markForCheck();
  }

  goToSlide(event: Event, index: number) {
    event.preventDefault();
    event.stopPropagation();
    if (index >= 0 && index < this.mediaItems.length) {
      this.currentSlideIndex = index;
      this.cdr.markForCheck();
    }
  }

  onTouchStart(e: TouchEvent) {
    if (this.mediaItems.length <= 1) return;
    this.touchStartX = e.changedTouches[0].clientX;
    this.touchStartY = e.changedTouches[0].clientY;
    this.touchMoved = false;
  }

  onTouchMove(e: TouchEvent) {
    if (this.mediaItems.length <= 1) return;
    const diffX = Math.abs(e.changedTouches[0].clientX - this.touchStartX);
    const diffY = Math.abs(e.changedTouches[0].clientY - this.touchStartY);
    if (diffX > 8 && diffX > diffY) {
      this.touchMoved = true;
    }
  }

  onTouchEnd(e: TouchEvent) {
    if (this.mediaItems.length <= 1 || !this.touchMoved) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - this.touchStartX;
    const diffY = endY - this.touchStartY;

    if (Math.abs(diffX) > 30 && Math.abs(diffX) > Math.abs(diffY)) {
      this.isSwiping = true;
      if (diffX > 0) {
        this.prevSlide();
      } else {
        this.nextSlide();
      }
      setTimeout(() => {
        this.isSwiping = false;
      }, 300);
    }
  }

  onCardClick(event: MouseEvent) {
    if (this.isSwiping) {
      event.preventDefault();
      event.stopPropagation();
    }
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
      embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`;
    } else {
      const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (vimeoMatch && vimeoMatch[1]) {
        embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&loop=1&background=1`;
      }
    }

    this.cachedRawVideoUrl = url;
    this.cachedSafeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    return this.cachedSafeVideoUrl;
  }

  get isSoldOut(): boolean {
    return this.product.availability === 'sold_out' || Boolean(this.product.is_sold_out) || this.product.stock === 0;
  }

  get isOnSale(): boolean {
    return Boolean(
      this.product.sale_price && 
      Number(this.product.sale_price) < Number(this.product.price) && 
      Number(this.product.price) > 0
    );
  }

  get discountPercentage(): number {
    if (this.product.sale_price && Number(this.product.price) > 0 && Number(this.product.sale_price) < Number(this.product.price)) {
      return Math.round(((Number(this.product.price) - Number(this.product.sale_price)) / Number(this.product.price)) * 100);
    }
    return 0;
  }

  get topBadge(): { type: 'sold_out' | 'discount'; text: string } | null {
    if (this.isSoldOut) {
      return { type: 'sold_out', text: 'SOLD OUT' };
    }
    if (this.isOnSale && this.discountPercentage > 0) {
      return { type: 'discount', text: `${this.discountPercentage}% OFF` };
    }
    return null;
  }

  get productStatuses(): { text: string; isRed?: boolean }[] {
    const list: { text: string; isRed?: boolean }[] = [];

    // 1. New status
    if (this.product.new_arrival) {
      list.push({ text: 'New Arrival' });
    } else if ((this.product as any).is_new) {
      list.push({ text: 'New Product' });
    }

    // 2. Best Seller status
    if (this.product.best_seller) {
      list.push({ text: 'Best Seller' });
    }

    // 3. Stock / Availability status (Only shown if NOT already sold out, since SOLD OUT is on top)
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

  get isLowStock(): boolean {
    if (this.product.stock_display === 'few_left') return true;
    if (this.product.stock_display === 'hide') return false;
    return (this.product.stock > 0 && this.product.stock <= 5) || this.product.availability === 'few_left';
  }

  get lowStockBadgeText(): string {
    return this.product.custom_stock_message || 'Only Few Left';
  }

  get whatsAppEnquiryUrl(): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.petalsethnic.com';
    const text = encodeURIComponent(
      `Hello Petals Ethnics and Jewellers! I would like to enquire about: *${this.product.name}* (Price: ₹${this.product.sale_price || this.product.price}).\nProduct Link: ${origin}/product/${this.product.slug}`
    );
    return `https://wa.me/918113899319?text=${text}`;
  }

  get availableSizes(): { size: SizeOption; stock: number }[] {
    const allSizes: SizeOption[] = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
    if (this.product.sizes && this.product.sizes.length > 0) {
      return this.product.sizes.map(s => ({ size: s.size === 'XXL' ? '2XL' : s.size, stock: s.stock }));
    }
    if (this.product.color_variants && this.product.color_variants.length > 0) {
      const sizeMap = new Map<string, number>();
      for (const cv of this.product.color_variants) {
        if (cv.sizes && cv.sizes.length > 0) {
          for (const s of cv.sizes) {
            const szName = s.size === 'XXL' ? '2XL' : s.size;
            sizeMap.set(szName, (sizeMap.get(szName) || 0) + s.stock);
          }
        }
      }
      if (sizeMap.size > 0) {
        return allSizes
          .filter(sz => sizeMap.has(sz))
          .map(sz => ({ size: sz, stock: sizeMap.get(sz) || 0 }));
      }
    }
    return allSizes.map(size => ({ size, stock: this.product.stock > 0 ? 5 : 0 }));
  }

  onFullResLoaded() {
    this.isFullLoaded = true;
    this.imageLoader.markLoaded(this.primaryImageUrl);
    this.cdr.markForCheck();
  }

  onFullResError(event: Event) {
    handleImageError(event);
    this.isFullLoaded = true;
    this.imageLoader.markLoaded(this.primaryImageUrl);
    this.cdr.markForCheck();
  }

  onImageError(event: Event) {
    handleImageError(event);
  }

  onQuickAdd(size?: SizeOption) {
    if (this.isSoldOut) return;
    this.quickAdd.emit({ product: this.product, size });
  }
}
