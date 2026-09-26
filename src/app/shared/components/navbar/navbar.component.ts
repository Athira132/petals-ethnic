import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartSummary } from '../../../core/models/cart.model';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '../../../core/models/user.model';
import { handleImageError } from '../../../core/utils/image.utils';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Main Navigation Header -->
    <header class="navbar-header" [class.scrolled]="isScrolled">
      <div class="container navbar-container">
        
        <!-- Left Side: Mobile Toggle + Logo Only (No text) -->
        <div class="nav-left">
          <!-- Mobile Menu Toggle Button (Left on Mobile) -->
          <button class="mobile-toggle" (click)="toggleMobileMenu()" aria-label="Toggle Navigation">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path *ngIf="!isMobileMenuOpen" d="M3 12h18M3 6h18M3 18h18" stroke-linecap="round" stroke-linejoin="round"/>
              <path *ngIf="isMobileMenuOpen" d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <!-- Provided Logo on the LEFT (Clean, large, aspect ratio preserved) -->
          <a routerLink="/" class="navbar-logo-link" title="Petals Ethnics & Jewellers">
            <img 
              src="https://i.ibb.co/KxVNd9hN/Untitled-design-7-removebg-preview-removebg-preview.png" 
              alt="Petals Ethnics & Jewellers" 
              class="navbar-logo-img"
              (error)="onImageError($event)"
            />
          </a>
        </div>

        <!-- Right Side: All Navigation Links & Actions Clustered on the Right -->
        <div class="nav-right-cluster">
          <!-- Desktop Navigation Links: Home | Ethnics | Jewellery | About Us | Contact -->
          <nav class="desktop-nav">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">Home</a>
            <a routerLink="/ethnics" routerLinkActive="active" class="nav-link">Ethnics</a>
            <a routerLink="/jewellery" routerLinkActive="active" class="nav-link">Jewellery</a>
            <a routerLink="/about" routerLinkActive="active" class="nav-link">About Us</a>
            <a routerLink="/contact" routerLinkActive="active" class="nav-link">Contact</a>
          </nav>

          <!-- Navbar Actions: Search | Account/Admin | Wishlist | Cart -->
          <div class="nav-actions">
            <!-- Search Bar Trigger -->
            <div class="search-box" [class.active]="isSearchOpen">
              <input 
                type="text" 
                placeholder="Search ethnics, jewellery..." 
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

            <!-- Wishlist Button (Beside Cart) -->
            <a routerLink="/wishlist" routerLinkActive="active" class="action-btn wishlist-btn" title="My Wishlist">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span *ngIf="(wishlistCount$ | async) as wCount" class="nav-badge">{{ wCount }}</span>
            </a>

            <!-- Cart Button -->
            <a routerLink="/cart" routerLinkActive="active" class="action-btn cart-btn" title="Shopping Cart">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span *ngIf="(cartSummary$ | async)?.totalQuantity as count" class="nav-badge">{{ count }}</span>
            </a>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile Slide Drawer -->
    <div class="mobile-drawer-overlay" *ngIf="isMobileMenuOpen" (click)="toggleMobileMenu()"></div>
    <aside class="mobile-drawer" [class.open]="isMobileMenuOpen">
      <div class="mobile-drawer-header">
        <a routerLink="/" (click)="toggleMobileMenu()" class="drawer-logo-wrap">
          <img 
            src="https://i.ibb.co/KxVNd9hN/Untitled-design-7-removebg-preview-removebg-preview.png" 
            alt="Petals Ethnics & Jewellers" 
            class="drawer-logo-img"
            (error)="onImageError($event)"
          />
        </a>
        <button (click)="toggleMobileMenu()" class="close-btn" aria-label="Close Menu">&times;</button>
      </div>

      <!-- Mobile Navigation Links: Home, Ethnics, Jewellery, About Us, Contact, Wishlist, Cart, Account -->
      <nav class="mobile-nav-links">
        <a routerLink="/" (click)="toggleMobileMenu()" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="mobile-link">Home</a>
        <a routerLink="/ethnics" (click)="toggleMobileMenu()" routerLinkActive="active" class="mobile-link">Ethnics</a>
        <a routerLink="/jewellery" (click)="toggleMobileMenu()" routerLinkActive="active" class="mobile-link">Jewellery</a>
        <a routerLink="/about" (click)="toggleMobileMenu()" routerLinkActive="active" class="mobile-link">About Us</a>
        <a routerLink="/contact" (click)="toggleMobileMenu()" routerLinkActive="active" class="mobile-link">Contact</a>
        
        <div class="mobile-divider"></div>

        <!-- Wishlist link in mobile drawer with live badge -->
        <a routerLink="/wishlist" (click)="toggleMobileMenu()" routerLinkActive="active" class="mobile-link">
          <span>Wishlist</span>
          <span *ngIf="(wishlistCount$ | async) as wCount" class="drawer-badge">{{ wCount }}</span>
        </a>

        <!-- Cart link in mobile drawer with live badge -->
        <a routerLink="/cart" (click)="toggleMobileMenu()" routerLinkActive="active" class="mobile-link">
          <span>Shopping Cart</span>
          <span *ngIf="(cartSummary$ | async)?.totalQuantity as count" class="drawer-badge">{{ count }}</span>
        </a>
        
        <div class="mobile-divider"></div>
        
        <ng-container *ngIf="user$ | async; else mobileGuest">
          <a routerLink="/account" (click)="toggleMobileMenu()" class="mobile-link highlight">My Profile & Orders</a>
          <a *ngIf="isAdmin" routerLink="/admin" (click)="toggleMobileMenu()" class="mobile-link admin-link">Admin Dashboard</a>
          <button (click)="logout()" class="mobile-link logout-btn">Logout</button>
        </ng-container>
        <ng-template #mobileGuest>
          <a routerLink="/login" (click)="toggleMobileMenu()" class="mobile-link highlight">Login / Register</a>
        </ng-template>
      </nav>

      <div class="mobile-drawer-footer">
        <p class="drawer-contact-label">WhatsApp Helpline:</p>
        <a href="https://wa.me/918113899319?text=Hello%20Petal%20Ethnics%20%26%20Jewellers,%20I%20would%20like%20to%20know%20more%20about%20your%20collection." target="_blank" class="mobile-wa-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.333 5.001l-1.416 5.174 5.299-1.389c1.464.798 3.114 1.218 4.774 1.218h.004c5.506 0 9.989-4.478 9.99-9.984 0-2.669-1.038-5.176-2.925-7.062-1.887-1.886-4.394-2.924-7.064-2.924zm5.82 14.281c-.244.687-1.42 1.312-1.957 1.393-.49.074-1.127.106-1.815-.115-.418-.134-.956-.31-1.657-.615-2.955-1.282-4.887-4.281-5.035-4.479-.148-.198-1.205-1.604-1.205-3.059 0-1.455.762-2.172 1.033-2.464.271-.292.593-.365.791-.365.198 0 .396.002.568.01.185.009.432-.07.676.516.244.587.834 2.036.907 2.184.073.148.122.321.024.516-.098.196-.148.318-.293.49-.148.171-.31.382-.443.513-.148.148-.303.31-.131.606.171.296.76 1.256 1.632 2.033 1.123.999 2.07 1.309 2.366 1.457.296.148.469.124.642-.074.173-.198.742-.865.94-1.162.198-.296.396-.247.668-.148.271.098 1.727.815 2.023.963.296.148.494.222.568.346.074.123.074.715-.17 1.402z"/>
          </svg>
          <span>Chat on WhatsApp</span>
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
      border-bottom: 1px solid var(--color-border-light, #EAE6E1);
      transition: all 0.3s ease;
    }
    .navbar-header.scrolled {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
    }
    .navbar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 88px;
    }

    /* Left Side: Mobile Toggle + Logo */
    .nav-left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }
    .navbar-logo-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      flex-shrink: 0;
    }
    .navbar-logo-img {
      height: 74px;
      width: auto;
      max-height: 74px;
      max-width: 290px;
      object-fit: contain;
      display: block;
      transition: transform 0.2s ease;
    }
    .navbar-logo-link:hover .navbar-logo-img {
      transform: scale(1.02);
    }

    /* Right Side: All Links and Actions Clustered on the Right */
    .nav-right-cluster {
      display: flex;
      align-items: center;
      gap: 28px;
      margin-left: auto;
    }

    .desktop-nav {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .nav-link {
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.5px;
      color: var(--color-text, #1A1A1A);
      padding: 8px 0;
      position: relative;
      text-decoration: none;
      transition: color 0.2s ease;
      white-space: nowrap;
    }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background-color: var(--color-pink-dark, #C2185B);
      transition: all 0.25s ease;
    }
    .nav-link:hover::after, .nav-link.active::after {
      width: 100%;
    }
    .nav-link.active {
      color: var(--color-pink-dark, #C2185B);
      font-weight: 600;
    }

    /* Navbar Action Buttons (Search, Account, Wishlist, Cart) */
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 40px;
      height: 40px;
      color: var(--color-text-heading, #0D0D0D);
      border-radius: 50%;
      transition: all 0.2s ease;
      position: relative;
      background: transparent;
      border: none;
      cursor: pointer;
      text-decoration: none;
    }
    .action-btn:hover {
      background-color: rgba(194, 24, 91, 0.08);
      color: var(--color-pink-dark, #C2185B);
    }
    .action-btn.active {
      color: var(--color-pink-dark, #C2185B);
      background-color: rgba(194, 24, 91, 0.08);
    }
    .user-btn {
      width: auto;
      border-radius: 20px;
      padding: 0 10px;
    }
    .nav-label {
      font-size: 13px;
      font-weight: 500;
    }

    /* Notification Badges for Cart & Wishlist */
    .nav-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      background-color: var(--color-pink-dark, #C2185B);
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 700;
      min-width: 17px;
      height: 17px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 3px;
      line-height: 1;
    }

    .admin-badge {
      background-color: #C5A059;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
      letter-spacing: 0.5px;
      text-decoration: none;
      margin-left: 2px;
    }

    /* Expandable Search Input */
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
      transition: all 0.3s ease;
      background-color: var(--color-bg-alt, #FAF8F6);
      border-radius: 20px;
      font-size: 13px;
    }
    .search-box.active .search-input {
      width: 180px;
      padding: 7px 14px;
      opacity: 1;
      border: 1px solid var(--color-border, #EAE6E1);
    }

    .mobile-toggle {
      display: none;
      color: var(--color-text-heading, #0D0D0D);
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
    }
    .desktop-only {
      display: inline-block;
    }

    /* Responsive Queries */
    @media (max-width: 992px) {
      .desktop-nav {
        display: none;
      }
      .desktop-only {
        display: none;
      }
      .mobile-toggle {
        display: block;
      }
      .navbar-container {
        height: 80px;
      }
      .nav-right-cluster {
        gap: 0;
      }
      .navbar-logo-img {
        height: 64px;
        max-height: 64px;
        max-width: 240px;
      }
    }

    @media (max-width: 480px) {
      .navbar-container {
        height: 72px;
        padding: 0 12px;
      }
      .navbar-logo-img {
        height: 52px;
        max-height: 52px;
        max-width: 195px;
      }
      .nav-left {
        gap: 8px;
      }
      .nav-actions {
        gap: 2px;
      }
      .action-btn {
        width: 36px;
        height: 36px;
      }
      .search-box.active .search-input {
        width: 125px;
        font-size: 12px;
      }
    }

    /* Mobile Drawer */
    .mobile-drawer-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 998;
      backdrop-filter: blur(2px);
    }
    .mobile-drawer {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 290px;
      background-color: #FFFFFF;
      z-index: 999;
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      padding: 24px;
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
    }
    .mobile-drawer.open {
      transform: translateX(0);
    }
    .mobile-drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--color-border-light, #EAE6E1);
    }
    .drawer-logo-wrap {
      display: flex;
      align-items: center;
    }
    .drawer-logo-img {
      height: 58px;
      max-height: 58px;
      width: auto;
      max-width: 220px;
      object-fit: contain;
    }
    .close-btn {
      font-size: 28px;
      color: var(--color-muted, #666666);
      background: transparent;
      border: none;
      cursor: pointer;
      line-height: 1;
      padding: 0 4px;
    }

    .mobile-nav-links {
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
    }
    .mobile-link {
      font-size: 15px;
      font-weight: 500;
      color: var(--color-text-heading, #0D0D0D);
      padding: 10px 8px;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 10px;
      border-radius: 6px;
      transition: background 0.15s;
    }
    .mobile-link:hover, .mobile-link.active {
      background: #FDF4F6;
      color: var(--color-pink-dark, #C2185B);
    }
    .mobile-link.highlight {
      color: var(--color-pink-dark, #C2185B);
      font-weight: 600;
    }
    .mobile-link.admin-link {
      color: #C5A059;
    }
    .nav-pill-icon {
      font-size: 16px;
      width: 22px;
      text-align: center;
    }
    .drawer-badge {
      margin-left: auto;
      background-color: var(--color-pink-dark, #C2185B);
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 10px;
      line-height: 1.2;
    }
    .mobile-divider {
      height: 1px;
      background-color: var(--color-border-light, #EAE6E1);
      margin: 8px 0;
    }
    .logout-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      width: 100%;
      text-align: left;
    }

    .mobile-drawer-footer {
      margin-top: auto;
      padding-top: 20px;
      border-top: 1px solid var(--color-border-light, #EAE6E1);
      font-size: 13px;
    }
    .drawer-contact-label {
      color: var(--color-muted, #666666);
      margin-bottom: 8px;
      font-size: 12px;
    }
    .mobile-wa-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: #25D366;
      color: #FFFFFF;
      text-align: center;
      padding: 10px;
      border-radius: 4px;
      font-weight: 600;
      text-decoration: none;
      font-size: 13px;
    }
  `]
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  isMobileMenuOpen = false;
  isSearchOpen = false;
  searchQuery = '';

  cartSummary$: Observable<CartSummary>;
  wishlistCount$: Observable<number>;
  user$: Observable<User | null>;
  userProfile$: Observable<UserProfile | null>;

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private router: Router
  ) {
    this.cartSummary$ = this.cartService.cartSummary$;
    this.wishlistCount$ = this.wishlistService.wishlist$.pipe(
      map(items => items.length)
    );
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
      this.router.navigate(['/ethnics'], { queryParams: { search: this.searchQuery.trim() } });
      this.isSearchOpen = false;
    }
  }

  onImageError(event: Event) {
    handleImageError(event);
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/']);
    this.isMobileMenuOpen = false;
  }
}
