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
      <!-- Admin Sidebar -->
      <aside class="admin-sidebar" [class.open]="isMobileSidebarOpen">
        <div class="sidebar-header">
          <a routerLink="/" class="sidebar-logo">
            <div class="logo-circle-sm">
              <img src="https://i.ibb.co/GQ2GstYF/Whats-App-Image-2026-08-13-at-10-59-05-AM.jpg" alt="Logo" />
            </div>
            <div class="logo-text">
              <strong>PETALS ETHNIC</strong>
              <span>SUPER ADMIN</span>
            </div>
          </a>
        </div>

        <nav class="sidebar-menu">
          <a routerLink="/admin/dashboard" routerLinkActive="active" (click)="closeMobileSidebar()" class="menu-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Dashboard</span>
          </a>

          <a routerLink="/admin/products" routerLinkActive="active" (click)="closeMobileSidebar()" class="menu-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span>Products</span>
          </a>

          <a routerLink="/admin/categories" routerLinkActive="active" (click)="closeMobileSidebar()" class="menu-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
            <span>Categories</span>
          </a>

          <a routerLink="/admin/inventory" routerLinkActive="active" (click)="closeMobileSidebar()" class="menu-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
            <span>Inventory & Stock</span>
          </a>

          <a routerLink="/admin/orders" routerLinkActive="active" (click)="closeMobileSidebar()" class="menu-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            <span>Orders Management</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/" class="btn-sidebar-store">Visit Public Store</a>
          <button (click)="logout()" class="btn-sidebar-logout">Logout Admin</button>
        </div>
      </aside>

      <!-- Main Admin Content Body -->
      <div class="admin-main">
        <header class="admin-header">
          <button class="admin-mobile-toggle" (click)="toggleMobileSidebar()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <div class="header-title">Petals Ethnic Store Administration</div>
        </header>

        <main class="admin-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-wrapper { display: flex; min-height: 100vh; background-color: var(--color-bg-alt); }
    .admin-sidebar { width: 260px; background-color: #0D0D0D; color: #FFFFFF; display: flex; flex-direction: column; position: fixed; top: 0; bottom: 0; left: 0; z-index: 1000; transition: transform 0.3s ease; }
    
    .sidebar-header { padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .sidebar-logo { display: flex; align-items: center; gap: 12px; }
    .logo-circle-sm { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--color-gold); overflow: hidden; background: #FFFFFF; }
    .logo-circle-sm img { width: 100%; height: 100%; object-fit: cover; }
    .logo-text strong { display: block; font-size: 14px; color: #FFFFFF; letter-spacing: 1px; }
    .logo-text span { font-size: 9px; color: var(--color-gold); letter-spacing: 1.5px; font-weight: 700; }

    .sidebar-menu { display: flex; flex-direction: column; gap: 4px; padding: 24px 16px; flex: 1; }
    .menu-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; color: #AAAAAA; font-size: 14px; font-weight: 500; border-radius: var(--radius-sm); transition: var(--transition); }
    .menu-item:hover, .menu-item.active { background-color: rgba(248, 200, 216, 0.15); color: var(--color-pink); }
    
    .sidebar-footer { padding: 24px 16px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; gap: 8px; }
    .btn-sidebar-store { display: block; text-align: center; background: rgba(255,255,255,0.1); color: #FFFFFF; padding: 8px; border-radius: var(--radius-sm); font-size: 12px; }
    .btn-sidebar-logout { text-align: center; background: #C62828; color: #FFFFFF; padding: 8px; border-radius: var(--radius-sm); font-size: 12px; border: none; cursor: pointer; }

    .admin-main { flex: 1; margin-left: 260px; display: flex; flex-direction: column; min-width: 0; }
    .admin-header { height: 64px; background: #FFFFFF; border-bottom: 1px solid var(--color-border-light); display: flex; align-items: center; padding: 0 32px; }
    .admin-mobile-toggle { display: none; background: transparent; border: none; cursor: pointer; }
    .header-title { font-size: 16px; font-weight: 600; color: var(--color-text-heading); }
    .admin-content { padding: 32px; flex: 1; }

    @media (max-width: 992px) {
      .admin-sidebar { transform: translateX(-100%); }
      .admin-sidebar.open { transform: translateX(0); }
      .admin-main { margin-left: 0; }
      .admin-mobile-toggle { display: block; margin-right: 16px; }
    }
  `]
})
export class AdminLayoutComponent {
  isMobileSidebarOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen = false;
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/']);
  }
}
