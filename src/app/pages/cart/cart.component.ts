import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CartItem, CartSummary } from '../../core/models/cart.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="cart-page">
      <div class="page-hero-banner cart-hero-bg">
        <div class="container">
          <h1 class="page-hero-title">Your Shopping Bag</h1>
          <p class="page-hero-subtitle">Review your selected ethnic styles, select size quantities, and proceed to secure checkout.</p>
        </div>
      </div>

      <div class="container cart-container">
        <div *ngIf="(cartSummary$ | async) as summary; else emptyCart">
          <div class="cart-layout" *ngIf="summary.items.length > 0; else emptyCart">
            <!-- Items List -->
            <div class="cart-items-column">
              <div class="cart-table-header">
                <span>Product</span>
                <span>Size</span>
                <span>Price</span>
                <span>Quantity</span>
                <span>Subtotal</span>
                <span></span>
              </div>

              <div *ngFor="let item of summary.items" class="cart-item-row">
                <!-- Media & Title -->
                <div class="cart-item-media">
                  <img 
                    [src]="getItemImage(item)" 
                    [alt]="item.product.name" 
                    class="item-img" 
                  />
                  <div>
                    <h3 class="item-name">
                      <a [routerLink]="['/product', item.product.slug]">{{ item.product.name }}</a>
                    </h3>
                    <span class="item-cat" *ngIf="item.product.category">{{ item.product.category.name }}</span>
                  </div>
                </div>

                <!-- Selected Size -->
                <div class="cart-item-size">
                  <span class="size-tag">{{ item.selectedSize }}</span>
                </div>

                <!-- Unit Price -->
                <div class="cart-item-price">
                  ₹{{ item.unitPrice | number:'1.0-0' }}
                </div>

                <!-- Quantity Control -->
                <div class="cart-item-qty">
                  <div class="qty-stepper">
                    <button (click)="updateQuantity(item.id, item.quantity - 1)">-</button>
                    <span>{{ item.quantity }}</span>
                    <button (click)="updateQuantity(item.id, item.quantity + 1)">+</button>
                  </div>
                </div>

                <!-- Subtotal -->
                <div class="cart-item-total">
                  ₹{{ item.totalPrice | number:'1.0-0' }}
                </div>

                <!-- Remove Button -->
                <div class="cart-item-remove">
                  <button (click)="removeItem(item.id)" class="remove-btn" title="Remove Item">&times;</button>
                </div>
              </div>

              <div class="cart-actions-bar">
                <a routerLink="/shop" class="btn-outline">← Continue Shopping</a>
                <button (click)="clearCart()" class="clear-btn">Clear Cart</button>
              </div>
            </div>

            <!-- Summary Column -->
            <div class="cart-summary-column">
              <div class="summary-card">
                <h2 class="summary-title">Order Summary</h2>

                <div class="summary-row">
                  <span>Subtotal ({{ summary.totalQuantity }} items)</span>
                  <span>₹{{ summary.subtotal | number:'1.0-0' }}</span>
                </div>

                <div class="summary-row">
                  <span>Estimated Delivery</span>
                  <span [class.free-shipping]="summary.shipping === 0">
                    {{ summary.shipping === 0 ? 'FREE' : '₹' + summary.shipping }}
                  </span>
                </div>

                <div class="free-shipping-progress" *ngIf="summary.subtotal < 1499">
                  <span>Add ₹{{ 1499 - summary.subtotal }} more for <strong>FREE Delivery</strong></span>
                </div>

                <div class="summary-divider"></div>

                <div class="summary-row grand-total-row">
                  <span>Grand Total</span>
                  <span class="grand-price">₹{{ summary.grandTotal | number:'1.0-0' }}</span>
                </div>

                <button (click)="proceedToCheckout()" class="btn-primary checkout-btn">
                  Proceed to Checkout →
                </button>

                <div class="payment-badges">
                  <span>🔒 100% Secure Checkout via Razorpay & UPI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #emptyCart>
      <div class="empty-cart-box">
        <div class="cart-icon">🛍️</div>
        <h2>Your Shopping Cart is Empty</h2>
        <p>Explore our latest Indian ethnic wear collections and add your favorite outfits to cart.</p>
        <a routerLink="/shop" class="btn-primary">Shop Our Collection</a>
      </div>
    </ng-template>
  `,
  styles: [`
    .page-hero-banner {
      position: relative;
      background: linear-gradient(rgba(0,0,0,0.68), rgba(0,0,0,0.68)), url('https://i.ibb.co/5ZcYbZx/Chat-GPT-Image-Aug-13-2026-12-15-54-PM.png') center/cover no-repeat;
      padding: 50px 20px;
      text-align: center;
      color: #FFFFFF;
      margin-bottom: 30px;
    }
    .page-hero-title {
      font-size: 32px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 8px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }
    .page-hero-subtitle {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      text-shadow: 0 1px 4px rgba(0,0,0,0.5);
    }
    @media (max-width: 768px) {
      .page-hero-banner { padding: 36px 16px; margin-bottom: 20px; }
      .page-hero-title { font-size: 22px; }
      .page-hero-subtitle { font-size: 12px; }
    }

    .cart-page {
      padding: 48px 0 80px 0;
    }
    .page-title {
      font-size: 36px;
      margin-bottom: 32px;
    }

    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 40px;
    }
    @media (max-width: 992px) {
      .cart-layout { grid-template-columns: 1fr; }
    }

    .cart-table-header {
      display: grid;
      grid-template-columns: 3fr 1fr 1fr 1.5fr 1fr 40px;
      gap: 16px;
      padding: 12px 16px;
      background-color: var(--color-bg-alt);
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--color-muted);
      margin-bottom: 16px;
    }
    @media (max-width: 768px) {
      .cart-table-header { display: none; }
    }

    .cart-item-row {
      display: grid;
      grid-template-columns: 3fr 1fr 1fr 1.5fr 1fr 40px;
      gap: 16px;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--color-border-light);
    }
    @media (max-width: 768px) {
      .cart-item-row {
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
    }

    .cart-item-media {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .item-img {
      width: 70px;
      height: 90px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      background-color: var(--color-bg-alt);
    }
    .item-name {
      font-family: var(--font-body);
      font-size: 15px;
      font-weight: 600;
      color: var(--color-text-heading);
    }
    .item-cat {
      font-size: 11px;
      color: var(--color-gold);
      font-weight: 600;
      text-transform: uppercase;
    }

    .size-tag {
      display: inline-block;
      padding: 4px 10px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: 600;
    }

    .qty-stepper {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
    }
    .qty-stepper button {
      width: 32px;
      height: 32px;
      font-size: 16px;
      font-weight: 600;
    }
    .qty-stepper span {
      padding: 0 12px;
      font-weight: 600;
      font-size: 14px;
    }

    .cart-item-total {
      font-weight: 700;
      color: #C05676;
    }

    .remove-btn {
      font-size: 24px;
      color: var(--color-light-muted);
      transition: var(--transition);
    }
    .remove-btn:hover {
      color: #D32F2F;
    }

    .cart-actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
    }
    .clear-btn {
      font-size: 13px;
      color: #D32F2F;
      font-weight: 600;
    }

    /* Summary Card */
    .summary-card {
      background: var(--color-bg-alt);
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-md);
      padding: 28px;
    }
    .summary-title {
      font-size: 20px;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--color-border);
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      margin-bottom: 16px;
      color: var(--color-text);
    }
    .free-shipping {
      color: #2E7D32;
      font-weight: 700;
    }
    .free-shipping-progress {
      background-color: var(--color-pink-light);
      color: #C05676;
      font-size: 12px;
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      margin-bottom: 16px;
      text-align: center;
    }
    .summary-divider {
      height: 1px;
      background-color: var(--color-border);
      margin: 16px 0;
    }
    .grand-total-row {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-text-heading);
    }
    .grand-price {
      color: #C05676;
      font-size: 22px;
    }
    .checkout-btn {
      width: 100%;
      margin-top: 24px;
      padding: 16px;
    }
    .payment-badges {
      margin-top: 16px;
      text-align: center;
      font-size: 12px;
      color: var(--color-muted);
    }

    /* Empty Cart */
    .empty-cart-box {
      text-align: center;
      padding: 80px 24px;
      max-width: 500px;
      margin: 0 auto;
    }
    .cart-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }
    .empty-cart-box h2 {
      font-size: 28px;
      margin-bottom: 12px;
    }
    .empty-cart-box p {
      color: var(--color-muted);
      margin-bottom: 24px;
    }
  `]
})
export class CartComponent {
  cartSummary$: Observable<CartSummary>;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {
    this.cartSummary$ = this.cartService.cartSummary$;
  }

  getItemImage(item: CartItem): string {
    if (item.product.images && item.product.images.length > 0) {
      return item.product.images[0].image_url;
    }
    return 'https://i.ibb.co/7tQbhHpZ/Whats-App-Image-2026-08-13-at-12-31-11-PM-2.jpg';
  }

  updateQuantity(itemId: string, newQty: number) {
    this.cartService.updateQuantity(itemId, newQty);
  }

  removeItem(itemId: string) {
    this.cartService.removeFromCart(itemId);
  }

  clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
  }

  proceedToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
