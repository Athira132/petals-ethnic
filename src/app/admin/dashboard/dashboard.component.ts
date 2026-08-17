import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { ProductService } from '../../core/services/product.service';
import { Order } from '../../core/models/order.model';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-dashboard">
      <div class="dashboard-header">
        <h1 class="page-title">Store Overview & Performance</h1>
        <p class="page-subtitle">Real-time statistics for Petals Ethnic Boutique.</p>
      </div>

      <!-- Key Metric Cards Grid -->
      <div class="metrics-grid">
        <div class="metric-card gold">
          <div class="metric-icon">💰</div>
          <div class="metric-data">
            <span class="metric-label">Total Revenue</span>
            <h2 class="metric-value">₹{{ totalRevenue | number:'1.0-0' }}</h2>
          </div>
        </div>

        <div class="metric-card pink">
          <div class="metric-icon">📦</div>
          <div class="metric-data">
            <span class="metric-label">Total Orders</span>
            <h2 class="metric-value">{{ totalOrdersCount }}</h2>
          </div>
        </div>

        <div class="metric-card dark">
          <div class="metric-icon">⏳</div>
          <div class="metric-data">
            <span class="metric-label">Pending Orders</span>
            <h2 class="metric-value">{{ pendingOrdersCount }}</h2>
          </div>
        </div>

        <div class="metric-card warning">
          <div class="metric-icon">⚠️</div>
          <div class="metric-data">
            <span class="metric-label">Low Stock Alerts</span>
            <h2 class="metric-value">{{ lowStockCount }}</h2>
          </div>
        </div>
      </div>

      <!-- Recent Orders Table Preview -->
      <div class="dashboard-table-card margin-top-32">
        <div class="card-header-flex">
          <h3>Recent Customer Orders</h3>
          <a routerLink="/admin/orders" class="btn-outline">View All Orders →</a>
        </div>

        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of recentOrders">
                <td><strong>{{ order.order_number }}</strong></td>
                <td>{{ order.customer_name }} ({{ order.customer_phone }})</td>
                <td>{{ order.created_at | date:'shortDate' }}</td>
                <td>₹{{ order.total | number:'1.0-0' }}</td>
                <td>
                  <span class="badge" [class.badge-pink]="order.payment_status === 'paid'">
                    {{ order.payment_status }}
                  </span>
                </td>
                <td>
                  <span class="badge badge-dark">{{ order.order_status }}</span>
                </td>
              </tr>
              <tr *ngIf="recentOrders.length === 0">
                <td colspan="6" class="text-center">No orders recorded yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title { font-size: 28px; margin-bottom: 4px; }
    .page-subtitle { font-size: 14px; color: var(--color-muted); margin-bottom: 28px; }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    @media (max-width: 992px) {
      .metrics-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 576px) {
      .metrics-grid { grid-template-columns: 1fr; }
    }

    .metric-card {
      background: #FFFFFF;
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-md);
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: var(--shadow-sm);
    }
    .metric-card.gold { border-top: 4px solid var(--color-gold); }
    .metric-card.pink { border-top: 4px solid var(--color-pink-dark); }
    .metric-card.dark { border-top: 4px solid var(--color-text-heading); }
    .metric-card.warning { border-top: 4px solid #E65100; }

    .metric-icon { font-size: 32px; }
    .metric-label { font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--color-muted); }
    .metric-value { font-size: 24px; font-weight: 700; color: var(--color-text-heading); margin-top: 2px; }

    .margin-top-32 { margin-top: 32px; }
    .dashboard-table-card {
      background: #FFFFFF;
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-md);
      padding: 24px;
    }
    .card-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .table-responsive { overflow-x: auto; }
    .admin-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    .admin-table th, .admin-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid var(--color-border-light);
    }
    .admin-table th {
      background-color: var(--color-bg-alt);
      font-weight: 600;
      color: var(--color-muted);
      text-transform: uppercase;
      font-size: 11px;
    }
    .text-center { text-align: center; }
  `]
})
export class DashboardComponent implements OnInit {
  orders: Order[] = [];
  products: Product[] = [];

  totalRevenue = 0;
  totalOrdersCount = 0;
  pendingOrdersCount = 0;
  lowStockCount = 0;
  recentOrders: Order[] = [];

  constructor(
    private orderService: OrderService,
    private productService: ProductService
  ) {}

  async ngOnInit() {
    try {
      this.orders = await this.orderService.getAllOrders();
      this.products = await this.productService.getProducts({ activeOnly: false });

      this.totalOrdersCount = this.orders.length;
      this.totalRevenue = this.orders
        .filter(o => o.payment_status === 'paid' || o.order_status === 'delivered')
        .reduce((acc, o) => acc + o.total, 0);

      this.pendingOrdersCount = this.orders.filter(o => o.order_status === 'pending').length;
      this.recentOrders = this.orders.slice(0, 5);

      this.lowStockCount = this.products.filter(p => p.stock <= (p.low_stock_threshold || 5)).length;
    } catch (e) {
      console.error('Error loading dashboard stats:', e);
    }
  }
}
