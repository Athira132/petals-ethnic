import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { Order, OrderStatus, PaymentStatus } from '../../core/models/order.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="order-admin">
      <div class="header-flex">
        <div>
          <h1 class="page-title">Orders Management</h1>
          <p class="page-subtitle">Track, update order status, and verify customer payments.</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <input 
          type="text" 
          placeholder="Filter by Order #, Customer Name, or Phone..." 
          [(ngModel)]="searchQuery" 
          (input)="filterOrders()" 
          class="form-control filter-input"
        />

        <select [(ngModel)]="selectedStatus" (change)="filterOrders()" class="form-control filter-select">
          <option value="">All Order Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <!-- Orders Table -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer & Address</th>
                <th>Items & Total</th>
                <th>Payment Method</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of filteredOrders">
                <td>
                  <strong>{{ order.order_number }}</strong>
                  <div class="date-text">{{ order.created_at | date:'mediumDate' }}</div>
                </td>
                <td>
                  <strong>{{ order.customer_name }}</strong>
                  <div class="sub-text">📞 {{ order.customer_phone }}</div>
                  <div class="sub-text">✉️ {{ order.customer_email }}</div>
                  <div class="address-text">📍 {{ order.address }}, {{ order.city }} - {{ order.pincode }}</div>
                </td>
                <td>
                  <div class="items-list">
                    <span *ngFor="let item of order.order_items" class="item-tag">
                      {{ item.product_name }} ({{ item.size }}) × {{ item.quantity }}
                    </span>
                  </div>
                  <div class="total-text">₹{{ order.total | number:'1.0-0' }}</div>
                </td>
                <td>
                  <span class="pay-method">{{ order.payment_method | uppercase }}</span>
                  <div *ngIf="order.payment_reference" class="utr-text">
                    Ref: <code>{{ order.payment_reference }}</code>
                  </div>
                </td>
                <td>
                  <select 
                    [ngModel]="order.payment_status" 
                    (ngModelChange)="onUpdatePaymentStatus(order, $event)"
                    class="status-select pay-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid ✅</option>
                    <option value="awaiting_verification">Awaiting Verification ⏳</option>
                    <option value="failed">Failed ❌</option>
                    <option value="refunded">Refunded ↩️</option>
                  </select>
                </td>
                <td>
                  <select 
                    [ngModel]="order.order_status" 
                    (ngModelChange)="onUpdateOrderStatus(order, $event)"
                    class="status-select order-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped 🚚</option>
                    <option value="delivered">Delivered 🎉</option>
                    <option value="cancelled">Cancelled ❌</option>
                  </select>
                </td>
                <td>
                  <button (click)="openDetailModal(order)" class="detail-btn">
                    🔍 Full Details
                  </button>
                </td>
              </tr>
              <tr *ngIf="filteredOrders.length === 0">
                <td colspan="7" class="text-center">No orders found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detail Modal -->
      <div class="modal-backdrop" *ngIf="selectedOrderModal">
        <div class="modal-box">
          <div class="modal-header">
            <h2>Order Details: {{ selectedOrderModal.order_number }}</h2>
            <button (click)="selectedOrderModal = null" class="close-modal-btn">&times;</button>
          </div>

          <div class="modal-body">
            <div class="detail-row">
              <p><strong>Customer:</strong> {{ selectedOrderModal.customer_name }}</p>
              <p><strong>Phone:</strong> {{ selectedOrderModal.customer_phone }}</p>
              <p><strong>Email:</strong> {{ selectedOrderModal.customer_email }}</p>
              <p><strong>Shipping Address:</strong> {{ selectedOrderModal.address }}, {{ selectedOrderModal.city }}, {{ selectedOrderModal.state }} - {{ selectedOrderModal.pincode }}</p>
            </div>

            <div class="detail-row">
              <p><strong>Payment Method:</strong> {{ selectedOrderModal.payment_method | uppercase }}</p>
              <p><strong>Payment Reference / UTR:</strong> {{ selectedOrderModal.payment_reference || 'N/A' }}</p>
              <p><strong>Payment Status:</strong> {{ selectedOrderModal.payment_status | uppercase }}</p>
              <p><strong>Order Status:</strong> {{ selectedOrderModal.order_status | uppercase }}</p>
            </div>

            <h4 class="items-heading">Order Line Items:</h4>
            <div class="modal-items-list">
              <div *ngFor="let item of selectedOrderModal.order_items" class="modal-item">
                <span>{{ item.product_name }} (Size: {{ item.size }}) × {{ item.quantity }}</span>
                <strong>₹{{ item.total_price | number:'1.0-0' }}</strong>
              </div>
            </div>

            <div class="modal-summary">
              <p>Subtotal: ₹{{ selectedOrderModal.subtotal | number:'1.0-0' }}</p>
              <p>Delivery Charge: ₹{{ selectedOrderModal.delivery_charge | number:'1.0-0' }}</p>
              <h3>Grand Total: ₹{{ selectedOrderModal.total | number:'1.0-0' }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header-flex { margin-bottom: 24px; }
    .page-title { font-size: 28px; margin-bottom: 4px; }
    .page-subtitle { font-size: 14px; color: var(--color-muted); }

    .filter-bar { display: flex; gap: 16px; margin-bottom: 24px; }
    .filter-input { flex: 2; }
    .filter-select { flex: 1; }

    .table-card { background: #FFFFFF; border: 1px solid var(--color-border-light); border-radius: var(--radius-md); }
    .table-responsive { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .admin-table th, .admin-table td { padding: 14px 16px; border-bottom: 1px solid var(--color-border-light); text-align: left; vertical-align: top; }
    .admin-table th { background-color: var(--color-bg-alt); font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--color-muted); }

    .date-text { font-size: 11px; color: var(--color-muted); }
    .sub-text { font-size: 12px; color: var(--color-muted); }
    .address-text { font-size: 11px; color: var(--color-text); margin-top: 4px; }

    .items-list { display: flex; flex-direction: column; gap: 2px; }
    .item-tag { font-size: 12px; font-weight: 500; }
    .total-text { font-size: 15px; font-weight: 700; color: #C05676; margin-top: 4px; }

    .pay-method { font-size: 11px; font-weight: 700; background: var(--color-bg-alt); padding: 2px 6px; border-radius: 4px; }
    .utr-text { font-size: 11px; margin-top: 4px; }

    .status-select { padding: 6px 10px; font-size: 12px; font-weight: 600; border-radius: 4px; border: 1px solid var(--color-border); }

    .detail-btn { font-size: 12px; color: var(--color-pink-dark); font-weight: 600; }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .modal-box { background: #FFFFFF; width: 100%; max-width: 580px; border-radius: var(--radius-lg); padding: 32px; max-height: 85vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--color-border-light); padding-bottom: 12px; }
    .close-modal-btn { font-size: 28px; color: var(--color-muted); }

    .detail-row { background: var(--color-bg-alt); padding: 16px; border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 4px; }
    .items-heading { margin-bottom: 12px; font-size: 15px; }
    .modal-items-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
    .modal-item { display: flex; justify-content: space-between; font-size: 14px; border-bottom: 1px dashed var(--color-border); padding-bottom: 6px; }
    .modal-summary { text-align: right; border-top: 1px solid var(--color-border-light); padding-top: 12px; }
    .text-center { text-align: center; }
  `]
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];

  searchQuery = '';
  selectedStatus = '';

  selectedOrderModal: Order | null = null;

  constructor(private orderService: OrderService) {}

  async ngOnInit() {
    await this.loadOrders();
  }

  async loadOrders() {
    this.orders = await this.orderService.getAllOrders();
    this.filterOrders();
  }

  filterOrders() {
    this.filteredOrders = this.orders.filter(o => {
      const query = this.searchQuery.toLowerCase();
      const matchesQuery = !query || 
        o.order_number.toLowerCase().includes(query) || 
        o.customer_name.toLowerCase().includes(query) || 
        o.customer_phone.includes(query);

      const matchesStatus = !this.selectedStatus || o.order_status === this.selectedStatus;

      return matchesQuery && matchesStatus;
    });
  }

  async onUpdateOrderStatus(order: Order, newStatus: OrderStatus) {
    try {
      await this.orderService.updateOrderStatus(order.id, newStatus);
      order.order_status = newStatus;
      alert(`Updated Order #${order.order_number} status to ${newStatus.toUpperCase()}`);
    } catch (e: any) {
      alert(e.message || 'Error updating order status');
    }
  }

  async onUpdatePaymentStatus(order: Order, newStatus: PaymentStatus) {
    try {
      await this.orderService.updatePaymentStatus(order.id, newStatus);
      order.payment_status = newStatus;
      alert(`Updated Order #${order.order_number} payment status to ${newStatus.toUpperCase()}`);
    } catch (e: any) {
      alert(e.message || 'Error updating payment status');
    }
  }

  openDetailModal(order: Order) {
    this.selectedOrderModal = order;
  }
}
