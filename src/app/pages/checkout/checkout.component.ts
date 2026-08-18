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

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="checkout-page" *ngIf="summary && summary.items.length > 0; else emptyCheckout">
      <div class="page-hero-banner checkout-hero-bg">
        <div class="container">
          <h1 class="page-hero-title">Checkout & Secure Payment</h1>
          <p class="page-hero-subtitle">Enter your shipping address, review order items, and select your preferred payment mode.</p>
        </div>
      </div>

      <div class="container checkout-container">

        <div class="checkout-grid">
          <!-- Left Column: Shipping & Payment Form -->
          <div class="checkout-form-column">
            <!-- Step 1: Contact & Shipping Address -->
            <div class="checkout-card">
              <h2 class="card-title">1. Shipping & Contact Information</h2>

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
                    />
                  </div>
                </div>
              </form>
            </div>

            <!-- Step 2: Payment Method Selection -->
            <div class="checkout-card">
              <h2 class="card-title">2. Select Payment Method</h2>

              <div class="payment-method-options">
                <!-- Option 1: Razorpay -->
                <label class="payment-option" [class.selected]="paymentMethod === 'razorpay'">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="razorpay" 
                    [(ngModel)]="paymentMethod" 
                  />
                  <div class="option-details">
                    <span class="option-title">💳 Razorpay Gateway (Cards, NetBanking, UPI App)</span>
                    <span class="option-desc">Fast, encrypted online checkout via Razorpay modal</span>
                  </div>
                </label>

                <!-- Option 2: Direct UPI QR Code -->
                <label class="payment-option" [class.selected]="paymentMethod === 'upi'">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="upi" 
                    [(ngModel)]="paymentMethod" 
                  />
                  <div class="option-details">
                    <span class="option-title">📱 Scan UPI QR Code / GPay / PhonePe</span>
                    <span class="option-desc">Direct UPI payment to Petals Ethnic Official UPI ID</span>
                  </div>
                </label>

                <!-- Option 3: COD -->
                <label class="payment-option" [class.selected]="paymentMethod === 'cod'">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="cod" 
                    [(ngModel)]="paymentMethod" 
                  />
                  <div class="option-details">
                    <span class="option-title">💵 Cash on Delivery (COD)</span>
                    <span class="option-desc">Pay cash to courier agent upon delivery</span>
                  </div>
                </label>
              </div>

              <!-- UPI QR Code Instruction Box -->
              <div *ngIf="paymentMethod === 'upi'" class="upi-instruction-box">
                <h4>Official Petals Ethnic UPI Payment:</h4>
                <div class="upi-details">
                  <p><strong>UPI ID:</strong> <code>8113899319&#64;ybl</code></p>
                  <p><strong>Payee:</strong> Petals Ethnic Boutique</p>
                  <p><strong>Amount:</strong> ₹{{ summary.grandTotal | number:'1.0-0' }}</p>
                </div>
                <div class="form-group margin-top-12">
                  <label class="form-label" for="utr">UPI Transaction Reference / UTR Number *</label>
                  <input 
                    type="text" 
                    id="utr" 
                    [(ngModel)]="upiReference" 
                    placeholder="e.g. 423987123901" 
                    class="form-control"
                  />
                  <small class="help-text">Enter the 12-digit UTR/Reference ID from your Google Pay, PhonePe, or Paytm receipt.</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Order Summary & Place Order Button -->
          <div class="checkout-summary-column">
            <div class="summary-card">
              <h2 class="card-title">Order Items ({{ summary.totalQuantity }})</h2>

              <div class="order-items-mini">
                <div *ngFor="let item of summary.items" class="mini-item">
                  <img [src]="getItemImage(item)" [alt]="item.product.name" class="mini-img" />
                  <div class="mini-info">
                    <span class="mini-title">{{ item.product.name }}</span>
                    <span class="mini-size">Size: {{ item.selectedSize }} | Qty: {{ item.quantity }}</span>
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
                ⚠️ {{ errorMessage }}
              </div>

              <button 
                (click)="placeOrder()" 
                [disabled]="isProcessing" 
                class="btn-primary place-order-btn"
              >
                {{ isProcessing ? 'Processing Order...' : 'Complete & Pay ₹' + (summary.grandTotal | number:'1.0-0') }}
              </button>

              <p class="terms-text">
                By placing an order, you agree to Petals Ethnic's shipping and boutique terms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Success Modal / Screen -->
    <div class="order-success-modal" *ngIf="completedOrder">
      <div class="success-box">
        <div class="success-icon">🎉</div>
        <h2>Order Confirmed!</h2>
        <p class="order-no">Order Reference: <strong>{{ completedOrder.order_number }}</strong></p>
        <p class="success-desc">
          Thank you for shopping with Petals Ethnic! We have received your order and will dispatch your package shortly.
        </p>

        <div class="order-details-mini">
          <p><strong>Customer:</strong> {{ completedOrder.customer_name }}</p>
          <p><strong>Delivery Address:</strong> {{ completedOrder.address }}, {{ completedOrder.city }}, {{ completedOrder.state }} - {{ completedOrder.pincode }}</p>
          <p><strong>Payment Method:</strong> {{ completedOrder.payment_method | uppercase }}</p>
          <p><strong>Payment Status:</strong> {{ completedOrder.payment_status | uppercase }}</p>
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
      background: linear-gradient(rgba(0,0,0,0.68), rgba(0,0,0,0.68)), url('https://i.ibb.co/0yhmLfnt/Chat-GPT-Image-Aug-13-2026-11-59-23-AM.png') center/cover no-repeat;
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

    .checkout-page {
      padding: 0 0 80px 0;
    }

    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 40px;
    }
    @media (max-width: 992px) {
      .checkout-grid { grid-template-columns: 1fr; }
    }

    .checkout-card {
      background: #FFFFFF;
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-md);
      padding: 32px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-sm);
    }
    .card-title {
      font-size: 20px;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--color-border-light);
    }

    .form-row {
      display: flex;
      gap: 16px;
    }
    @media (max-width: 576px) {
      .form-row { flex-direction: column; gap: 0; }
    }
    .flex-1 { flex: 1; }

    /* Payment Option Cards */
    .payment-method-options {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .payment-option {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px 20px;
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: var(--transition);
    }
    .payment-option.selected {
      border-color: var(--color-pink-dark);
      background-color: var(--color-pink-light);
    }
    .option-details {
      display: flex;
      flex-direction: column;
    }
    .option-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--color-text-heading);
    }
    .option-desc {
      font-size: 12px;
      color: var(--color-muted);
    }

    .upi-instruction-box {
      margin-top: 20px;
      padding: 20px;
      background-color: var(--color-gold-light);
      border: 1px solid var(--color-gold);
      border-radius: var(--radius-md);
    }
    .upi-instruction-box h4 {
      font-size: 15px;
      margin-bottom: 8px;
    }
    .upi-details code {
      background: #FFFFFF;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: bold;
      color: var(--color-text-heading);
    }
    .margin-top-12 { margin-top: 12px; }
    .help-text {
      font-size: 11px;
      color: var(--color-muted);
    }

    /* Summary Card */
    .summary-card {
      background: var(--color-bg-alt);
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-md);
      padding: 28px;
      position: sticky;
      top: 100px;
    }

    .order-items-mini {
      display: flex;
      flex-direction: column;
      gap: 16px;
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
    }
    .mini-size {
      font-size: 11px;
      color: var(--color-muted);
    }
    .mini-price {
      font-weight: 600;
      color: #C05676;
    }

    .summary-divider {
      height: 1px;
      background-color: var(--color-border);
      margin: 16px 0;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      margin-bottom: 12px;
    }
    .grand-total-row {
      font-size: 18px;
      font-weight: 700;
    }
    .grand-price {
      color: #C05676;
      font-size: 22px;
    }

    .checkout-error {
      background-color: #FFEBEE;
      color: #C62828;
      padding: 12px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      margin-top: 16px;
    }

    .place-order-btn {
      width: 100%;
      margin-top: 24px;
      padding: 16px;
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
      padding: 24px;
    }
    .success-box {
      background: #FFFFFF;
      max-width: 540px;
      width: 100%;
      padding: 40px;
      border-radius: var(--radius-lg);
      text-align: center;
    }
    .success-icon {
      font-size: 56px;
      margin-bottom: 12px;
    }
    .order-no {
      font-size: 18px;
      color: var(--color-pink-dark);
      margin-bottom: 16px;
    }
    .success-desc {
      font-size: 14px;
      color: var(--color-muted);
      margin-bottom: 24px;
    }
    .order-details-mini {
      background-color: var(--color-bg-alt);
      padding: 16px;
      border-radius: var(--radius-md);
      text-align: left;
      font-size: 13px;
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .success-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
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

  paymentMethod: 'razorpay' | 'upi' | 'cod' = 'razorpay';
  upiReference = '';

  isProcessing = false;
  errorMessage = '';
  completedOrder: Order | null = null;

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

    // Check if user is logged in; if not, prompt login before proceeding
    if (!this.authService.currentUser) {
      this.router.navigate(['/login'], { queryParams: { redirect: '/checkout' } });
      return;
    }

    // Auto fill shipping if user profile exists
    if (this.userProfile) {
      this.shipping.customer_name = this.userProfile.name || '';
      this.shipping.customer_email = this.userProfile.email || '';
      this.shipping.customer_phone = this.userProfile.phone || '';
    }
  }

  getItemImage(item: any): string {
    if (item.product.images && item.product.images.length > 0) {
      return item.product.images[0].image_url;
    }
    return 'https://i.ibb.co/7tQbhHpZ/Whats-App-Image-2026-08-13-at-12-31-11-PM-2.jpg';
  }

  async placeOrder() {
    // Validate inputs
    if (!this.shipping.customer_name || !this.shipping.customer_email || !this.shipping.customer_phone || !this.shipping.address || !this.shipping.city || !this.shipping.state || !this.shipping.pincode) {
      this.errorMessage = 'Please complete all required shipping & contact details.';
      return;
    }

    if (this.paymentMethod === 'upi' && !this.upiReference.trim()) {
      this.errorMessage = 'Please enter your 12-digit UPI UTR / Reference ID.';
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
      payment_method: this.paymentMethod,
      payment_reference: this.paymentMethod === 'upi' ? this.upiReference.trim() : undefined,
      items: this.summary.items
    };

    const user = this.authService.currentUser;

    try {
      if (this.paymentMethod === 'razorpay') {
        // First create pending order
        const createdOrder = await this.orderService.createOrder(payload, user?.id);
        
        // Open Razorpay Modal
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
            this.cartService.clearCart();
            this.isProcessing = false;
          },
          onCancel: () => {
            this.isProcessing = false;
            this.errorMessage = 'Razorpay payment was cancelled. You can try again or select another payment option.';
          }
        });
      } else {
        // Direct UPI or COD order creation
        const order = await this.orderService.createOrder(payload, user?.id);
        this.completedOrder = order;
        this.cartService.clearCart();
        this.isProcessing = false;
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      this.errorMessage = err.message || 'Error processing your order. Please try again.';
      this.isProcessing = false;
    }
  }
}
