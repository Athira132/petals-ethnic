import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { PaymentService } from '../../core/services/payment.service';
import { CartSummary } from '../../core/models/cart.model';
import { UserProfile } from '../../core/models/user.model';
import { Order } from '../../core/models/order.model';
import { extractProductImages, handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../core/utils/image.utils';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="checkout-page" *ngIf="summary && summary.items.length > 0; else emptyCheckout">
      <div class="page-hero-banner checkout-hero-bg">
        <div class="container">
          <h1 class="page-hero-title">Checkout & Payment</h1>
          <p class="page-hero-subtitle">Complete your delivery address and pay securely via Razorpay gateway.</p>
        </div>
      </div>

      <div class="container checkout-container">
        <div class="checkout-grid">
          <!-- Left Column: Shipping & Payment Form -->
          <div class="checkout-form-column">
            <!-- Step 1: Contact & Shipping Address -->
            <div class="checkout-card">
              <h2 class="card-title">1. Shipping & Contact Details</h2>

              <form #shippingForm="ngForm" class="checkout-form">
                <div class="form-row">
                  <div class="form-group flex-1">
                    <label class="form-label" for="name">Full Name *</label>
                    <input 
                      type="text" 
                      id="name" 
                      [(ngModel)]="shipping.customer_name" 
                      name="customer_name" 
                      required 
                      class="form-control"
                      placeholder="e.g. Ananya Sharma"
                    />
                  </div>

                  <div class="form-group flex-1">
                    <label class="form-label" for="phone">Phone Number *</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      [(ngModel)]="shipping.customer_phone" 
                      name="customer_phone" 
                      required 
                      class="form-control"
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="email">Email Address *</label>
                  <input 
                    type="email" 
                    id="email" 
                    [(ngModel)]="shipping.customer_email" 
                    name="customer_email" 
                    required 
                    class="form-control"
                    placeholder="e.g. ananya@example.com"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="address">Street Address / House No. *</label>
                  <textarea 
                    id="address" 
                    [(ngModel)]="shipping.address" 
                    name="address" 
                    required 
                    rows="2" 
                    class="form-control"
                    placeholder="Flat / Building No., Street, Landmark"
                  ></textarea>
                </div>

                <div class="form-row">
                  <div class="form-group flex-1">
                    <label class="form-label" for="city">City *</label>
                    <input 
                      type="text" 
                      id="city" 
                      [(ngModel)]="shipping.city" 
                      name="city" 
                      required 
                      class="form-control"
                      placeholder="e.g. Kochi"
                    />
                  </div>

                  <div class="form-group flex-1">
                    <label class="form-label" for="state">State *</label>
                    <input 
                      type="text" 
                      id="state" 
                      [(ngModel)]="shipping.state" 
                      name="state" 
                      required 
                      class="form-control"
                      placeholder="e.g. Kerala"
                    />
                  </div>

                  <div class="form-group flex-1">
                    <label class="form-label" for="pincode">PIN Code *</label>
                    <input 
                      type="text" 
                      id="pincode" 
                      [(ngModel)]="shipping.pincode" 
                      name="pincode" 
                      required 
                      class="form-control"
                      placeholder="e.g. 682001"
                    />
                  </div>
                </div>
              </form>
            </div>

            <!-- Step 2: Payment Method (Razorpay ONLY) -->
            <div class="checkout-card">
              <h2 class="card-title">2. Payment Method</h2>

              <div class="payment-method-options">
                <!-- Exclusive Razorpay Gateway Card -->
                <div class="payment-option selected active-razorpay-card">
                  <div class="option-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <div class="option-details">
                    <span class="option-title">Razorpay Secure Online Gateway</span>
                    <span class="option-desc">Fast, encrypted online checkout. Supports UPI (Google Pay, PhonePe, Paytm), All Major Credit & Debit Cards, NetBanking, and Wallets.</span>
                  </div>
                  <span class="verified-badge">ACTIVE</span>
                </div>
              </div>

              <div class="payment-assurance-box">
                <p>100% Secure 256-bit SSL encrypted checkout. Cash on Delivery is discontinued to guarantee touchless and swift courier dispatch.</p>
              </div>
            </div>
          </div>

          <!-- Right Column: Order Summary & Place Order Button -->
          <div class="checkout-summary-column">
            <div class="summary-card">
              <h2 class="card-title">Order Items ({{ summary.totalQuantity }})</h2>

              <div class="order-items-mini">
                <div *ngFor="let item of summary.items" class="mini-item">
                  <img [src]="getItemImage(item)" [alt]="item.product.name" class="mini-img" (error)="onImageError($event)" />
                  <div class="mini-info">
                    <span class="mini-title">{{ item.product.name }}</span>
                    <span class="mini-size">
                      <span *ngIf="item.selectedSize && item.selectedSize !== 'One Size' && item.selectedSize !== 'N/A'">Size: {{ item.selectedSize }} • </span>
                      <span *ngIf="item.selectedColor">Color: {{ item.selectedColor }} • </span>
                      Qty: {{ item.quantity }}
                    </span>
                  </div>
                  <span class="mini-price">₹{{ item.totalPrice | number:'1.0-0' }}</span>
                </div>
              </div>

              <div class="summary-divider"></div>

              <div class="summary-row">
                <span>Subtotal</span>
                <span>₹{{ summary.subtotal | number:'1.0-0' }}</span>
              </div>

              <div class="summary-row">
                <span>Shipping</span>
                <span>{{ summary.shipping === 0 ? 'FREE' : '₹' + summary.shipping }}</span>
              </div>

              <div class="summary-divider"></div>

              <div class="summary-row grand-total-row">
                <span>Total Amount</span>
                <span class="grand-price">₹{{ summary.grandTotal | number:'1.0-0' }}</span>
              </div>

              <div *ngIf="errorMessage" class="checkout-error">
                {{ errorMessage }}
              </div>

              <button 
                (click)="placeOrder()" 
                [disabled]="isProcessing" 
                class="btn-primary place-order-btn"
              >
                {{ isProcessing ? 'Connecting to Razorpay...' : 'Pay ₹' + (summary.grandTotal | number:'1.0-0') + ' via Razorpay' }}
              </button>

              <p class="terms-text">
                By placing an order, you agree to Petal Ethnics & Jewellers terms and shipping policies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Success Modal / Screen -->
    <div class="order-success-modal" *ngIf="completedOrder">
      <div class="success-box">
        <div class="success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2>Order Confirmed!</h2>
        <p class="order-no">Order Reference: <strong>{{ completedOrder.order_number }}</strong></p>
        <p class="success-desc">
          Thank you for shopping with Petal Ethnics & Jewellers! We have received your order and payment.
        </p>

        <div class="order-details-mini">
          <p><strong>Customer:</strong> {{ completedOrder.customer_name }} ({{ completedOrder.customer_phone }})</p>
          <p><strong>Delivery Address:</strong> {{ completedOrder.address }}, {{ completedOrder.city }}, {{ completedOrder.state }} - {{ completedOrder.pincode }}</p>
          <p><strong>Total Paid:</strong> ₹{{ completedOrder.total | number:'1.0-0' }}</p>
          <p><strong>Payment Status:</strong> PAID (Razorpay)</p>
          <p *ngIf="completedOrder.payment_reference"><strong>Payment ID:</strong> {{ completedOrder.payment_reference }}</p>
        </div>

        <!-- WhatsApp Store Notification Backup Button -->
        <div class="whatsapp-backup-action" *ngIf="whatsappNotificationUrl">
          <a [href]="whatsappNotificationUrl" target="_blank" rel="noopener" class="btn-whatsapp-notify">
            <span>Notify Admin on WhatsApp (+91 81138 99319)</span>
          </a>
          <small class="whatsapp-hint">Click to send an instant order receipt copy to our store WhatsApp helpline.</small>
        </div>

        <div class="success-actions">
          <a routerLink="/account" class="btn-primary">View My Orders</a>
          <a routerLink="/shop" class="btn-outline">Continue Shopping</a>
        </div>
      </div>
    </div>

    <ng-template #emptyCheckout>
      <div class="empty-box">
        <h2>Your Cart is Empty</h2>
        <p>Please add items to your cart before proceeding to checkout.</p>
        <a routerLink="/shop" class="btn-primary">Go to Shop</a>
      </div>
    </ng-template>
  `,
  styles: [`
    .page-hero-banner {
      position: relative;
      background: linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.35)), url('https://i.ibb.co/0yhmLfnt/Chat-GPT-Image-Aug-13-2026-11-59-23-AM.png') center/cover no-repeat;
      padding: 40px 20px;
      text-align: center;
      color: #FFFFFF;
      margin-bottom: 30px;
    }
    .page-hero-title {
      font-family: var(--font-serif);
      font-size: 30px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 6px;
    }
    .page-hero-subtitle {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      max-width: 600px;
      margin: 0 auto;
    }

    .checkout-container {
      padding-bottom: 80px;
    }
    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 36px;
    }
    @media (max-width: 992px) {
      .checkout-grid {
        grid-template-columns: 1fr;
      }
    }

    .checkout-card {
      background: #FFFFFF;
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-md);
      padding: 24px;
      margin-bottom: 24px;
    }
    .card-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-heading);
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--color-border-light);
    }

    .form-row {
      display: flex;
      gap: 16px;
    }
    @media (max-width: 600px) {
      .form-row { flex-direction: column; gap: 0; }
    }
    .form-group {
      margin-bottom: 16px;
    }
    .flex-1 { flex: 1; }
    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-heading);
      margin-bottom: 6px;
    }
    .form-control {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: 14px;
      background: #FFFFFF;
      transition: var(--transition);
      box-sizing: border-box;
    }
    .form-control:focus {
      outline: none;
      border-color: var(--color-pink-dark);
      box-shadow: 0 0 0 3px rgba(192, 86, 118, 0.15);
    }

    /* Payment Card */
    .active-razorpay-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 18px;
      border-radius: var(--radius-md);
      border: 2px solid var(--color-pink-dark);
      background: #FFF5F7;
    }
    .option-icon {
      font-size: 24px;
    }
    .option-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .option-title {
      font-weight: 700;
      font-size: 15px;
      color: var(--color-text-heading);
    }
    .option-desc {
      font-size: 12px;
      color: var(--color-muted);
      line-height: 1.4;
    }
    .verified-badge {
      background: var(--color-pink-dark);
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 20px;
      letter-spacing: 0.5px;
    }
    .payment-assurance-box {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 14px;
      padding: 12px 14px;
      background: #FDF9F6;
      border: 1px solid #F3E8E2;
      border-radius: var(--radius-sm);
      font-size: 12px;
      color: var(--color-muted);
    }
    .shield-icon { font-size: 16px; flex-shrink: 0; }

    /* Summary Card */
    .summary-card {
      background: #FFFFFF;
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-md);
      padding: 24px;
      position: sticky;
      top: 100px;
    }
    .order-items-mini {
      display: flex;
      flex-direction: column;
      gap: 14px;
      max-height: 240px;
      overflow-y: auto;
      margin-bottom: 16px;
    }
    .mini-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
    }
    .mini-img {
      width: 48px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
    }
    .mini-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .mini-title {
      font-weight: 600;
      color: var(--color-text-heading);
    }
    .mini-size {
      font-size: 11px;
      color: var(--color-muted);
    }
    .mini-price {
      font-weight: 600;
      color: var(--color-pink-dark);
    }

    .summary-divider {
      height: 1px;
      background-color: var(--color-border-light);
      margin: 16px 0;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      margin-bottom: 10px;
    }
    .grand-total-row {
      font-size: 18px;
      font-weight: 700;
    }
    .grand-price {
      color: var(--color-pink-dark);
      font-size: 22px;
    }
    .checkout-error {
      background-color: #FEE2E2;
      color: #991B1B;
      padding: 12px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      margin-top: 16px;
    }
    .place-order-btn {
      width: 100%;
      margin-top: 20px;
      padding: 16px;
      font-size: 15px;
      font-weight: 700;
    }
    .terms-text {
      font-size: 11px;
      color: var(--color-muted);
      text-align: center;
      margin-top: 12px;
    }

    /* Modal */
    .order-success-modal {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .success-box {
      background: #FFFFFF;
      max-width: 540px;
      width: 100%;
      padding: 36px;
      border-radius: var(--radius-lg);
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }
    .success-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }
    .order-no {
      font-size: 17px;
      color: var(--color-pink-dark);
      margin-bottom: 12px;
    }
    .success-desc {
      font-size: 14px;
      color: var(--color-muted);
      margin-bottom: 20px;
    }
    .order-details-mini {
      background-color: var(--color-bg-alt, #F8F9FA);
      padding: 16px;
      border-radius: var(--radius-md);
      text-align: left;
      font-size: 13px;
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .whatsapp-backup-action {
      margin-bottom: 24px;
      padding: 14px;
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      border-radius: var(--radius-md);
    }
    .btn-whatsapp-notify {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: #25D366;
      color: #FFFFFF;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      padding: 10px 18px;
      border-radius: var(--radius-sm);
      transition: background 0.2s ease;
      width: 100%;
      box-sizing: border-box;
    }
    .btn-whatsapp-notify:hover {
      background: #1EBE5D;
    }
    .whatsapp-hint {
      display: block;
      font-size: 11px;
      color: #166534;
      margin-top: 6px;
    }

    .success-actions {
      display: flex;
      gap: 14px;
      justify-content: center;
    }
    .btn-outline {
      padding: 12px 20px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      text-decoration: none;
      color: var(--color-text);
      font-weight: 600;
    }
    .empty-box {
      text-align: center;
      padding: 80px 24px;
    }
  `]
})
export class CheckoutComponent implements OnInit {
  summary!: CartSummary;
  userProfile: UserProfile | null = null;

  shipping = {
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  };

  isProcessing = false;
  errorMessage = '';
  completedOrder: Order | null = null;
  whatsappNotificationUrl = '';

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.summary = this.cartService.currentSummary;
    this.userProfile = this.authService.userProfile;

    if (!this.authService.currentUser) {
      this.router.navigate(['/login'], { queryParams: { redirect: '/checkout' } });
      return;
    }

    if (this.userProfile) {
      this.shipping.customer_name = this.userProfile.name || '';
      this.shipping.customer_email = this.userProfile.email || '';
      this.shipping.customer_phone = this.userProfile.phone || '';
    }
  }

  getItemImage(item: any): string {
    if (item.selectedImage) return item.selectedImage;
    const images = extractProductImages(item.product);
    return images.length > 0 ? images[0].image_url : DEFAULT_FALLBACK_IMAGE;
  }

  onImageError(event: Event) {
    handleImageError(event);
  }

  async placeOrder() {
    if (!this.shipping.customer_name || !this.shipping.customer_email || !this.shipping.customer_phone || !this.shipping.address || !this.shipping.city || !this.shipping.state || !this.shipping.pincode) {
      this.errorMessage = 'Please complete all required shipping & contact details.';
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';

    const payload = {
      ...this.shipping,
      subtotal: this.summary.subtotal,
      discount: this.summary.discount,
      delivery_charge: this.summary.shipping,
      total: this.summary.grandTotal,
      payment_method: 'razorpay' as const,
      items: this.summary.items
    };

    const user = this.authService.currentUser;

    try {
      // 1. Create order record
      const createdOrder = await this.orderService.createOrder(payload, user?.id);

      // 2. Open Razorpay Gateway Modal
      await this.paymentService.openRazorpayCheckout({
        amountInRupees: this.summary.grandTotal,
        orderId: createdOrder.order_number,
        customerName: this.shipping.customer_name,
        customerEmail: this.shipping.customer_email,
        customerPhone: this.shipping.customer_phone,
        onSuccess: async (paymentId: string) => {
          await this.orderService.updatePaymentStatus(createdOrder.id, 'paid', paymentId);
          createdOrder.payment_status = 'paid';
          createdOrder.payment_reference = paymentId;
          this.completedOrder = createdOrder;

          // 3. Format WhatsApp Notification for Store Admin (+91 81138 99319)
          const itemsList = (this.summary.items || []).map((it) => {
            let details = `- ${it.product.name} × ${it.quantity}`;
            if (it.selectedColor) details += `\n  Colour: ${it.selectedColor}`;
            if (it.selectedSize && it.selectedSize !== 'N/A' && it.selectedSize !== 'One Size') details += `\n  Size: ${it.selectedSize}`;
            return details;
          }).join('\n');

          const waText = `New Order Received\n` +
            `Order ID: #${createdOrder.order_number}\n` +
            `Customer: ${this.shipping.customer_name}\n` +
            `Phone: ${this.shipping.customer_phone}\n` +
            `Items:\n${itemsList || 'N/A'}\n` +
            `Total: ₹${this.summary.grandTotal}\n` +
            `Payment: Razorpay`;

          this.whatsappNotificationUrl = `https://wa.me/918113899319?text=${encodeURIComponent(waText)}`;

          this.cartService.clearCart();
          this.isProcessing = false;
        },
        onCancel: () => {
          this.isProcessing = false;
          this.errorMessage = 'Payment was cancelled or closed. You can retry securely.';
        }
      });
    } catch (err: any) {
      console.error('Checkout error:', err);
      this.errorMessage = err.message || 'Error processing your order. Please try again.';
      this.isProcessing = false;
    }
  }
}
