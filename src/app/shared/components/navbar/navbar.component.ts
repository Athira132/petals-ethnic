import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Observable } from 'rxjs';
import { CartSummary } from '../../../core/models/cart.model';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Main Navigation Header -->
    <header class="navbar-header" [class.scrolled]="isScrolled">
      <div class="container navbar-container">
        <!-- Mobile Menu Toggle Button -->
        <button class="mobile-toggle" (click)="toggleMobileMenu()" aria-label="Toggle Navigation">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path *ngIf="!isMobileMenuOpen" d="M3 12h18M3 6h18M3 18h18" stroke-linecap="round" stroke-linejoin="round"/>
            <path *ngIf="isMobileMenuOpen" d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Brand Logo with Circular Frame -->
        <a routerLink="/" class="brand-logo">
          <div class="logo-circle">
            <img src="https://i.ibb.co/d4SMQvxj/Whats-App-Image-2026-08-13-at-10-59-05-AM.jpg" alt="Petals Ethnic Logo" class="logo-img" />
          </div>
          <div class="brand-text">
            <span class="brand-name">PETALS ETHNIC</span>
            <span class="brand-tagline">BOUTIQUE & FASHION</span>
          </div>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="desktop-nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">Home</a>
          <a routerLink="/shop" routerLinkActive="active" class="nav-link">Shop</a>
          <a routerLink="/categories" routerLinkActive="active" class="nav-link">Categories</a>
          <a routerLink="/about" routerLinkActive="active" class="nav-link">About Us</a>
          <a routerLink="/contact" routerLinkActive="active" class="nav-link">Contact</a>
        </nav>

        <!-- Navbar Actions (Search, Account, Cart) -->
        <div class="nav-actions">
          <!-- Search Bar Trigger -->
          <div class="search-box" [class.active]="isSearchOpen">
            <input 
              type="text" 
              placeholder="Search kurtis, dresses..." 
              [(ngModel)]="searchQuery"
              (keyup.enter)="onSearch()"
              class="search-input" 
            />
            <button (click)="toggleSearch()" class="action-btn" title="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>

          <!-- Account Link / Dropdown -->
          <ng-container *ngIf="user$ | async as user; else guestAuth">
            <a routerLink="/account" class="action-btn user-btn" title="My Account">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span class="nav-label desktop-only">{{ (userProfile$ | async)?.name || 'Account' }}</span>
            </a>
            <a *ngIf="isAdmin" routerLink="/admin" class="admin-badge" title="Admin Dashboard">Admin</a>
          </ng-container>
          <ng-template #guestAuth>
            <a routerLink="/login" class="action-btn" title="Login / Register">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span class="nav-label desktop-only">Login</span>
            </a>
          </ng-template>

          <!-- Cart Drawer Button -->
          <a routerLink="/cart" class="action-btn cart-btn" title="Shopping Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span *ngIf="(cartSummary$ | async)?.totalQuantity as count" class="cart-badge">{{ count }}</span>
          </a>
        </div>
      </div>
    </header>

    <!-- Mobile Slide Drawer -->
    <div class="mobile-drawer-overlay" *ngIf="isMobileMenuOpen" (click)="toggleMobileMenu()"></div>
    <aside class="mobile-drawer" [class.open]="isMobileMenuOpen">
      <div class="mobile-drawer-header">
        <div class="logo-circle drawer-logo-circle">
          <img src="https://i.ibb.co/d4SMQvxj/Whats-App-Image-2026-08-13-at-10-59-05-AM.jpg" alt="Logo" class="drawer-logo" />
        </div>
        <button (click)="toggleMobileMenu()" class="close-btn">&times;</button>
      </div>

      <nav class="mobile-nav-links">
        <a routerLink="/" (click)="toggleMobileMenu()" class="mobile-link">Home</a>
        <a routerLink="/shop" (click)="toggleMobileMenu()" class="mobile-link">Shop Collection</a>
        <a routerLink="/categories" (click)="toggleMobileMenu()" class="mobile-link">Categories</a>
        <a routerLink="/about" (click)="toggleMobileMenu()" class="mobile-link">About Us</a>
        <a routerLink="/contact" (click)="toggleMobileMenu()" class="mobile-link">Contact Us</a>
        
        <div class="mobile-divider"></div>
        
        <ng-container *ngIf="user$ | async; else mobileGuest">
          <a routerLink="/account" (click)="toggleMobileMenu()" class="mobile-link highlight">My Profile & Orders</a>
          <a *ngIf="isAdmin" routerLink="/admin" (click)="toggleMobileMenu()" class="mobile-link admin-link">⚙️ Admin Dashboard</a>
          <button (click)="logout()" class="mobile-link logout-btn">Logout</button>
        </ng-container>
        <ng-template #mobileGuest>
          <a routerLink="/login" (click)="toggleMobileMenu()" class="mobile-link highlight">Login / Register</a>
        </ng-template>
      </nav>

      <div class="mobile-drawer-footer">
        <p>📱 WhatsApp Order Helpline:</p>
        <a href="https://wa.me/918113899319" target="_blank" class="mobile-wa-btn">
          💬 Chat on WhatsApp
        </a>
      </div>
    </aside>
  `,
  styles: [`
    .navbar-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background-color: #FFFFFF;
      border-bottom: 1px solid var(--color-border-light);
      transition: var(--transition);
    }
    .navbar-header.scrolled {
      box-shadow: var(--shadow-sm);
    }
    .navbar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 80px;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo-circle {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 1.5px solid var(--color-gold);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      background-color: #FFFFFF;
      flex-shrink: 0;
    }
    .logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .drawer-logo-circle {
      width: 44px;
      height: 44px;
    }
    .drawer-logo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-name {
      font-family: var(--font-heading);
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: var(--color-text-heading);
      line-height: 1.1;
    }
    .brand-tagline {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 2.5px;
      color: var(--color-gold);
    }

    .desktop-nav {
      display: flex;
      align-items: center;
      gap: 32px;
    }
    .nav-link {
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.5px;
      color: var(--color-text);
      padding: 8px 0;
      position: relative;
    }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background-color: var(--color-pink-dark);
      transition: var(--transition);
    }
    .nav-link:hover::after, .nav-link.active::after {
      width: 100%;
    }
    .nav-link.active {
      color: var(--color-text-heading);
      font-weight: 600;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px;
      color: var(--color-text-heading);
      border-radius: var(--radius-full);
      transition: var(--transition);
      position: relative;
    }
    .action-btn:hover {
      background-color: var(--color-pink-light);
      color: var(--color-pink-dark);
    }
    .nav-label {
      font-size: 13px;
      font-weight: 500;
    }
    .cart-badge {
      position: absolute;
      top: 0;
      right: 0;
      background-color: var(--color-pink-dark);
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 700;
      height: 18px;
      min-width: 18px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
    .admin-badge {
      background-color: var(--color-gold);
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      letter-spacing: 0.5px;
    }

    .search-box {
      display: flex;
      align-items: center;
      position: relative;
    }
    .search-input {
      width: 0;
      padding: 0;
      border: none;
      opacity: 0;
      transition: var(--transition);
      background-color: var(--color-bg-alt);
      border-radius: var(--radius-full);
    }
    .search-box.active .search-input {
      width: 200px;
      padding: 8px 16px;
      opacity: 1;
      border: 1px solid var(--color-border);
    }

    .mobile-toggle {
      display: none;
      color: var(--color-text-heading);
    }

    @media (max-width: 992px) {
      .desktop-nav { display: none; }
      .desktop-only { display: none; }
      .mobile-toggle { display: block; }
    }

    /* Mobile Drawer */
    .mobile-drawer-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 998;
    }
    .mobile-drawer {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 300px;
      background-color: #FFFFFF;
      z-index: 999;
      transform: translateX(-100%);
      transition: transform 0.3s ease-in-out;
      display: flex;
      flex-direction: column;
      padding: 24px;
    }
    .mobile-drawer.open {
      transform: translateX(0);
    }
    .mobile-drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    .close-btn {
      font-size: 28px;
      color: var(--color-muted);
    }
    .mobile-nav-links {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .mobile-link {
      font-size: 16px;
      font-weight: 500;
      color: var(--color-text-heading);
      padding: 8px 0;
    }
    .mobile-link.highlight {
      color: #C05676;
      font-weight: 600;
    }
    .mobile-link.admin-link {
      color: var(--color-gold);
    }
    .mobile-divider {
      height: 1px;
      background-color: var(--color-border-light);
      margin: 12px 0;
    }
    .logout-btn {
      text-align: left;
      color: #D32F2F;
    }
    .mobile-drawer-footer {
      margin-top: auto;
      padding-top: 24px;
      border-top: 1px solid var(--color-border-light);
      font-size: 13px;
    }
    .mobile-wa-btn {
      display: block;
      margin-top: 8px;
      background-color: #25D366;
      color: #FFFFFF;
      text-align: center;
      padding: 10px;
      border-radius: var(--radius-sm);
      font-weight: 600;
    }
  `]
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  isMobileMenuOpen = false;
  isSearchOpen = false;
  searchQuery = '';

  cartSummary$: Observable<CartSummary>;
  user$: Observable<User | null>;
  userProfile$: Observable<UserProfile | null>;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {
    this.cartSummary$ = this.cartService.cartSummary$;
    this.user$ = this.authService.currentUser$;
    this.userProfile$ = this.authService.userProfile$;
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.isScrolled = window.scrollY > 20;
      });
    }
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen && this.searchQuery) {
      this.onSearch();
    }
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/shop'], { queryParams: { search: this.searchQuery.trim() } });
      this.isSearchOpen = false;
    }
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/']);
    this.isMobileMenuOpen = false;
  }
}
