import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';
import { CartSummary } from '../../../core/models/cart.model';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '../../../core/models/user.model';
import { handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../../core/utils/image.utils';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Main Navigation Header -->
    <header class="navbar-header" [class.scrolled]="isScrolled">
      <div class="container navbar-container">
        
        <!-- Left Side: Logo Only -->
        <div class="nav-left">
          <!-- Provided Logo on the LEFT (Clean, visible, aspect ratio preserved) -->
          <a routerLink="/" class="navbar-logo-link" title="Petals Ethnics and Jewellers">
            <picture>
              <source type="image/webp" srcset="/images/logo.webp">
              <img 
                src="https://i.ibb.co/KxVNd9hN/Untitled-design-7-removebg-preview-removebg-preview.png" 
                alt="Petals Ethnics and Jewellers" 
                class="navbar-logo-img"
                width="200"
                height="74"
                fetchpriority="high"
                loading="eager"
                decoding="async"
                (error)="onImageError($event)"
              />
            </picture>
          </a>
        </div>

        <!-- Right Side: Navigation Links & Actions Clustered on the Right -->
        <div class="nav-right-cluster">
          <!-- Desktop Navigation Links: Home | Ethnics | Jewellery | About Us | Contact -->
          <nav class="desktop-nav">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">Home</a>
            <a routerLink="/ethnics" routerLinkActive="active" class="nav-link">Ethnics</a>
            <a routerLink="/jewellery" routerLinkActive="active" class="nav-link">Jewellery</a>
            <a routerLink="/about" routerLinkActive="active" class="nav-link">About Us</a>
            <a routerLink="/contact" routerLinkActive="active" class="nav-link">Contact</a>
          </nav>

          <!-- Navbar Actions: Search | Wishlist | Cart | Menu (Mobile: [Search] [Wishlist] [Cart] [Menu]) -->
          <div class="nav-actions">
            <!-- Desktop Expandable Search Input -->
            <div class="search-box desktop-only" [class.active]="isSearchOpen">
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

            <!-- Mobile Search Trigger Button (Always visible on mobile header) -->
            <button (click)="toggleMobileSearch()" class="action-btn mobile-search-trigger" title="Search" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            <!-- Account Link & Admin Badge -->
            <ng-container *ngIf="user$ | async as user; else guestAuth">
              <a routerLink="/account" class="action-btn user-btn" title="My Account">
                <svg class="user-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span class="nav-label user-nav-label">{{ getCleanUserName(userProfile$ | async) }}</span>
              </a>
              <a *ngIf="isAdmin" routerLink="/admin" class="admin-badge desktop-only" title="Admin Dashboard">Admin</a>
            </ng-container>
            <ng-template #guestAuth>
              <a routerLink="/login" class="action-btn user-btn guest-btn desktop-only" title="Login / Register">
                <svg class="user-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span class="nav-label">Login</span>
              </a>
            </ng-template>

            <!-- Wishlist Button (Always visible on both Desktop & Mobile Header) -->
            <a routerLink="/wishlist" routerLinkActive="active" class="action-btn wishlist-btn" title="My Wishlist" aria-label="Wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span *ngIf="(wishlistCount$ | async) as wCount" class="nav-badge">{{ wCount }}</span>
            </a>

            <!-- Cart Button (Always visible on both Desktop & Mobile Header) -->
            <a routerLink="/cart" routerLinkActive="active" class="action-btn cart-btn" title="Shopping Cart" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span *ngIf="(cartSummary$ | async)?.totalQuantity as count" class="nav-badge">{{ count }}</span>
            </a>

            <!-- Hamburger Menu Toggle Button (Rightmost on Mobile Header; Hidden on Desktop) -->
            <button class="action-btn mobile-menu-toggle" (click)="toggleMobileMenu()" aria-label="Toggle Navigation" title="Menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path *ngIf="!isMobileMenuOpen" d="M3 12h18M3 6h18M3 18h18" stroke-linecap="round" stroke-linejoin="round"/>
                <path *ngIf="isMobileMenuOpen" d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Search Dropdown Overlay (Floats directly below navbar, zero layout shift) -->
      <div *ngIf="isMobileSearchOpen" class="mobile-search-dropdown-wrap">
        <div class="mobile-search-bar">
          <svg class="search-field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search ethnics, sarees, jewellery..." 
            [(ngModel)]="mobileSearchQuery"
            (ngModelChange)="onMobileSearchChange()"
            (keyup.enter)="submitMobileSearch()"
            class="mobile-search-dropdown-input"
            autofocus
          />
          <button *ngIf="mobileSearchQuery" (click)="clearMobileSearch()" class="mobile-search-clear-btn" aria-label="Clear Search">&times;</button>
          <button (click)="closeMobileSearch()" class="mobile-search-cancel-btn">Cancel</button>
        </div>

        <!-- Live matching search suggestions inside dropdown -->
        <div *ngIf="searchSuggestions.length > 0" class="mobile-search-suggestions">
          <a 
            *ngFor="let item of searchSuggestions" 
            [routerLink]="['/product', item.slug]" 
            (click)="selectSuggestion()"
            class="search-suggestion-row"
          >
            <img [src]="item.image || defaultFallback" [alt]="item.name" class="suggestion-thumb" (error)="onImageError($event)" />
            <div class="suggestion-info">
              <span class="suggestion-name">{{ item.name }}</span>
              <span class="suggestion-price">₹{{ item.price | number:'1.0-0' }}</span>
            </div>
            <span class="suggestion-action">&rarr;</span>
          </a>
        </div>
      </div>
    </header>

    <!-- Mobile Search Backdrop Click-Outside -->
    <div *ngIf="isMobileSearchOpen" class="mobile-search-backdrop" (click)="closeMobileSearch()"></div>

    <!-- Mobile Slide Drawer -->
    <div class="mobile-drawer-overlay" *ngIf="isMobileMenuOpen" (click)="toggleMobileMenu()"></div>
    <aside class="mobile-drawer" [class.open]="isMobileMenuOpen">
      <div class="mobile-drawer-header">
        <a routerLink="/" (click)="toggleMobileMenu()" class="drawer-logo-wrap">
          <img 
            src="https://i.ibb.co/KxVNd9hN/Untitled-design-7-removebg-preview-removebg-preview.png" 
            alt="Petals Ethnics and Jewellers" 
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
          <a routerLink="/admin" (click)="toggleMobileMenu()" class="mobile-link admin-link">Admin Dashboard</a>
          <button (click)="logout()" class="mobile-link logout-btn">Logout</button>
        </ng-container>
        <ng-template #mobileGuest>
          <a routerLink="/login" (click)="toggleMobileMenu()" class="mobile-link">Login / Register</a>
          <a routerLink="/admin" (click)="toggleMobileMenu()" class="mobile-link admin-link">Admin</a>
        </ng-template>
      </nav>

      <div class="mobile-drawer-footer">
        <p class="drawer-contact-label">Need styling help?</p>
        <a href="https://wa.me/918113899319" target="_blank" rel="noopener" class="mobile-wa-btn">
          Chat with Stylist on WhatsApp
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
    .navbar-logo-link picture {
      display: contents;
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
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
      width: auto !important;
      height: 40px !important;
      border-radius: 20px !important;
      padding: 0 12px !important;
      flex-shrink: 0;
      color: var(--color-text-heading, #0D0D0D);
      text-decoration: none;
      transition: all 0.2s ease;
      vertical-align: middle;
      border: none;
      background: transparent;
      cursor: pointer;
    }
    .user-btn:hover {
      background-color: rgba(194, 24, 91, 0.08);
      color: var(--color-pink-dark, #C2185B);
    }
    .user-btn.guest-btn {
      padding: 0 10px !important;
    }
    .user-icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      display: block;
    }
    .nav-label {
      font-size: 13px;
      font-weight: 500;
      line-height: 1;
      display: inline-block;
      vertical-align: middle;
    }
    .user-nav-label {
      max-width: 130px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      height: 26px !important;
      background-color: #C5A059;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 600;
      padding: 0 10px;
      border-radius: 20px;
      letter-spacing: 0.5px;
      text-decoration: none;
      margin-left: 2px;
      vertical-align: middle;
      flex-shrink: 0;
    }

    /* Expandable Search Input (Desktop) */
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

    /* Mobile Search Trigger Button */
    .mobile-search-trigger {
      display: none;
    }

    /* Mobile Search Backdrop */
    .mobile-search-backdrop {
      position: fixed;
      inset: 0;
      top: 72px;
      background: rgba(0, 0, 0, 0.4);
      z-index: 99;
      backdrop-filter: blur(2px);
    }

    /* Mobile Search Dropdown Overlay: Positioned absolute directly below navbar, zero push */
    .mobile-search-dropdown-wrap {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #FFFFFF;
      border-bottom: 1px solid var(--color-border-light, #EAE6E1);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
      z-index: 101;
      padding: 12px 16px;
      animation: dropdownSlideDown 0.2s ease-out;
    }
    @keyframes dropdownSlideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .mobile-search-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #F8F6F3;
      border: 1.5px solid #E5E0D8;
      border-radius: 8px;
      padding: 6px 12px;
    }
    .mobile-search-bar:focus-within {
      border-color: var(--color-pink-dark, #C2185B);
      background: #FFFFFF;
    }
    .search-field-icon {
      color: var(--color-muted, #777777);
      flex-shrink: 0;
    }
    .mobile-search-dropdown-input {
      flex: 1;
      min-width: 0;
      background: transparent;
      border: none;
      outline: none;
      font-size: 14px;
      color: #1A1A1A;
      padding: 4px 0;
    }
    .mobile-search-clear-btn {
      background: transparent;
      border: none;
      font-size: 18px;
      color: #888888;
      cursor: pointer;
      padding: 0 4px;
      line-height: 1;
    }
    .mobile-search-cancel-btn {
      background: transparent;
      border: none;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-pink-dark, #C2185B);
      cursor: pointer;
      padding: 0 2px;
      flex-shrink: 0;
    }

    /* Suggestions List inside Dropdown */
    .mobile-search-suggestions {
      margin-top: 10px;
      max-height: 260px;
      overflow-y: auto;
      border-top: 1px solid #EAE6E1;
      padding-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .search-suggestion-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 6px;
      border-radius: 6px;
      text-decoration: none;
      color: #1A1A1A;
      transition: background 0.15s ease;
    }
    .search-suggestion-row:active, .search-suggestion-row:hover {
      background: #FAF8F6;
    }
    .suggestion-thumb {
      width: 38px;
      height: 38px;
      border-radius: 4px;
      object-fit: cover;
      flex-shrink: 0;
      background: #F0EDE8;
    }
    .suggestion-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .suggestion-name {
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #111111;
    }
    .suggestion-price {
      font-size: 12px;
      font-weight: 700;
      color: var(--color-pink-dark, #C2185B);
    }
    .suggestion-action {
      color: #999999;
      font-size: 14px;
    }

    .mobile-menu-toggle {
      display: none;
      color: var(--color-text-heading, #0D0D0D);
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      width: 40px;
      height: 40px;
      align-items: center;
      justify-content: center;
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
        display: none !important;
      }
      .user-btn .user-nav-label {
        display: none !important;
      }
      .user-btn {
        width: 40px !important;
        height: 40px !important;
        padding: 0 !important;
        border-radius: 50% !important;
        justify-content: center !important;
      }
      .mobile-menu-toggle {
        display: flex;
      }
      .mobile-search-trigger {
        display: flex;
      }
      .navbar-container {
        height: 72px;
        padding: 0 16px;
      }
      .nav-right-cluster {
        gap: 0;
      }
      .navbar-logo-img {
        height: 56px;
        max-height: 56px;
        max-width: 220px;
      }
      .nav-actions {
        gap: 4px;
      }
    }

    @media (max-width: 480px) {
      .navbar-container {
        height: 60px;
        padding: 0 12px;
      }
      .navbar-logo-img {
        height: 44px;
        max-height: 46px;
        max-width: 145px;
      }
      .nav-left {
        gap: 0;
      }
      .nav-actions {
        gap: 3px;
      }
      .action-btn, .user-btn {
        width: 36px !important;
        height: 36px !important;
      }
      .nav-badge {
        top: 1px;
        right: 1px;
        min-width: 15px;
        height: 15px;
        font-size: 9px;
        padding: 0 2px;
      }
      .mobile-search-backdrop {
        top: 60px;
      }
    }

    @media (max-width: 360px) {
      .navbar-container {
        height: 56px;
        padding: 0 8px;
      }
      .navbar-logo-img {
        height: 38px;
        max-height: 40px;
        max-width: 125px;
      }
      .nav-actions {
        gap: 2px;
      }
      .action-btn, .user-btn {
        width: 33px !important;
        height: 33px !important;
      }
      .action-btn svg, .user-btn svg {
        width: 18px !important;
        height: 18px !important;
      }
      .nav-badge {
        min-width: 14px;
        height: 14px;
        font-size: 8.5px;
        top: 0;
        right: 0;
      }
      .mobile-search-backdrop {
        top: 56px;
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
  isMobileSearchOpen = false;
  searchQuery = '';
  mobileSearchQuery = '';
  searchSuggestions: Array<{ name: string; slug: string; price: number; image: string | null }> = [];
  defaultFallback = DEFAULT_FALLBACK_IMAGE;

  cartSummary$: Observable<CartSummary>;
  wishlistCount$: Observable<number>;
  user$: Observable<User | null>;
  userProfile$: Observable<UserProfile | null>;

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private productService: ProductService,
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

  getCleanUserName(profile: UserProfile | null): string {
    if (!profile || !profile.name) return 'Account';
    const clean = String(profile.name)
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FAFF}]/gu, '')
      .trim();
    if (!clean) return 'Account';
    return clean.length > 15 ? clean.substring(0, 15) + '…' : clean;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      this.isMobileSearchOpen = false;
    }
  }

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen && this.searchQuery) {
      this.onSearch();
    }
  }

  toggleMobileSearch() {
    this.isMobileSearchOpen = !this.isMobileSearchOpen;
    if (this.isMobileSearchOpen) {
      this.isMobileMenuOpen = false;
      this.mobileSearchQuery = '';
      this.searchSuggestions = [];
    }
  }

  closeMobileSearch() {
    this.isMobileSearchOpen = false;
    this.mobileSearchQuery = '';
    this.searchSuggestions = [];
  }

  clearMobileSearch() {
    this.mobileSearchQuery = '';
    this.searchSuggestions = [];
  }

  onMobileSearchChange() {
    const q = (this.mobileSearchQuery || '').trim().toLowerCase();
    if (q.length < 2) {
      this.searchSuggestions = [];
      return;
    }
    const products = this.productService.getProductsSync() || [];
    this.searchSuggestions = products
      .filter(p => p.name.toLowerCase().includes(q) || (p.category?.name && p.category.name.toLowerCase().includes(q)))
      .slice(0, 5)
      .map(p => {
        const img = p.images && p.images.length > 0 ? p.images[0].image_url : null;
        return {
          name: p.name,
          slug: p.slug,
          price: p.sale_price || p.price,
          image: img
        };
      });
  }

  submitMobileSearch() {
    if (this.mobileSearchQuery.trim()) {
      this.router.navigate(['/ethnics'], { queryParams: { search: this.mobileSearchQuery.trim() } });
      this.closeMobileSearch();
    }
  }

  selectSuggestion() {
    this.closeMobileSearch();
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
