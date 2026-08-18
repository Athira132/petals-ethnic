import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { Product, ProductSize } from '../../core/models/product.model';

export interface FlattenedInventoryItem {
  sizeId?: string;
  productId: string;
  productName: string;
  sku?: string | null;
  size: string;
  stock: number;
  status: string;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="inventory-admin">
      <div class="header-flex">
        <div>
          <h1 class="page-title">Size & Stock Inventory</h1>
          <p class="page-subtitle">Monitor and instantly update stock for every product size (XS to XXL).</p>
        </div>
      </div>

      <div class="filter-bar">
        <input 
          type="text" 
          placeholder="Filter by product name or SKU..." 
          [(ngModel)]="searchQuery"
          (input)="filterItems()"
          class="form-control filter-input"
        />
        <label class="checkbox-label">
          <input type="checkbox" [(ngModel)]="lowStockOnly" (change)="filterItems()" />
          <span>Show Low Stock Only (≤ 5)</span>
        </label>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="error-card">
        <p>⚠️ {{ errorMessage }}</p>
        <button (click)="loadInventory()" class="btn-outline btn-sm">Retry Loading</button>
      </div>

      <div class="table-card" *ngIf="!errorMessage">
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Size</th>
                <th>Current Stock</th>
                <th>Status</th>
                <th>Quick Update Stock</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading Spinner State -->
              <tr *ngIf="isLoading">
                <td colspan="6" class="text-center loading-cell">
                  <div class="spinner"></div>
                  <span>Loading inventory...</span>
                </td>
              </tr>

              <!-- Inventory Rows -->
              <tr *ngFor="let item of filteredItems">
                <td><strong>{{ item.productName }}</strong></td>
                <td>{{ item.sku || 'N/A' }}</td>
                <td><span class="size-pill">{{ item.size }}</span></td>
                <td>
                  <strong [class.text-danger]="item.stock === 0" [class.text-warning]="item.stock > 0 && item.stock <= 5">
                    {{ item.stock }} units
                  </strong>
                </td>
                <td>
                  <span class="badge" [class.badge-dark]="item.stock === 0" [class.badge-gold]="item.stock > 0 && item.stock <= 5" [class.badge-pink]="item.stock > 5">
                    {{ item.stock === 0 ? 'SOLD OUT' : (item.stock <= 5 ? 'FEW LEFT' : 'AVAILABLE') }}
                  </span>
                </td>
                <td>
                  <div class="stock-update-box">
                    <input 
                      type="number" 
                      min="0" 
                      [(ngModel)]="item.stock" 
                      class="form-control stock-input" 
                    />
                    <button (click)="saveStock(item)" class="btn-primary update-btn">Save</button>
                  </div>
                </td>
              </tr>

              <!-- Empty State after loading -->
              <tr *ngIf="!isLoading && filteredItems.length === 0">
                <td colspan="6" class="text-center empty-cell">No inventory items matching criteria.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header-flex { margin-bottom: 24px; }
    .page-title { font-size: 28px; margin-bottom: 4px; }
    .page-subtitle { font-size: 14px; color: var(--color-muted); }

    .filter-bar { display: flex; gap: 20px; align-items: center; margin-bottom: 24px; }
    .filter-input { max-width: 360px; }
    .checkbox-label { font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; }

    .error-card { background: #FFEBEE; border: 1px solid #FFCDD2; color: #C62828; padding: 20px; border-radius: var(--radius-md); margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
    .btn-sm { padding: 6px 12px; font-size: 12px; }

    .table-card { background: #FFFFFF; border: 1px solid var(--color-border-light); border-radius: var(--radius-md); }
    .table-responsive { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .admin-table th, .admin-table td { padding: 14px 16px; border-bottom: 1px solid var(--color-border-light); text-align: left; }
    .admin-table th { background-color: var(--color-bg-alt); font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--color-muted); }

    .loading-cell { padding: 40px 16px !important; color: var(--color-muted); font-size: 14px; }
    .empty-cell { padding: 30px 16px !important; color: var(--color-muted); }

    .spinner { width: 24px; height: 24px; border: 3px solid rgba(192, 86, 118, 0.2); border-top-color: #C05676; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 10px auto; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .size-pill { padding: 4px 8px; background: var(--color-bg-alt); border: 1px solid var(--color-border); border-radius: 4px; font-weight: 700; font-size: 12px; }
    .text-danger { color: #C62828; }
    .text-warning { color: #E65100; }

    .stock-update-box { display: flex; gap: 8px; align-items: center; }
    .stock-input { width: 80px; padding: 6px 10px; text-align: center; }
    .update-btn { padding: 6px 14px; font-size: 12px; }
    .text-center { text-align: center; }
  `]
})
export class InventoryComponent implements OnInit {
  products: Product[] = [];
  inventoryList: FlattenedInventoryItem[] = [];
  filteredItems: FlattenedInventoryItem[] = [];

  searchQuery = '';
  lowStockOnly = false;

  isLoading = true; // Initial loading state set to true!
  errorMessage = '';

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadInventory();
  }

  async loadInventory() {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    try {
      this.products = await this.productService.getProducts({ activeOnly: false });
      this.inventoryList = [];

      const defaultSizes: Array<'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'> = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

      this.products.forEach(p => {
        if (p.sizes && p.sizes.length > 0) {
          p.sizes.forEach(s => {
            this.inventoryList.push({
              sizeId: s.id,
              productId: p.id,
              productName: p.name,
              sku: p.sku,
              size: s.size,
              stock: s.stock,
              status: s.status
            });
          });
        } else {
          defaultSizes.forEach(size => {
            this.inventoryList.push({
              productId: p.id,
              productName: p.name,
              sku: p.sku,
              size,
              stock: p.stock,
              status: p.stock > 0 ? 'available' : 'sold_out'
            });
          });
        }
      });

      this.filterItems();

    } catch (err: any) {
      console.error('Error loading inventory in admin:', err);
      this.errorMessage = 'Unable to load inventory. Please try again.';
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  filterItems() {
    this.filteredItems = this.inventoryList.filter(item => {
      const matchesQuery = !this.searchQuery || 
        item.productName.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        (item.sku && item.sku.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesLowStock = !this.lowStockOnly || item.stock <= 5;

      return matchesQuery && matchesLowStock;
    });
    this.cdr.markForCheck();
  }

  async saveStock(item: FlattenedInventoryItem) {
    if (item.stock < 0) {
      alert('Stock quantity cannot be negative.');
      item.stock = 0;
      return;
    }

    try {
      if (item.sizeId) {
        await this.productService.updateSizeStock(item.sizeId, item.stock);
      } else {
        await this.productService.updateProduct(item.productId, { stock: item.stock });
      }
      alert(`Updated stock for ${item.productName} (Size: ${item.size}) to ${item.stock}`);
      this.cdr.markForCheck();
    } catch (e: any) {
      alert(e.message || 'Error updating stock');
    }
  }
}
