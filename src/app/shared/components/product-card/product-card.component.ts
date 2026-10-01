import { Component, Input, Output, EventEmitter, OnInit, OnChanges, AfterViewInit, SimpleChanges, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product, SizeOption } from '../../../core/models/product.model';
import { extractProductImages, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../../core/utils/image.utils';
import { ImageLoaderService } from '../../../core/services/image-loader.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="product-card" [class.out-of-stock]="product.stock === 0" (mouseenter)="onCardHover()">
      <!-- Product Image Container with 3:4 Aspect Ratio -->
      <div class="card-media">
        <a [routerLink]="['/product', product.slug]">
          <!-- Shimmer Skeleton Placeholder for THIS product card -->
          <div class="image-skeleton" *ngIf="!isFullLoaded"></div>

          <!-- Real Product Image (fades in smoothly when loaded) -->
          <img 
            #fullImg
            [src]="primaryImageUrl" 
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

          <!-- Secondary Hover Image (loaded ONLY on desktop mouse hover to save 50% bandwidth) -->
          <img 
            *ngIf="showHoverImage && secondaryImageUrl" 
            [src]="secondaryImageUrl" 
            [alt]="product.name + ' - Alternate View | Petals Ethnics and Jewellers'" 
            class="product-img hover-img" 
            loading="lazy"
            decoding="async"
            width="320"
            height="426"
            (error)="onImageError($event)"
          />
        </a>

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
              <button class="quick-single-add-btn" (click)="onQuickAdd()">
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

        <!-- Price Display -->
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
      border-color: var(--color-pink);
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

    /* Direct Product Image: Fades in smoothly as soon as THIS SPECIFIC IMAGE completes loading */
    .full-res-img {
      z-index: 2;
      opacity: 0;
      transition: opacity 300ms ease-in-out, transform 0.3s ease;
    }
    .full-res-img.loaded {
      opacity: 1;
    }

    /* Secondary Hover Image */
    .hover-img {
      opacity: 0;
      z-index: 3;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .product-card:hover .full-res-img.loaded {
      transform: scale(1.05);
    }
    .product-card:hover .hover-img {
      opacity: 1;
      transform: scale(1.05);
    }

    .card-badges {
      position: absolute;
      top: 12px;
      left: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      z-index: 4;
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
      z-index: 5;
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
      border-color: var(--color-pink-dark);
      background: var(--color-pink-light);
      color: var(--color-pink-dark);
    }
    .size-chip.disabled {
      opacity: 0.4;
      cursor: not-allowed;
      text-decoration: line-through;
    }
    .quick-single-add-btn {
      width: 100%;
      background: var(--color-pink-dark);
      color: #FFFFFF;
      border: none;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 600;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: var(--transition);
    }
    .quick-single-add-btn:hover {
      background: var(--color-pink);
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
      background: #D81B60;
      color: #FFFFFF;
      box-shadow: 0 2px 6px rgba(216, 27, 96, 0.35);
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
      color: var(--color-pink-dark);
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
      color: #D81B60;
    }
    .original-price {
      font-size: 13px;
      color: var(--color-muted);
      text-decoration: line-through;
      font-weight: 400;
    }
    .sale-discount {
      font-size: 12px;
      color: #2E7D32;
      font-weight: 600;
    }
    .regular-price {
      color: var(--color-text-heading);
    }

    @media (max-width: 768px) {
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

  constructor(
    private imageLoader: ImageLoaderService,
    private cdr: ChangeDetectorRef
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
