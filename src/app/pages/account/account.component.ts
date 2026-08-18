import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { UserProfile } from '../../core/models/user.model';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="account-page" *ngIf="profile; else loadingBlock">
      <div class="page-hero-banner account-hero-bg">
        <div class="container">
          <h1 class="page-hero-title">My Account & Orders</h1>
          <p class="page-hero-subtitle">Manage your personal profile, track active orders, and view past purchases.</p>
        </div>
      </div>

      <div class="container account-container">
        <!-- Account Header -->
        <div class="account-header-box">
          <div>
            <span class="welcome-text">WELCOME BACK</span>
            <h1 class="user-name">{{ profile.name }}</h1>
            <p class="user-email">✉️ {{ profile.email }} | 📞 {{ profile.phone || 'Not provided' }}</p>
          </div>
          <div class="account-header-actions">
            <a *ngIf="isAdmin" routerLink="/admin" class="btn-gold">⚙️ Admin Dashboard</a>
            <button (click)="logout()" class="btn-outline">Sign Out</button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="account-tabs">
          <button class="tab-btn" [class.active]="activeTab === 'orders'" (click)="activeTab = 'orders'">
            🛍️ My Orders ({{ orders.length }})
          </button>
          <button class="tab-btn" [class.active]="activeTab === 'profile'" (click)="activeTab = 'profile'">
            👤 Edit Profile
          </button>
        </div>

        <!-- Tab 1: Orders -->
        <div *ngIf="activeTab === 'orders'" class="tab-content">
          <div *ngIf="orders.length > 0; else noOrders">
            <div class="orders-list">
              <div *ngFor="let order of orders" class="order-card">
                <div class="order-card-header">
                  <div>
                    <span class="order-number">Order #{{ order.order_number }}</span>
                    <span class="order-date">{{ order.created_at | date:'mediumDate' }}</span>
                  </div>
                  <div class="order-status-badges">
                    <span class="badge" [ngClass]="getOrderStatusBadgeClass(order.order_status)">
                      {{ order.order_status | uppercase }}
                    </span>
                    <span class="badge" [ngClass]="getPaymentStatusBadgeClass(order.payment_status)">
                      PAYMENT: {{ order.payment_status | uppercase }}
                    </span>
                  </div>
                </div>

                <div class="order-card-body">
                  <div class="order-items-preview">
                    <div *ngFor="let item of order.order_items" class="order-item-mini">
                      <img [src]="item.product_image || fallbackImg" [alt]="item.product_name" class="mini-img" />
                      <div class="mini-details">
                        <span class="item-title">{{ item.product_name }}</span>
                        <span class="item-meta">Size: {{ item.size }} | Qty: {{ item.quantity }}</span>
                      </div>
                      <span class="item-price">₹{{ item.total_price | number:'1.0-0' }}</span>
                    </div>
                  </div>

                  <div class="order-summary-footer">
                    <div class="address-preview">
                      <strong>Deliver to:</strong> {{ order.customer_name }}, {{ order.address }}, {{ order.city }} - {{ order.pincode }}
                    </div>
                    <div class="order-total-box">
                      <span>Total Amount:</span>
                      <strong class="total-price">₹{{ order.total | number:'1.0-0' }}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 2: Edit Profile -->
        <div *ngIf="activeTab === 'profile'" class="tab-content max-w-500">
          <div class="profile-card">
            <h3>Profile Settings</h3>
            <div *ngIf="profileSuccess" class="alert success">✅ Profile updated successfully!</div>
            <div *ngIf="profileError" class="alert error">⚠️ {{ profileError }}</div>

            <form (ngSubmit)="updateProfile()" class="profile-form">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" [(ngModel)]="editName" name="editName" class="form-control" />
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input type="tel" [(ngModel)]="editPhone" name="editPhone" class="form-control" />
              </div>
              <div class="form-group">
                <label class="form-label">Email (Read Only)</label>
                <input type="email" [value]="profile.email" disabled class="form-control disabled" />
              </div>

              <button type="submit" [disabled]="isSaving" class="btn-primary">
                {{ isSaving ? 'Saving...' : 'Save Profile Changes' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <ng-template #noOrders>
      <div class="no-orders-box">
        <h3>No Orders Placed Yet</h3>
        <p>You haven't placed any orders with Petals Ethnic yet.</p>
        <a routerLink="/shop" class="btn-primary">Explore Shop</a>
      </div>
    </ng-template>

    <ng-template #loadingBlock>
      <div class="loading-box">
        <div class="spinner"></div>
        <p>Loading user account details...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .page-hero-banner {
      position: relative;
      background: linear-gradient(rgba(0,0,0,0.68), rgba(0,0,0,0.68)), url('https://i.ibb.co/G4bg5wKQ/379a42c6-1c91-404e-8fb6-d04a4689c4a2.png') center/cover no-repeat;
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

    .account-page {
      padding: 0 0 80px 0;
    }
    .account-header-box {
      background-color: var(--color-bg-alt);
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-lg);
      padding: 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    @media (max-width: 768px) {
      .account-header-box { flex-direction: column; align-items: flex-start; gap: 20px; }
    }
    .welcome-text {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      color: var(--color-gold);
    }
    .user-name {
      font-size: 32px;
      margin-bottom: 4px;
    }
    .user-email {
      font-size: 14px;
      color: var(--color-muted);
    }
    .account-header-actions {
      display: flex;
      gap: 12px;
    }

    .account-tabs {
      display: flex;
      gap: 16px;
      border-bottom: 1px solid var(--color-border-light);
      margin-bottom: 32px;
    }
    .tab-btn {
      padding: 12px 24px;
      font-size: 15px;
      font-weight: 600;
      color: var(--color-muted);
      border-bottom: 2px solid transparent;
      transition: var(--transition);
    }
    .tab-btn.active {
      color: var(--color-text-heading);
      border-bottom-color: var(--color-pink-dark);
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .order-card {
      background: #FFFFFF;
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }
    .order-card-header {
      background-color: var(--color-bg-alt);
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--color-border-light);
    }
    @media (max-width: 576px) {
      .order-card-header { flex-direction: column; align-items: flex-start; gap: 8px; }
    }
    .order-number {
      font-weight: 700;
      font-size: 16px;
      margin-right: 12px;
    }
    .order-date {
      font-size: 13px;
      color: var(--color-muted);
    }
    .order-status-badges {
      display: flex;
      gap: 8px;
    }

    .order-card-body {
      padding: 24px;
    }
    .order-items-preview {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
    }
    .order-item-mini {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .mini-img {
      width: 50px;
      height: 64px;
      object-fit: cover;
      border-radius: 4px;
    }
    .mini-details {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .item-title {
      font-weight: 600;
    }
    .item-meta {
      font-size: 12px;
      color: var(--color-muted);
    }
    .item-price {
      font-weight: 600;
      color: #C05676;
    }

    .order-summary-footer {
      border-top: 1px solid var(--color-border-light);
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
    }
    @media (max-width: 576px) {
      .order-summary-footer { flex-direction: column; align-items: flex-start; gap: 12px; }
    }
    .total-price {
      font-size: 18px;
      color: #C05676;
      margin-left: 8px;
    }

    .max-w-500 { max-width: 500px; }
    .profile-card {
      background: #FFFFFF;
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-md);
      padding: 32px;
    }
    .profile-card h3 {
      margin-bottom: 20px;
    }
    .form-control.disabled {
      background-color: var(--color-bg-alt);
    }

    .alert {
      padding: 12px;
      border-radius: 4px;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .alert.success { background-color: #E8F5E9; color: #2E7D32; }
    .alert.error { background-color: #FFEBEE; color: #C62828; }

    .no-orders-box, .loading-box {
      text-align: center;
      padding: 60px 0;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid var(--color-pink-light);
      border-top-color: var(--color-pink-dark);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AccountComponent implements OnInit {
  profile: UserProfile | null = null;
  orders: Order[] = [];
  activeTab: 'orders' | 'profile' = 'orders';

  editName = '';
  editPhone = '';
  isSaving = false;
  profileSuccess = false;
  profileError = '';

  fallbackImg = 'https://i.ibb.co/7tQbhHpZ/Whats-App-Image-2026-08-13-at-12-31-11-PM-2.jpg';

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router
  ) {}

  async ngOnInit() {
    const user = this.authService.currentUser;
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.profile = await this.authService.loadUserProfile(user.id);
    if (this.profile) {
      this.editName = this.profile.name;
      this.editPhone = this.profile.phone || '';
      this.orders = await this.orderService.getMyOrders(user.id);
    }
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  async updateProfile() {
    this.isSaving = true;
    this.profileSuccess = false;
    this.profileError = '';

    try {
      const updated = await this.authService.updateProfile(this.editName, this.editPhone);
      this.profile = updated;
      this.profileSuccess = true;
    } catch (err: any) {
      console.error('Profile update error:', err);
      this.profileError = err.message || 'Error updating profile.';
    } finally {
      this.isSaving = false;
    }
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/']);
  }

  getOrderStatusBadgeClass(status: string): string {
    switch (status) {
      case 'delivered': return 'badge-gold';
      case 'shipped':
      case 'packed':
      case 'confirmed': return 'badge-pink';
      default: return 'badge-dark';
    }
  }

  getPaymentStatusBadgeClass(status: string): string {
    switch (status) {
      case 'paid': return 'badge-pink';
      case 'awaiting_verification': return 'badge-gold';
      default: return 'badge-dark';
    }
  }
}
