import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeroCarouselComponent } from '../../shared/components/hero-carousel/hero-carousel.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product, SizeOption } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { handleImageError, getResponsiveImageUrl } from '../../core/utils/image.utils';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeroCarouselComponent, ProductCardComponent],
  template: `
    <main class="home-page">
      <!-- 1. Hero Fashion Showcase (Edge-to-edge, maximum brightness, horizontal buttons) -->
      <app-hero-carousel></app-hero-carousel>

      <!-- 2. Explore Categories (Uniform Circular Images) -->
      <section class="explore-categories-section">
        <div class="container">
          <div class="explore-cat-header">
            <div class="explore-cat-titles">
              <span class="explore-cat-subtitle">CURATED COLLECTIONS</span>
              <h2 class="explore-cat-title">Explore Categories</h2>
            </div>
            <a routerLink="/categories" class="explore-more-link">
              View All Categories &rarr;
            </a>
          </div>

          <div class="category-scroll-container">
            <div class="category-circles-track">
              <a 
                *ngFor="let cat of displayedCategories; trackBy: trackByCategoryId" 
                [routerLink]="[(cat.department || 'ethnic') === 'jewellery' ? '/jewellery' : '/ethnics']" 
                [queryParams]="{category: cat.slug}"
                class="category-circle-card"
                [title]="cat.name"
              >
                <div class="category-circle-avatar">
                  <img 
                    [src]="getCategoryCover(cat)" 
                    [alt]="cat.name" 
                    class="circle-img"
                    loading="lazy"
                    (error)="onImageError($event)"
                  />
                </div>
                <span class="category-circle-label">{{ cat.name }}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. New Arrivals (Products Priority) -->
      <section class="section new-arrivals-section">
        <div class="container">
          <div class="new-arrivals-header">
            <div class="new-arrivals-title-wrap">
              <span class="section-subtitle">JUST DROPPED</span>
              <h2 class="section-title">New Arrivals</h2>
            </div>
            <a routerLink="/ethnics" [queryParams]="{filter: 'new'}" class="btn-new-arrivals">View New Arrivals &rarr;</a>
          </div>

          <div *ngIf="!isHomeLoading; else loadingState">
            <div class="product-grid" *ngIf="newArrivals.length > 0; else emptyArrivals">
              <app-product-card 
                *ngFor="let prod of newArrivals; let i = index; trackBy: trackByProductId" 
                [product]="prod"
                [priority]="i < 4"
                (quickAdd)="onQuickAdd($event)"
              ></app-product-card>
            </div>
            <ng-template #emptyArrivals>
              <p class="text-center text-muted py-4">No new arrival products available at the moment.</p>
            </ng-template>
          </div>
        </div>
      </section>

      <!-- 4. Featured & Best Sellers -->
      <section class="section featured-section">
        <div class="container">
          <div class="section-header text-center">
            <span class="section-subtitle">MOST LOVED</span>
            <h2 class="section-title">Featured & Best Sellers</h2>
            <p class="section-desc">Our customers' absolute favorite ethnic styles of the season.</p>
          </div>

          <div *ngIf="!isHomeLoading; else loadingState">
            <div class="product-grid" *ngIf="featuredProducts.length > 0; else emptyFeatured">
              <app-product-card 
                *ngFor="let prod of featuredProducts; let i = index; trackBy: trackByProductId" 
                [product]="prod"
                [priority]="i < 4"
                (quickAdd)="onQuickAdd($event)"
              ></app-product-card>
            </div>
            <ng-template #emptyFeatured>
              <p class="text-center text-muted py-4">No featured products available at the moment.</p>
            </ng-template>
          </div>
        </div>
      </section>

      <!-- 5. Editorial Two-Column Photo + Text "Our Story" Section -->
      <section class="section story-editorial-section">
        <div class="container">
          <div class="story-grid">
            <!-- Left Side: Large High Quality Image -->
            <div class="story-image-col">
              <div class="story-image-frame">
                <img 
                  [src]="getOptimizedUrl('https://i.ibb.co/7d3T6dxp/Whats-App-Image-2026-08-13-at-12-31-11-PM-1.jpg', 600)" 
                  alt="Petal Ethnics & Jewellers Craftsmanship" 
                  class="story-img" 
                  loading="lazy"
                  (error)="onImageError($event)"
                />
                <div class="story-badge-floating">
                  <span>HANDWORKED ELEGANCE</span>
                </div>
              </div>
            </div>

            <!-- Right Side: Content -->
            <div class="story-content-col">
              <span class="section-subtitle">OUR HERITAGE</span>
              <h2 class="story-title">Crafting Timeless Ethnic Elegance & Exquisite Jewellery</h2>
              <p class="story-paragraph">
                At Petal Ethnics & Jewellers, every creation is a homage to rich Indian textiles, intricate craftsmanship, and curated jewellery designs. Based in Kerala, we hand-curate premium silk sarees, festive Anarkalis, floral kurtis, co-ord sets, and statement jewellery designed to make every occasion memorable.
              </p>
              <p class="story-paragraph">
                We believe ethnic wear and jewellery should feel effortless, luxurious, and deeply authentic. Experience fabrics that breathe and jewels that shine.
              </p>
              <div class="story-action">
                <a routerLink="/about" class="btn-story-primary">
                  Discover Our Story &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. Instagram Showcase -->
      <section class="section instagram-section">
        <div class="container text-center">
          <span class="section-subtitle">FOLLOW OUR JOURNEY</span>
          <h2 class="section-title">&#64;petalsethnic on Instagram</h2>
          <p class="section-desc">Tag us in your festive moments to be featured on our official page.</p>
          
          <div class="instagram-grid">
            <a href="https://www.instagram.com/petalsethnic" target="_blank" class="insta-item">
              <img [src]="getOptimizedUrl('https://i.ibb.co/7tQbhHpZ/Whats-App-Image-2026-08-13-at-12-31-11-PM-2.jpg', 300)" alt="Petal Ethnics & Jewellers Instagram" loading="lazy" (error)="onImageError($event)" />
              <div class="insta-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </div>
            </a>
            <a href="https://www.instagram.com/petalsethnic" target="_blank" class="insta-item">
              <img [src]="getOptimizedUrl('https://i.ibb.co/7N2bJC2X/Whats-App-Image-2026-08-13-at-12-31-10-PM-1.jpg', 300)" alt="Petals Ethnic Instagram" loading="lazy" (error)="onImageError($event)" />
              <div class="insta-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </div>
            </a>
            <a href="https://www.instagram.com/petalsethnic" target="_blank" class="insta-item">
              <img [src]="getOptimizedUrl('https://i.ibb.co/7d3T6dxp/Whats-App-Image-2026-08-13-at-12-31-11-PM-1.jpg', 300)" alt="Petals Ethnic Instagram" loading="lazy" (error)="onImageError($event)" />
              <div class="insta-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </div>
            </a>
            <a href="https://www.instagram.com/petalsethnic" target="_blank" class="insta-item">
              <img [src]="getOptimizedUrl('https://i.ibb.co/G4bg5wKQ/379a42c6-1c91-404e-8fb6-d04a4689c4a2.png', 300)" alt="Petals Ethnic Instagram" loading="lazy" (error)="onImageError($event)" />
              <div class="insta-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </div>
            </a>
          </div>
        </div>
      </section>

      <!-- 7. Need Help / WhatsApp Section -->
      <section class="section wa-help-section">
        <div class="container">
          <div class="wa-cta-box">
            <h2>Need Personal Styling or Custom Sizes?</h2>
            <p>Our ethnic fashion specialists are available on WhatsApp to assist with size guidance, custom fitting, and order inquiries.</p>
            <a href="https://wa.me/918113899319" target="_blank" class="btn-wa">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <!-- Reusable Loading State Template -->
      <ng-template #loadingState>
        <div class="loading-spinner-box">
          <div class="spinner"></div>
          <p>Loading Ethnic Collection...</p>
        </div>
      </ng-template>
    </main>
  `,
  styles: [`
    .home-page {
      background-color: var(--color-bg);
      overflow-x: hidden;
    }
    
    .section {
      padding: 56px 0;
    }
    @media (max-width: 768px) {
      .section { padding: 36px 0; }
    }
    @media (max-width: 480px) {
      .section { padding: 28px 0; }
    }

    .section-header {
      margin-bottom: 36px;
    }
    @media (max-width: 768px) {
      .section-header { margin-bottom: 24px; }
    }

    .section-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 32px;
    }
    @media (max-width: 576px) {
      .section-header-flex {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 20px;
      }
    }

    .section-subtitle {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--color-gold);
      display: block;
      margin-bottom: 6px;
    }
    .section-title {
      font-size: 32px;
      font-weight: 700;
      color: var(--color-text-heading);
    }
    @media (max-width: 768px) {
      .section-title { font-size: 24px; }
      .section-subtitle { font-size: 11px; }
    }
    .section-desc {
      font-size: 15px;
      color: var(--color-muted);
      margin-top: 6px;
    }
    @media (max-width: 480px) {
      .section-desc { font-size: 13.5px; }
    }

    /* 2. Explore Categories (Uniform Circular Images) */
    .explore-categories-section {
      padding: 30px 0 24px 0;
      background-color: #FFFFFF;
      border-bottom: 1px solid var(--color-border-light);
    }

    .explore-cat-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 20px;
    }
    .explore-cat-subtitle {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--color-gold);
      display: block;
      margin-bottom: 4px;
    }
    .explore-cat-title {
      font-size: 22px;
      font-weight: 700;
      color: var(--color-text-heading);
      margin: 0;
    }
    .explore-more-link {
      font-size: 13px;
      font-weight: 600;
      color: #9F3D62;
      text-decoration: none;
      transition: var(--transition);
      white-space: nowrap;
    }
    .explore-more-link:hover {
      color: #7F2A4C;
      text-decoration: underline;
    }

    .category-scroll-container {
      width: 100%;
      overflow-x: auto;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      padding: 4px 0 8px 0;
    }
    .category-scroll-container::-webkit-scrollbar {
      display: none;
    }

    .category-circles-track {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      gap: 28px;
    }
    @media (max-width: 992px) {
      .category-circles-track {
        justify-content: flex-start;
        gap: 20px;
      }
    }

    .category-circle-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      cursor: pointer;
      flex-shrink: 0;
      width: 88px;
      transition: transform 0.25s ease;
      scroll-snap-align: start;
    }
    .category-circle-card:hover {
      transform: translateY(-4px);
    }

    .category-circle-avatar {
      width: 84px;
      height: 84px;
      border-radius: 50%;
      overflow: hidden;
      position: relative;
      background: #F8F5F2;
      border: 2px solid #E8E2DC;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .category-circle-card:hover .category-circle-avatar {
      border-color: #9F3D62;
      box-shadow: 0 6px 18px rgba(159, 61, 98, 0.22);
    }
    .circle-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 25%;
      border-radius: 50%;
      display: block;
      transition: transform 0.35s ease;
    }
    .category-circle-card:hover .circle-img {
      transform: scale(1.08);
    }

    .category-circle-label {
      margin-top: 10px;
      font-size: 13px;
      font-weight: 600;
      color: #2D2D2D;
      text-align: center;
      line-height: 1.25;
      white-space: nowrap;
      transition: color 0.2s ease;
    }
    .category-circle-card:hover .category-circle-label {
      color: #9F3D62;
    }

    @media (max-width: 576px) {
      .explore-categories-section {
        padding: 18px 0 14px 0;
      }
      .explore-cat-header {
        margin-bottom: 12px;
      }
      .explore-cat-subtitle {
        font-size: 10px;
        letter-spacing: 1.5px;
      }
      .explore-cat-title {
        font-size: 18px;
      }
      .explore-more-link {
        font-size: 11.5px;
      }
      .category-circles-track {
        gap: 14px;
      }
      .category-circle-card {
        width: 70px;
      }
      .category-circle-avatar {
        width: 68px;
        height: 68px;
        border-width: 1.5px;
      }
      .category-circle-label {
        font-size: 11px;
        margin-top: 6px;
      }
    }

    /* 3. New Arrivals Header (Mobile same row requirement) */
    .new-arrivals-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
      gap: 16px;
      width: 100%;
    }
    .new-arrivals-title-wrap {
      flex: 1;
      min-width: 0;
    }
    .btn-new-arrivals {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 9px 18px;
      border: 1.5px solid #9F3D62;
      color: #9F3D62;
      background: transparent;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      flex-shrink: 0;
      text-decoration: none;
      transition: all 0.25s ease;
    }
    .btn-new-arrivals:hover {
      background: #9F3D62;
      color: #FFFFFF;
      box-shadow: 0 4px 12px rgba(159, 61, 98, 0.25);
    }
    @media (max-width: 576px) {
      .new-arrivals-header {
        flex-direction: row !important;
        align-items: center !important;
        justify-content: space-between !important;
        margin-bottom: 16px;
        gap: 10px;
      }
      .new-arrivals-title-wrap .section-subtitle {
        font-size: 10px;
        letter-spacing: 1.5px;
        margin-bottom: 2px;
      }
      .new-arrivals-title-wrap .section-title {
        font-size: 20px;
        line-height: 1.15;
        white-space: nowrap;
      }
      .btn-new-arrivals {
        padding: 6px 11px;
        font-size: 11px;
        letter-spacing: 0.3px;
        flex-shrink: 0;
        border-width: 1.5px;
      }
    }
    @media (max-width: 380px) {
      .new-arrivals-title-wrap .section-title {
        font-size: 17px;
      }
      .btn-new-arrivals {
        padding: 5px 8px;
        font-size: 10px;
      }
    }

    /* Product Grid */
    .product-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
    @media (max-width: 1100px) {
      .product-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 768px) {
      .product-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
    }
    @media (max-width: 480px) {
      .product-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    }

    /* Editorial Story Section */
    .story-editorial-section {
      background-color: #FAF8F6;
      border-top: 1px solid var(--color-border-light);
      border-bottom: 1px solid var(--color-border-light);
    }
    .story-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      align-items: center;
    }
    @media (max-width: 992px) {
      .story-grid {
        grid-template-columns: 1fr;
        gap: 28px;
      }
    }
    .story-image-col {
      width: 100%;
    }
    .story-image-frame {
      position: relative;
      width: 100%;
      padding-top: 100%;
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-lg);
    }
    @media (max-width: 768px) {
      .story-image-frame {
        padding-top: 60%;
        max-height: 280px;
        border-radius: 12px;
      }
    }
    .story-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
      transition: transform 0.5s ease;
    }
    .story-image-frame:hover .story-img {
      transform: scale(1.03);
    }
    .story-badge-floating {
      position: absolute;
      bottom: 20px;
      left: 20px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      padding: 8px 16px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #9F3D62;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }
    @media (max-width: 480px) {
      .story-badge-floating {
        bottom: 12px;
        left: 12px;
        padding: 6px 12px;
        font-size: 9.5px;
      }
    }

    .story-content-col {
      padding-right: 20px;
    }
    @media (max-width: 992px) {
      .story-content-col { padding-right: 0; }
    }
    .story-title {
      font-size: 34px;
      font-weight: 700;
      line-height: 1.25;
      margin-bottom: 18px;
      color: var(--color-text-heading);
    }
    @media (max-width: 768px) {
      .story-title { font-size: 22px; margin-bottom: 12px; }
    }
    .story-paragraph {
      font-size: 15px;
      line-height: 1.7;
      color: var(--color-muted);
      margin-bottom: 14px;
    }
    @media (max-width: 480px) {
      .story-paragraph { font-size: 13.5px; line-height: 1.6; }
    }
    .story-action {
      margin-top: 24px;
    }
    @media (max-width: 480px) {
      .story-action { margin-top: 16px; }
    }
    .btn-story-primary {
      display: inline-flex;
      align-items: center;
      background-color: #9F3D62;
      color: #FFFFFF !important;
      padding: 13px 30px;
      border-radius: var(--radius-full);
      font-weight: 600;
      font-size: 14px;
      text-decoration: none;
      transition: var(--transition);
      box-shadow: 0 4px 16px rgba(159, 61, 98, 0.4);
    }
    .btn-story-primary:hover {
      background-color: #7F2A4C;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(127, 42, 76, 0.5);
    }
    @media (max-width: 480px) {
      .btn-story-primary {
        padding: 11px 22px;
        font-size: 13px;
        width: 100%;
        justify-content: center;
      }
    }

    /* Instagram Section */
    .instagram-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-top: 32px;
    }
    @media (max-width: 768px) {
      .instagram-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 20px; }
    }
    .insta-item {
      position: relative;
      padding-top: 100%;
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .insta-item img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    .insta-overlay {
      position: absolute;
      inset: 0;
      background: rgba(159, 61, 98, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .insta-item:hover img { transform: scale(1.08); }
    .insta-item:hover .insta-overlay { opacity: 1; }

    /* WhatsApp Section */
    .wa-cta-box {
      background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%);
      color: #FFFFFF;
      padding: 56px 32px;
      border-radius: var(--radius-lg);
      text-align: center;
    }
    .wa-cta-box h2 {
      font-size: 30px;
      color: #FFFFFF;
      margin-bottom: 12px;
    }
    .wa-cta-box p {
      font-size: 15px;
      color: #CCCCCC;
      max-width: 600px;
      margin: 0 auto 28px auto;
    }
    .btn-wa {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background-color: #25D366;
      color: #FFFFFF;
      padding: 15px 34px;
      border-radius: var(--radius-full);
      font-weight: 600;
      font-size: 15px;
      transition: var(--transition);
      box-shadow: 0 4px 16px rgba(37, 211, 102, 0.4);
    }
    .btn-wa:hover {
      background-color: #1EBE57;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(37, 211, 102, 0.5);
    }
    @media (max-width: 768px) {
      .wa-cta-box {
        padding: 36px 20px;
      }
      .wa-cta-box h2 {
        font-size: 22px;
      }
      .wa-cta-box p {
        font-size: 13.5px;
        margin-bottom: 22px;
      }
    }
    @media (max-width: 480px) {
      .wa-cta-box {
        padding: 28px 14px;
        border-radius: 12px;
      }
      .wa-cta-box h2 {
        font-size: 19px;
      }
      .wa-cta-box p {
        font-size: 13px;
        margin-bottom: 18px;
      }
      .btn-wa {
        width: 100%;
        justify-content: center;
        padding: 13px 20px;
        font-size: 14px;
      }
    }

    /* Loading Spinner */
    .loading-spinner-box {
      padding: 80px 0;
      text-align: center;
      color: var(--color-muted);
    }
    .spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto 16px auto;
      border: 3px solid var(--color-pink-light);
      border-top-color: var(--color-pink-dark);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class HomeComponent implements OnInit {
  isHomeLoading: boolean = true;
  categories: Category[] = [];
  newArrivals: Product[] = [];
  featuredProducts: Product[] = [];

  readonly defaultEthnicImage = 'https://i.ibb.co/TD42QpNd/Chat-GPT-Image-Aug-13-2026-12-50-56-PM.png';
  readonly defaultJewelleryImage = 'https://i.ibb.co/0yhmLfnt/Chat-GPT-Image-Aug-13-2026-11-59-23-AM.png';

  readonly defaultCategories: Category[] = [
    {
      id: 'cat-kurtis',
      name: 'Kurtis',
      slug: 'kurtis',
      department: 'ethnic',
      active: true,
      image_url: 'https://i.ibb.co/7d3T6dxp/Whats-App-Image-2026-08-13-at-12-31-11-PM-1.jpg'
    },
    {
      id: 'cat-anarkali',
      name: 'Anarkalis',
      slug: 'anarkali',
      department: 'ethnic',
      active: true,
      image_url: 'https://i.ibb.co/7tQbhHpZ/Whats-App-Image-2026-08-13-at-12-31-11-PM-2.jpg'
    },
    {
      id: 'cat-sarees',
      name: 'Sarees',
      slug: 'sarees',
      department: 'ethnic',
      active: true,
      image_url: 'https://i.ibb.co/7N2bJC2X/Whats-App-Image-2026-08-13-at-12-31-10-PM-1.jpg'
    },
    {
      id: 'cat-coord',
      name: 'Co-ord Sets',
      slug: 'coord-sets',
      department: 'ethnic',
      active: true,
      image_url: 'https://i.ibb.co/G4bg5wKQ/379a42c6-1c91-404e-8fb6-d04a4689c4a2.png'
    },
    {
      id: 'cat-dresses',
      name: 'Midi Dresses',
      slug: 'midi-dress',
      department: 'ethnic',
      active: true,
      image_url: 'https://i.ibb.co/TD42QpNd/Chat-GPT-Image-Aug-13-2026-12-50-56-PM.png'
    },
    {
      id: 'cat-necklaces',
      name: 'Necklaces',
      slug: 'necklaces',
      department: 'jewellery',
      active: true,
      image_url: 'https://i.ibb.co/0yhmLfnt/Chat-GPT-Image-Aug-13-2026-11-59-23-AM.png'
    },
    {
      id: 'cat-earrings',
      name: 'Earrings',
      slug: 'earrings',
      department: 'jewellery',
      active: true,
      image_url: 'https://i.ibb.co/0yhmLfnt/Chat-GPT-Image-Aug-13-2026-11-59-23-AM.png'
    },
    {
      id: 'cat-bangles',
      name: 'Bangles',
      slug: 'bangles',
      department: 'jewellery',
      active: true,
      image_url: 'https://i.ibb.co/0yhmLfnt/Chat-GPT-Image-Aug-13-2026-11-59-23-AM.png'
    }
  ];

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    // 1. Instant paint from sync/session cache if already available (0ms!)
    const syncCats = this.productService.getCachedCategoriesSync();
    if (syncCats && syncCats.length > 0) {
      this.categories = syncCats;
    }

    const syncProds = this.productService.getProductsSync();
    if (syncProds && syncProds.length > 0) {
      this.setProducts(syncProds);
      this.isHomeLoading = false;
    }

    // 2. Fetch categories and products concurrently in parallel without blocking each other
    this.productService.getCategories().then(cats => {
      if (cats && cats.length > 0) {
        this.categories = cats;
      }
    }).catch(e => console.warn('Categories load note:', e));

    this.productService.getProducts().then(prods => {
      this.setProducts(prods);
      this.isHomeLoading = false;
    }).catch(e => {
      console.error('Error loading home products:', e);
      this.isHomeLoading = false;
    });
  }

  private setProducts(allProds: Product[]) {
    if (allProds.length > 0) {
      const newArr = allProds.filter(p => p.new_arrival);
      this.newArrivals = newArr.length > 0 ? newArr : allProds.slice(0, 4);

      const feat = allProds.filter(p => p.featured || p.best_seller);
      this.featuredProducts = feat.length > 0 ? feat : allProds.slice(0, Math.min(allProds.length, 4));
    } else {
      this.newArrivals = [];
      this.featuredProducts = [];
    }
  }

  get displayedCategories(): Category[] {
    return (this.categories && this.categories.length > 0) ? this.categories : this.defaultCategories;
  }

  getCategoryCover(cat: Category): string {
    if (cat.image_url && cat.image_url.trim()) {
      return cat.image_url.trim();
    }
    const isJewel = (cat.department === 'jewellery') || 
      /jewel|necklace|earring|bangle|ring|bracelet|choker/i.test((cat.slug || '') + ' ' + (cat.name || ''));
    if (isJewel) return this.defaultJewelleryImage;

    const slug = (cat.slug || '').toLowerCase();
    if (slug.includes('saree')) return 'https://i.ibb.co/7N2bJC2X/Whats-App-Image-2026-08-13-at-12-31-10-PM-1.jpg';
    if (slug.includes('anarkali')) return 'https://i.ibb.co/7tQbhHpZ/Whats-App-Image-2026-08-13-at-12-31-11-PM-2.jpg';
    if (slug.includes('coord') || slug.includes('dress') || slug.includes('midi')) return 'https://i.ibb.co/G4bg5wKQ/379a42c6-1c91-404e-8fb6-d04a4689c4a2.png';
    return this.defaultEthnicImage;
  }

  onImageError(event: Event) {
    handleImageError(event);
  }

  trackByCategoryId(index: number, category: Category): string {
    return category.id;
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  getOptimizedUrl(url: string | null | undefined, width: number): string {
    return getResponsiveImageUrl(url, width);
  }

  onQuickAdd(event: { product: Product; size?: string }) {
    try {
      this.cartService.addToCart(event.product, event.size, 1);
      const sizeMsg = event.size ? ` (Size: ${event.size})` : '';
      alert(`Added ${event.product.name}${sizeMsg} to your cart!`);
    } catch (err: any) {
      alert(err.message || 'Could not add item to cart');
    }
  }
}
