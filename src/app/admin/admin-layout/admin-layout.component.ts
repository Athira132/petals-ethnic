import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-wrapper">
      <!-- Admin Sidebar Navigation -->
      <aside class="admin-sidebar">
        <div class="admin-brand">
          <img src="https://i.ibb.co/d4SMQvxj/Whats-App-Image-2026-08-13-at-10-59-05-AM.jpg" alt="Logo" class="admin-logo" />
          <div class="brand-info">
            <span class="admin-title">Petals Admin</span>
            <span class="admin-role">Super Admin Panel</span>
          </div>
        </div>

        <nav class="admin-nav">
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="admin-nav-link">
            📊 Dashboard
          </a>
          <a routerLink="/admin/products" routerLinkActive="active" class="admin-nav-link">
            👗 Products CRUD
          </a>
          <a routerLink="/admin/categories" routerLinkActive="active" class="admin-nav-link">
            🏷️ Categories CRUD
          </a>
          <a routerLink="/admin/inventory" routerLinkActive="active" class="admin-nav-link">
            📦 Size Inventory
          </a>
          <a routerLink="/admin/orders" routerLinkActive="active" class="admin-nav-link">
            🛍️ Orders Management
          </a>
        </nav>

        <div class="admin-sidebar-footer">
          <a routerLink="/" class="btn-outline full-width">← Customer Website</a>
          <button (click)="logout()" class="logout-link">Sign Out</button>
        </div>
      </aside>

      <!-- Main Admin Content Area -->
      <main class="admin-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .admin-wrapper {
      display: grid;
      grid-template-columns: 260px 1fr;
      min-height: 100vh;
      background-color: var(--color-bg-alt);
    }
    @media (max-width: 992px) {
      .admin-wrapper { grid-template-columns: 1fr; }
    }

    .admin-sidebar {
      background: #111111;
      color: #FFFFFF;
      padding: 24px;
      display: flex;
      flex-direction: column;
    }
    .admin-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 24px;
      border-bottom: 1px solid #222222;
      margin-bottom: 24px;
    }
    .admin-logo {
      height: 40px;
      border-radius: 4px;
    }
    .admin-title {
      font-weight: 700;
      font-size: 16px;
      display: block;
      color: #FFFFFF;
    }
    .admin-role {
      font-size: 11px;
      color: var(--color-gold);
      text-transform: uppercase;
    }

    .admin-nav {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .admin-nav-link {
      padding: 12px 16px;
      color: #CCCCCC;
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 500;
      transition: var(--transition);
    }
    .admin-nav-link:hover, .admin-nav-link.active {
      background-color: var(--color-pink-dark);
      color: #FFFFFF;
    }

    .admin-sidebar-footer {
      margin-top: auto;
      padding-top: 24px;
      border-top: 1px solid #222222;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .admin-sidebar-footer .btn-outline {
      color: #FFFFFF;
      border-color: #333333;
      text-align: center;
    }
    .logout-link {
      color: #FF5252;
      font-size: 13px;
      text-align: center;
      cursor: pointer;
    }

    .admin-main {
      padding: 40px;
      overflow-y: auto;
    }
    @media (max-width: 768px) {
      .admin-main { padding: 20px; }
    }
  `]
})
export class AdminLayoutComponent {
  constructor(private authService: AuthService, private router: Router) {}

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
