import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product, SizeOption } from '../../../core/models/product.model';
import { extractProductImages, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../../core/utils/image.utils';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="product-card" [class.out-of-stock]="product.stock === 0">
      <!-- Product Image Container -->
      <div class="card-media" [class.loaded]="isMainLoaded">
        <!-- Skeleton Placeholder Shimmer -->
        <div class="img-skeleton" *ngIf="!isMainLoaded"></div>

        <a [routerLink]="['/product', product.slug]">
          <img 
            [src]="primaryImageUrl" 
            [alt]="product.name" 
            class="product-img main-img"
            [class.visible]="isMainLoaded"
            loading="lazy"
            (load)="isMainLoaded = true"
            (error)="onImageError($event); isMainLoaded = true"
          />
          <img 
            *ngIf="secondaryImageUrl" 
            [src]="secondaryImageUrl" 
            [alt]="product.name" 
            class="product-img hover-img" 
            loading="lazy"
            (error)="onImageError($event)"
          />
        </a>

        <!-- Badges -->
        <div class="card-badges">
          <span *ngIf="product.sale_price && product.sale_price < product.price" class="badge badge-pink">
            SAVE {{ discountPercentage }}%
          </span>
          <span *ngIf="product.new_arrival" class="badge badge-gold">NEW</span>
          <span *ngIf="product.stock === 0" class="badge badge-dark">SOLD OUT</span>
        </div>

        <!-- Quick Add Size Bar (appears on hover) -->
        <div class="size-quick-bar" *ngIf="product.stock > 0">
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
        </div>
      </div>

      <!-- Product Details -->
      <div class="card-content">
        <span class="product-cat" *ngIf="product.category?.name">{{ product.category?.name }}</span>
        <h3 class="product-title">
          <a [routerLink]="['/product', product.slug]">{{ product.name }}</a>
        </h3>

        <!-- Price Display -->
        <div class="product-price">
          <ng-container *ngIf="product.sale_price && product.sale_price < product.price; else regularPrice">
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
      padding-top: 133%; /* 3:4 aspect ratio reserved space */
      overflow: hidden;
      background-color: var(--color-bg-alt, #F8F9FA);
    }

    /* Lightweight Skeleton Shimmer */
    .img-skeleton {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, #F0E6EC 25%, #FBF6F8 50%, #F0E6EC 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      z-index: 1;
    }
    @keyframes shimmer {
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
      opacity: 0;
      transition: opacity 0.4s ease, transform 0.4s ease;
      z-index: 2;
    }
    .product-img.visible {
      opacity: 1;
    }
    .hover-img {
      opacity: 0;
      z-index: 3;
    }
    .product-card:hover .main-img.visible {
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
      color: var(--color-text-heading);
      transition: var(--transition);
    }
    .size-chip:hover:not(.disabled) {
      background-color: var(--color-pink-dark);
      border-color: var(--color-pink-dark);
      color: #FFFFFF;
    }
    .size-chip.disabled {
      opacity: 0.3;
      cursor: not-allowed;
      text-decoration: line-through;
    }

    .card-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    .product-cat {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--color-gold);
      margin-bottom: 4px;
    }
    .product-title {
      font-family: var(--font-body);
      font-size: 15px;
      font-weight: 500;
      line-height: 1.4;
      margin-bottom: 8px;
      color: var(--color-text-heading);
    }
    .product-title a:hover {
      color: #C05676;
    }
    .product-price {
      margin-top: auto;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
    }
    .sale-price {
      color: #C05676;
    }
    .original-price {
      font-size: 13px;
      color: var(--color-light-muted);
      text-decoration: line-through;
      font-weight: 400;
    }
    .regular-price {
      color: var(--color-text-heading);
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() quickAdd = new EventEmitter<{ product: Product; size: SizeOption }>();

  isMainLoaded = false;

  get allImages() {
    return extractProductImages(this.product);
  }

  get primaryImageUrl(): string {
    const images = this.allImages;
    return images.length > 0 ? images[0].image_url : DEFAULT_FALLBACK_IMAGE;
  }

  get secondaryImageUrl(): string | null {
    const images = this.allImages;
    return images.length > 1 ? images[1].image_url : null;
  }

  get discountPercentage(): number {
    if (this.product.sale_price && this.product.price > 0) {
      return Math.round(((this.product.price - this.product.sale_price) / this.product.price) * 100);
    }
    return 0;
  }

  get availableSizes(): { size: SizeOption; stock: number }[] {
    const allSizes: SizeOption[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    if (this.product.sizes && this.product.sizes.length > 0) {
      return this.product.sizes.map(s => ({ size: s.size, stock: s.stock }));
    }
    return allSizes.map(size => ({ size, stock: this.product.stock > 0 ? 5 : 0 }));
  }

  onImageError(event: Event) {
    handleImageError(event);
  }

  onQuickAdd(size: SizeOption) {
    this.quickAdd.emit({ product: this.product, size });
  }
}
