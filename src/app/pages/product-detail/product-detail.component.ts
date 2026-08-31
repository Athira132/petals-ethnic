import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product, ProductImage, SizeOption } from '../../core/models/product.model';
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
          <a routerLink="/shop">Shop</a> &gt;
          <a *ngIf="product.category" [routerLink]="['/shop']" [queryParams]="{category: product.category.slug}">
            {{ product.category.name }}
          </a> &gt;
          <span>{{ product.name }}</span>
        </nav>

        <div class="pd-grid">
          <!-- Image Gallery Column -->
          <div class="pd-gallery">
            <div class="main-image-box">
              <!-- Layer 1: Low-Resolution Version of EXACT SAME Product Photo (loaded immediately) -->
              <img 
                [src]="lowResActiveUrl" 
                [alt]="product.name" 
                class="pd-main-img low-res-img"
                [class.faded-out]="isMainLoaded"
                loading="eager"
                fetchpriority="high"
                decoding="async"
                (error)="onLowResError($event)"
              />

              <!-- Layer 2: Full-Resolution Version of EXACT SAME Product Photo (smoothly dissolves over low-res) -->
              <img 
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
              >
                <img 
                  [src]="img.image_url" 
                  [alt]="product.name" 
                  class="thumb-img" 
                  (error)="onImageError($event)"
                />
              </button>
            </div>
          </div>

          <!-- Product Details Column -->
          <div class="pd-info">
            <span class="pd-category" *ngIf="product.category">{{ product.category.name }}</span>
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

            <!-- Description -->
            <div class="pd-description" *ngIf="product.description">
              <p>{{ product.description }}</p>
            </div>

            <!-- Size Selector -->
            <div class="pd-size-section">
              <div class="size-header">
                <span class="section-label">Select Size:</span>
                <span *ngIf="selectedSizeConfig" class="stock-status-text" [class.low]="selectedSizeConfig.stock <= 5">
                  {{ selectedSizeConfig.stock > 0 ? (selectedSizeConfig.stock <= 5 ? '⚠️ Only ' + selectedSizeConfig.stock + ' left in stock!' : 'In Stock') : '❌ Out of Stock' }}
                </span>
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

            <!-- Quantity & Actions -->
            <div class="pd-actions-row">
              <!-- Quantity Stepper -->
              <div class="quantity-stepper" *ngIf="isSizeAvailable">
                <button (click)="decreaseQty()" [disabled]="quantity <= 1" class="step-btn">-</button>
                <span class="qty-num">{{ quantity }}</span>
                <button (click)="increaseQty()" [disabled]="quantity >= maxQuantity" class="step-btn">+</button>
              </div>

              <!-- Add to Cart & Buy Now Buttons -->
              <button 
                class="btn-primary flex-1" 
                [disabled]="!isSizeAvailable"
                (click)="addToCart()"
              >
                {{ isSizeAvailable ? '🛒 Add to Cart' : 'Out of Stock' }}
              </button>

              <button 
                class="btn-gold flex-1" 
                [disabled]="!isSizeAvailable"
                (click)="buyNow()"
              >
                ⚡ Buy Now
              </button>
            </div>

            <!-- Shipping & Helpline Badges -->
            <div class="pd-perks">
              <div class="perk-item">
                <span>🚚</span>
                <span>Free delivery across India on orders above ₹1499.</span>
              </div>
              <div class="perk-item">
                <span>💬</span>
                <span>Need sizing help? <a href="https://wa.me/918113899319" target="_blank">Chat with us on WhatsApp</a></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Related Products Section -->
        <section class="related-section" *ngIf="relatedProducts.length > 0">
          <div class="section-header">
            <span class="section-subtitle">YOU MAY ALSO LIKE</span>
            <h2 class="section-title">Related Ethnic Styles</h2>
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
    }
    .breadcrumbs {
      font-size: 13px;
      color: var(--color-muted);
      margin-bottom: 32px;
    }
    .breadcrumbs a {
      color: var(--color-text);
    }
    .breadcrumbs a:hover {
      color: var(--color-pink-dark);
    }

    .pd-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      margin-bottom: 80px;
    }
    @media (max-width: 992px) {
      .pd-grid { grid-template-columns: 1fr; gap: 32px; }
    }

    /* Gallery */
    .pd-gallery {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .main-image-box {
      width: 100%;
      padding-top: 125%;
      position: relative;
      background-color: var(--color-bg-alt, #F8F9FA);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .pd-main-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }
    .pd-main-img.low-res-img {
      z-index: 1;
      opacity: 1;
      transition: opacity 500ms ease-in-out;
    }
    .pd-main-img.low-res-img.faded-out {
      opacity: 0;
      pointer-events: none;
    }
    .pd-main-img.full-res-img {
      z-index: 2;
      opacity: 0;
      transition: opacity 500ms ease-in-out;
    }
    .pd-main-img.full-res-img.loaded {
      opacity: 1;
    }

    .thumbnail-row {
      display: flex;
      gap: 12px;
      overflow-x: auto;
    }
    .thumb-btn {
      width: 80px;
      height: 100px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 2px solid transparent;
      padding: 0;
      background: #F8F9FA;
      cursor: pointer;
    }
    .thumb-btn.active {
      border-color: var(--color-pink-dark);
    }
    .thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Details */
    .pd-info {
      display: flex;
      flex-direction: column;
    }
    .pd-category {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--color-gold);
      margin-bottom: 8px;
    }
    .pd-title {
      font-size: 36px;
      line-height: 1.2;
      margin-bottom: 8px;
    }
    .pd-sku {
      font-size: 12px;
      color: var(--color-light-muted);
      margin-bottom: 16px;
    }

    .pd-pricing {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--color-border-light);
    }
    .sale-price {
      font-size: 28px;
      font-weight: 700;
      color: #C05676;
    }
    .original-price {
      font-size: 18px;
      color: var(--color-light-muted);
      text-decoration: line-through;
    }
    .regular-price {
      font-size: 28px;
      font-weight: 700;
      color: var(--color-text-heading);
    }
    .discount-badge {
      background-color: var(--color-pink-light);
      color: #C05676;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: var(--radius-full);
    }
    .tax-info {
      font-size: 12px;
      color: var(--color-muted);
      margin-left: auto;
    }

    .pd-description {
      font-size: 15px;
      color: var(--color-text);
      line-height: 1.7;
      margin-bottom: 32px;
    }

    /* Size Section */
    .pd-size-section {
      margin-bottom: 32px;
    }
    .size-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .section-label {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stock-status-text {
      font-size: 13px;
      color: #2E7D32;
      font-weight: 600;
    }
    .stock-status-text.low {
      color: #E65100;
    }

    .size-options-grid {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .pd-size-btn {
      width: 54px;
      height: 48px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 600;
      background: #FFFFFF;
      color: var(--color-text-heading);
      transition: var(--transition);
    }
    .pd-size-btn:hover:not(.disabled) {
      border-color: var(--color-pink-dark);
      color: var(--color-pink-dark);
    }
    .pd-size-btn.active {
      background-color: var(--color-pink-dark);
      border-color: var(--color-pink-dark);
      color: #FFFFFF;
    }
    .pd-size-btn.disabled {
      opacity: 0.3;
      cursor: not-allowed;
      text-decoration: line-through;
    }

    /* Actions */
    .pd-actions-row {
      display: flex;
      gap: 16px;
      margin-bottom: 32px;
    }
    @media (max-width: 576px) {
      .pd-actions-row { flex-direction: column; }
    }
    .flex-1 { flex: 1; }

    .quantity-stepper {
      display: flex;
      align-items: center;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      height: 48px;
    }
    .step-btn {
      width: 40px;
      height: 100%;
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-heading);
    }
    .qty-num {
      padding: 0 16px;
      font-weight: 600;
    }

    .pd-perks {
      background-color: var(--color-bg-alt);
      border-radius: var(--radius-md);
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      font-size: 13px;
    }
    .perk-item {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .related-section {
      padding-top: 40px;
      border-top: 1px solid var(--color-border-light);
    }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
    @media (max-width: 992px) {
      .product-grid { grid-template-columns: repeat(2, 1fr); }
    }

    .loading-box {
      text-align: center;
      padding: 100px 0;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--color-pink-light);
      border-top-color: var(--color-pink-dark);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  images: ImageItem[] = [];
  activeImageUrl = '';
  isMainLoaded = false;
  
  sizeList: { size: SizeOption; stock: number }[] = [];
  selectedSize: SizeOption = 'M';
  quantity = 1;

  relatedProducts: Product[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
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
    this.isMainLoaded = false;
    this.product = await this.productService.getProductBySlug(slug);
    if (!this.product) {
      this.router.navigate(['/shop']);
      return;
    }

    // Build Images using robust extractor
    this.images = extractProductImages(this.product);
    this.activeImageUrl = this.images[0].image_url;

    // Build Sizes
    const availableSizesList: SizeOption[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    if (this.product.sizes && this.product.sizes.length > 0) {
      this.sizeList = this.product.sizes.map(s => ({ size: s.size, stock: s.stock }));
    } else {
      this.sizeList = availableSizesList.map(size => ({ size, stock: this.product!.stock > 0 ? 5 : 0 }));
    }

    // Default select first in-stock size
    const inStock = this.sizeList.find(s => s.stock > 0);
    if (inStock) {
      this.selectedSize = inStock.size;
    } else if (this.sizeList.length > 0) {
      this.selectedSize = this.sizeList[0].size;
    }

    // Load related products from same category
    if (this.product.category_id) {
      const allCategoryProducts = await this.productService.getProducts({ categoryId: this.product.category_id });
      this.relatedProducts = allCategoryProducts.filter(p => p.id !== this.product!.id).slice(0, 4);
    }
  }

  get lowResActiveUrl(): string {
    return getResponsiveImageUrl(this.activeImageUrl, 320);
  }

  onLowResError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.style.display = 'none';
    }
  }

  onImageError(event: Event) {
    handleImageError(event);
  }

  get selectedSizeConfig() {
    return this.sizeList.find(s => s.size === this.selectedSize);
  }

  get isSizeAvailable(): boolean {
    return !!(this.selectedSizeConfig && this.selectedSizeConfig.stock > 0);
  }

  get maxQuantity(): number {
    return this.selectedSizeConfig ? this.selectedSizeConfig.stock : 1;
  }

  get discountPercentage(): number {
    if (this.product && this.product.sale_price && this.product.price > 0) {
      return Math.round(((this.product.price - this.product.sale_price) / this.product.price) * 100);
    }
    return 0;
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
    if (!this.product || !this.isSizeAvailable) return;
    try {
      this.cartService.addToCart(this.product, this.selectedSize, this.quantity);
      alert(`Added ${this.quantity} item(s) of ${this.product.name} (Size: ${this.selectedSize}) to cart!`);
    } catch (e: any) {
      alert(e.message || 'Error adding to cart');
    }
  }

  buyNow() {
    if (!this.product || !this.isSizeAvailable) return;
    this.cartService.addToCart(this.product, this.selectedSize, this.quantity);
    this.router.navigate(['/checkout']);
  }

  onQuickAddRelated(event: { product: Product; size: SizeOption }) {
    this.cartService.addToCart(event.product, event.size, 1);
    alert(`Added ${event.product.name} (Size: ${event.size}) to cart!`);
  }
}
