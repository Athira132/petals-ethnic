import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';
import { Observable } from 'rxjs';
import { extractProductImages, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../core/utils/image.utils';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="wishlist-page">
      <!-- Breadcrumb -->
      <div class="breadcrumb-container">
        <div class="container">
          <nav class="breadcrumb-nav">
            <a routerLink="/">Home</a>
            <span class="sep">/</span>
            <span class="current">My Wishlist</span>
          </nav>
        </div>
      </div>

      <div class="container wishlist-content">
        <!-- Header -->
        <div class="wishlist-header">
          <h1 class="wishlist-title">My Wishlist</h1>
          <p class="wishlist-subtitle" *ngIf="(wishlist$ | async) as items">
            {{ items.length }} {{ items.length === 1 ? 'saved item' : 'saved items' }}
          </p>
        </div>

        <!-- Wishlist Items Grid -->
        <ng-container *ngIf="(wishlist$ | async) as items">
          <div class="wishlist-grid" *ngIf="items.length > 0; else emptyWishlist">
            <div class="wishlist-card" *ngFor="let product of items; trackBy: trackById">
              <!-- Remove button -->
              <button 
                class="btn-remove-wishlist" 
                (click)="removeItem(product.id)" 
                title="Remove from Wishlist"
                aria-label="Remove item"
              >
                &times;
              </button>

              <!-- Image Link -->
              <a [routerLink]="['/product', product.slug]" class="wishlist-img-wrap">
                <img 
                  [src]="getProductImage(product)" 
                  [alt]="product.name" 
                  class="wishlist-img"
                  (error)="onImageError($event)"
                  loading="lazy"
                />
              </a>

              <!-- Card Content -->
              <div class="wishlist-card-body">
                <span class="wishlist-dept">{{ (product.department || 'ethnic') | uppercase }}</span>
                <a [routerLink]="['/product', product.slug]" class="wishlist-prod-name">
                  {{ product.name }}
                </a>

                <!-- Price -->
                <div class="wishlist-price-row">
                  <ng-container *ngIf="product.sale_price && product.sale_price < product.price; else regularPrice">
                    <span class="sale-price">₹{{ product.sale_price | number:'1.0-0' }}</span>
                    <span class="orig-price">₹{{ product.price | number:'1.0-0' }}</span>
                  </ng-container>
                  <ng-template #regularPrice>
                    <span class="regular-price">₹{{ product.price | number:'1.0-0' }}</span>
                  </ng-template>
                </div>

                <!-- Add to Cart CTA -->
                <button 
                  class="btn-add-cart" 
                  (click)="addToCart(product)"
                  [disabled]="product.stock === 0"
                >
                  {{ product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart' }}
                </button>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- Empty State -->
        <ng-template #emptyWishlist>
          <div class="empty-wishlist-box">
            <div class="empty-icon-circle">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C2185B" stroke-width="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <h2>Your Wishlist is Empty</h2>
            <p>Save your favourite designer sarees, anarkalis, and handcrafted jewellery to view them anytime.</p>
            <div class="empty-actions">
              <a routerLink="/ethnics" class="btn-primary">Explore Ethnics</a>
              <a routerLink="/jewellery" class="btn-secondary">Explore Jewellery</a>
            </div>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .wishlist-page {
      min-height: 80vh;
      background: #FAFAFA;
      padding-bottom: 80px;
    }
    .breadcrumb-container {
      background: #FFFFFF;
      border-bottom: 1px solid #EAE6E1;
      padding: 12px 0;
    }
    .breadcrumb-nav {
      font-size: 13px;
      color: #666666;
    }
    .breadcrumb-nav a {
      color: #1A1A1A;
      text-decoration: none;
    }
    .breadcrumb-nav a:hover {
      color: var(--color-pink-dark, #C2185B);
    }
    .breadcrumb-nav .sep {
      margin: 0 8px;
      color: #999999;
    }
    .breadcrumb-nav .current {
      color: var(--color-pink-dark, #C2185B);
      font-weight: 600;
    }

    .wishlist-content {
      padding-top: 32px;
    }
    .wishlist-header {
      margin-bottom: 28px;
    }
    .wishlist-title {
      font-family: var(--font-serif, serif);
      font-size: 28px;
      font-weight: 700;
      color: #0D0D0D;
      margin: 0 0 6px 0;
    }
    .wishlist-subtitle {
      font-size: 14px;
      color: #666666;
      margin: 0;
    }

    .wishlist-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    @media (max-width: 992px) {
      .wishlist-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }
    }
    @media (max-width: 768px) {
      .wishlist-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
    }
    @media (max-width: 480px) {
      .wishlist-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
    }

    .wishlist-card {
      background: #FFFFFF;
      border: 1px solid #EAE6E1;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
      transition: all 0.25s ease;
    }
    .wishlist-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
      border-color: #D4AF37;
    }

    .btn-remove-wishlist {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 2;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid #EAE6E1;
      color: #666666;
      font-size: 18px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-remove-wishlist:hover {
      background: #C2185B;
      color: #FFFFFF;
      border-color: #C2185B;
    }

    .wishlist-img-wrap {
      width: 100%;
      aspect-ratio: 1 / 1;
      overflow: hidden;
      background: #F4F0EB;
      display: block;
    }
    .wishlist-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .wishlist-card:hover .wishlist-img {
      transform: scale(1.04);
    }

    .wishlist-card-body {
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .wishlist-dept {
      font-size: 10px;
      letter-spacing: 1px;
      font-weight: 700;
      color: #C5A059;
      margin-bottom: 4px;
    }
    .wishlist-prod-name {
      font-size: 14px;
      font-weight: 600;
      color: #1A1A1A;
      text-decoration: none;
      line-height: 1.35;
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 38px;
    }
    .wishlist-prod-name:hover {
      color: var(--color-pink-dark, #C2185B);
    }

    .wishlist-price-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 12px;
      margin-top: auto;
    }
    .sale-price {
      font-size: 16px;
      font-weight: 700;
      color: var(--color-pink-dark, #C2185B);
    }
    .orig-price {
      font-size: 12px;
      color: #999999;
      text-decoration: line-through;
    }
    .regular-price {
      font-size: 16px;
      font-weight: 700;
      color: #1A1A1A;
    }

    .btn-add-cart {
      width: 100%;
      padding: 9px 12px;
      background: var(--color-pink-dark, #C2185B);
      color: #FFFFFF;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .btn-add-cart:hover:not(:disabled) {
      background: #A01349;
    }
    .btn-add-cart:disabled {
      background: #E0E0E0;
      color: #999999;
      cursor: not-allowed;
    }

    /* Empty state */
    .empty-wishlist-box {
      background: #FFFFFF;
      border: 1px solid #EAE6E1;
      border-radius: 12px;
      padding: 60px 24px;
      text-align: center;
      max-width: 520px;
      margin: 40px auto 0 auto;
    }
    .empty-icon-circle {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: #FFF0F4;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px auto;
    }
    .empty-wishlist-box h2 {
      font-family: var(--font-serif, serif);
      font-size: 24px;
      color: #0D0D0D;
      margin: 0 0 8px 0;
    }
    .empty-wishlist-box p {
      font-size: 14px;
      color: #666666;
      line-height: 1.5;
      margin: 0 0 24px 0;
    }
    .empty-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn-primary {
      padding: 10px 20px;
      background: var(--color-pink-dark, #C2185B);
      color: #FFFFFF;
      text-decoration: none;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 600;
      transition: background 0.2s;
    }
    .btn-primary:hover {
      background: #A01349;
    }
    .btn-secondary {
      padding: 10px 20px;
      background: #FFFFFF;
      color: #0D0D0D;
      border: 1px solid #0D0D0D;
      text-decoration: none;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-secondary:hover {
      background: #0D0D0D;
      color: #FFFFFF;
    }
  `]
})
export class WishlistComponent implements OnInit {
  wishlist$!: Observable<Product[]>;

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.wishlist$ = this.wishlistService.wishlist$;
  }

  getProductImage(product: Product): string {
    const images = extractProductImages(product);
    return images.length > 0 ? images[0].image_url : DEFAULT_FALLBACK_IMAGE;
  }

  onImageError(event: Event) {
    handleImageError(event);
  }

  removeItem(productId: string) {
    this.wishlistService.removeFromWishlist(productId);
  }

  addToCart(product: Product) {
    try {
      this.cartService.addToCart(product, undefined, 1);
      alert(`Added "${product.name}" to cart!`);
    } catch (e: any) {
      alert(e.message || 'Error adding to cart');
    }
  }

  trackById(index: number, item: Product): string {
    return item.id;
  }
}
