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
      <!-- 1. Hero Fashion Showcase (85-90% Viewport Height, ~3s Auto Slider) -->
      <app-hero-carousel></app-hero-carousel>

      <!-- 2. Featured Categories -->
      <section class="section categories-section">
        <div class="container">
          <div class="section-header text-center">
            <span class="section-subtitle">CURATED COLLECTIONS</span>
            <h2 class="section-title">Shop By Category</h2>
            <p class="section-desc">Discover our handpicked silhouettes designed for every celebration.</p>
          </div>

          <div class="category-grid">
            <div 
              *ngFor="let cat of categories; trackBy: trackByCategoryId" 
              class="category-card"
            >
              <a [routerLink]="['/shop']" [queryParams]="{category: cat.slug}" class="category-link">
                <div class="category-img-wrapper">
                  <img 
                    [src]="getOptimizedUrl(cat.image_url, 400)" 
                    [alt]="cat.name" 
                    class="category-img" 
                    loading="lazy"
                    (error)="onImageError($event)"
                  />
                  <div class="category-overlay"></div>
                </div>
                <div class="category-info">
                  <h3 class="category-name">{{ cat.name }}</h3>
                  <span class="category-cta">Explore Collection &rarr;</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
 
      <!-- 3. New Arrivals -->
      <section class="section new-arrivals-section">
        <div class="container">
          <div class="section-header-flex">
            <div>
              <span class="section-subtitle">JUST DROPPED</span>
              <h2 class="section-title">New Arrivals</h2>
            </div>
            <a routerLink="/shop" [queryParams]="{filter: 'new'}" class="btn-outline">View All New Arrivals &rarr;</a>
          </div>
 
          <div class="product-grid" *ngIf="newArrivals.length > 0; else loadingState">
            <app-product-card 
              *ngFor="let prod of newArrivals; let i = index; trackBy: trackByProductId" 
              [product]="prod"
              [priority]="i < 4"
              (quickAdd)="onQuickAdd($event)"
            ></app-product-card>
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
 
          <div class="product-grid" *ngIf="featuredProducts.length > 0; else loadingState">
            <app-product-card 
              *ngFor="let prod of featuredProducts; let i = index; trackBy: trackByProductId" 
              [product]="prod"
              [priority]="i < 4"
              (quickAdd)="onQuickAdd($event)"
            ></app-product-card>
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
                  alt="Petals Ethnic Boutique Craftsmanship" 
                  class="story-img" 
                  loading="lazy"
                  (error)="onImageError($event)"
                />
                <div class="story-badge-floating">
                  <span>HANDWORKED ELEGANCE</span>
                </div>
              </div>
            </div>

            <!-- Right Side: Heading & Short Elegant Description -->
            <div class="story-text-col">
              <span class="story-subtitle">OUR BOUTIQUE HERITAGE</span>
              <h2 class="story-title">Our Story</h2>
              
              <p class="story-paragraph lead-p">
                Founded with a passion for authentic ethnic craftsmanship, Petals Ethnic brings together timeless Indian silhouettes and contemporary boutique elegance.
              </p>
              
              <p class="story-paragraph">
                From handpicked breathable fabrics to delicate watercolor floral drapes, intricate embroidery, and traditional Kerala Kasavu zari weaves, every garment is thoughtfully created to celebrate your unique grace.
              </p>

              <p class="story-paragraph">
                Whether you are dressing for a joyous festive family gathering, a serene temple ritual, or a modern celebration, our boutique collection ensures effortless fit, regal flair, and supreme comfort.
              </p>

              <div class="story-cta-box">
                <a routerLink="/about" class="btn-primary story-btn">Discover Our Story &rarr;</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. Instagram Section -->
      <section class="section instagram-section">
        <div class="container">
          <div class="section-header text-center">
            <span class="section-subtitle">FOLLOW OUR JOURNEY</span>
            <h2 class="section-title">&#64;petalsethnic on Instagram</h2>
            <p class="section-desc">Tag us in your Petals Ethnic outfits to be featured!</p>
          </div>

          <div class="insta-grid">
            <a href="https://www.instagram.com/petalsethnic" target="_blank" rel="noopener" class="insta-item">
              <img [src]="getOptimizedUrl('https://i.ibb.co/7tQbhHpZ/Whats-App-Image-2026-08-13-at-12-31-11-PM-2.jpg', 300)" alt="Petals Ethnic Anarkali Style" (error)="onImageError($event)" />
              <div class="insta-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram</span>
              </div>
            </a>
            <a href="https://www.instagram.com/petalsethnic" target="_blank" rel="noopener" class="insta-item">
              <img [src]="getOptimizedUrl('https://i.ibb.co/7N2bJC2X/Whats-App-Image-2026-08-13-at-12-31-10-PM-1.jpg', 300)" alt="Petals Ethnic Kasavu Style" (error)="onImageError($event)" />
              <div class="insta-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram</span>
              </div>
            </a>
            <a href="https://www.instagram.com/petalsethnic" target="_blank" rel="noopener" class="insta-item">
              <img [src]="getOptimizedUrl('https://i.ibb.co/7d3T6dxp/Whats-App-Image-2026-08-13-at-12-31-11-PM-1.jpg', 300)" alt="Petals Ethnic Midi Dress" (error)="onImageError($event)" />
              <div class="insta-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram</span>
              </div>
            </a>
            <a href="https://www.instagram.com/petalsethnic" target="_blank" rel="noopener" class="insta-item">
              <img [src]="getOptimizedUrl('https://i.ibb.co/G4bg5wKQ/379a42c6-1c91-404e-8fb6-d04a4689c4a2.png', 300)" alt="Petals Ethnic Codeset" (error)="onImageError($event)" />
              <div class="insta-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      <!-- 7. WhatsApp CTA Section (Clean & Elegant Need Help Button) -->
      <section class="section wa-cta-section">
        <div class="container wa-cta-box">
          <h2>Need Help Finding Your Outfit?</h2>
          <p>Connect directly with our fashion stylists on WhatsApp for sizing advice, customized recommendations, or order inquiries.</p>
          <a href="https://wa.me/918113899319?text=Hello%20Petals%20Ethnic,%20I%20would%20like%20to%20know%20more%20about%20your%20products." target="_blank" rel="noopener" class="btn-wa">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.333 5.001l-1.416 5.174 5.299-1.389c1.464.798 3.114 1.218 4.774 1.218h.004c5.506 0 9.989-4.478 9.99-9.984 0-2.669-1.038-5.176-2.925-7.062-1.887-1.886-4.394-2.924-7.064-2.924zm5.82 14.281c-.244.687-1.42 1.312-1.957 1.393-.49.074-1.127.106-1.815-.115-.418-.134-.956-.31-1.657-.615-2.955-1.282-4.887-4.281-5.035-4.479-.148-.198-1.205-1.604-1.205-3.059 0-1.455.762-2.172 1.033-2.464.271-.292.593-.365.791-.365.198 0 .396.002.568.01.185.009.432-.07.676.516.244.587.834 2.036.907 2.184.073.148.122.321.024.516-.098.196-.148.318-.293.49-.148.171-.31.382-.443.513-.148.148-.303.31-.131.606.171.296.76 1.256 1.632 2.033 1.123.999 2.07 1.309 2.366 1.457.296.148.469.124.642-.074.173-.198.742-.865.94-1.162.198-.296.396-.247.668-.148.271.098 1.727.815 2.023.963.296.148.494.222.568.346.074.123.074.715-.17 1.402z"/>
            </svg>
            <span>Need Help? &rarr; WhatsApp Us</span>
          </a>
        </div>
      </section>
    </main>

    <ng-template #loadingState>
      <div class="loading-spinner-box">
        <div class="spinner"></div>
        <p>Loading fashion collections...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .section {
      padding: 64px 0;
    }
    @media (max-width: 768px) {
      .section { padding: 40px 0; }
    }

    .text-center {
      text-align: center;
    }

    /* Categories Grid */
    .category-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
    @media (max-width: 992px) {
      .category-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 576px) {
      .category-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    }

    .category-card {
      position: relative;
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }
    .category-img-wrapper {
      position: relative;
      padding-top: 130%;
      background-color: var(--color-bg-alt);
    }
    .category-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .category-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%);
    }
    .category-card:hover .category-img {
      transform: scale(1.08);
    }
    .category-info {
      position: absolute;
      bottom: 20px;
      left: 20px;
      right: 20px;
      color: #FFFFFF;
      z-index: 2;
    }
    .category-name {
      font-size: 20px;
      color: #FFFFFF;
      margin-bottom: 4px;
    }
    @media (max-width: 576px) {
      .category-name { font-size: 15px; }
    }
    .category-cta {
      font-size: 12px;
      font-weight: 500;
      color: var(--color-pink);
      letter-spacing: 0.5px;
    }

    /* Product Grids */
    .section-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 40px;
    }
    @media (max-width: 576px) {
      .section-header-flex { flex-direction: column; align-items: flex-start; gap: 16px; }
    }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
    @media (max-width: 992px) {
      .product-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 576px) {
      .product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    }

    /* Clean Two-Column Editorial "Our Story" Section */
    .story-editorial-section {
      background-color: #FAF8F6;
      border-top: 1px solid var(--color-border-light);
      border-bottom: 1px solid var(--color-border-light);
    }
    .story-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 56px;
      align-items: center;
    }
    @media (max-width: 992px) {
      .story-grid {
        grid-template-columns: 1fr;
        gap: 32px;
      }
    }

    .story-image-col {
      position: relative;
    }
    .story-image-frame {
      position: relative;
      width: 100%;
      max-width: 520px;
      margin: 0 auto;
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
      border: 1px solid var(--color-border);
    }
    .story-img {
      width: 100%;
      height: 480px;
      object-fit: cover;
      object-position: center top;
      display: block;
      transition: transform 0.6s ease;
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
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #9F3D62;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .story-text-col {
      padding: 10px 0;
    }
    .story-subtitle {
      display: inline-block;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 2.5px;
      color: #9F3D62;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .story-title {
      font-size: 38px;
      font-weight: 700;
      color: var(--color-text-heading);
      margin-bottom: 20px;
      line-height: 1.2;
    }
    @media (max-width: 768px) {
      .story-title { font-size: 28px; }
      .story-img { height: 360px; }
    }
    @media (max-width: 480px) {
      .story-img { height: 300px; }
    }

    .story-paragraph {
      font-size: 15px;
      line-height: 1.65;
      color: var(--color-muted);
      margin-bottom: 16px;
    }
    .story-paragraph.lead-p {
      font-size: 17px;
      font-weight: 500;
      color: var(--color-text);
      line-height: 1.6;
    }

    .story-cta-box {
      margin-top: 28px;
    }
    .story-btn {
      display: inline-flex;
      align-items: center;
      padding: 14px 32px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 600;
    }

    /* Instagram */
    .insta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    @media (max-width: 576px) {
      .insta-grid { grid-template-columns: repeat(2, 1fr); }
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
      object-position: center top;
      transition: transform 0.5s ease;
    }
    .insta-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.6);
      color: #FFFFFF;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .insta-item:hover img {
      transform: scale(1.08);
    }
    .insta-item:hover .insta-overlay {
      opacity: 1;
    }

    /* WhatsApp CTA */
    .wa-cta-box {
      background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%);
      color: #FFFFFF;
      padding: 60px 32px;
      border-radius: var(--radius-lg);
      text-align: center;
    }
    .wa-cta-box h2 {
      font-size: 32px;
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
      padding: 16px 36px;
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
  categories: Category[] = [];
  newArrivals: Product[] = [];
  featuredProducts: Product[] = [];

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  async ngOnInit() {
    try {
      this.categories = await this.productService.getCategories();
      const allProds = await this.productService.getProducts();

      if (allProds.length > 0) {
        const newArr = allProds.filter(p => p.new_arrival);
        this.newArrivals = newArr.length > 0 ? newArr : allProds.slice(0, 4);

        const feat = allProds.filter(p => p.featured);
        this.featuredProducts = feat.length > 0 ? feat : allProds.slice(0, Math.min(allProds.length, 4));
      } else {
        this.newArrivals = [];
        this.featuredProducts = [];
      }
    } catch (e) {
      console.error('Error loading home data:', e);
    }
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

  onQuickAdd(event: { product: Product; size: SizeOption }) {
    try {
      this.cartService.addToCart(event.product, event.size, 1);
      alert(`Added ${event.product.name} (Size: ${event.size}) to your cart!`);
    } catch (err: any) {
      alert(err.message || 'Could not add item to cart');
    }
  }

  private getFallbackProducts(): Product[] {
    return [
      {
        id: 'p1',
        name: 'Royal Floral Anarkali Set',
        slug: 'royal-floral-anarkali-set',
        description: 'Handworked flared Anarkali kurta with floral print dupattas.',
        price: 2499,
        sale_price: 1999,
        stock: 12,
        availability: 'in_stock',
        featured: true,
        new_arrival: true,
        active: true,
        category: { id: 'c4', name: 'Anarkali', slug: 'anarkali', active: true },
        images: [{ image_url: 'https://i.ibb.co/7tQbhHpZ/Whats-App-Image-2026-08-13-at-12-31-11-PM-2.jpg', is_primary: true }]
      },
      {
        id: 'p2',
        name: 'Tissue Silk Kasavu Festive Kurta',
        slug: 'tissue-silk-kasavu-festive-kurta',
        description: 'Shimmering golden Kasavu woven tissue silk kurta set.',
        price: 2999,
        sale_price: 2499,
        stock: 8,
        availability: 'few_left',
        featured: true,
        new_arrival: true,
        active: true,
        category: { id: 'c6', name: 'Tissue Silk Kasavu', slug: 'tissue-silk-kasavu-kurta', active: true },
        images: [{ image_url: 'https://i.ibb.co/7N2bJC2X/Whats-App-Image-2026-08-13-at-12-31-10-PM-1.jpg', is_primary: true }]
      },
      {
        id: 'p3',
        name: 'A-Line Watercolor Floral Midi Dress',
        slug: 'aline-watercolor-floral-midi-dress',
        description: 'Elegant A-line silhouette with soft watercolor botanical drapes.',
        price: 1899,
        sale_price: null,
        stock: 15,
        availability: 'in_stock',
        featured: true,
        new_arrival: false,
        active: true,
        category: { id: 'c1', name: 'A Line Midi Dress', slug: 'aline-midi-dress', active: true },
        images: [{ image_url: 'https://i.ibb.co/7d3T6dxp/Whats-App-Image-2026-08-13-at-12-31-11-PM-1.jpg', is_primary: true }]
      },
      {
        id: 'p4',
        name: 'Modern Chic Co-ord Codeset',
        slug: 'modern-chic-coord-codeset',
        description: 'Tailored 2-piece ethnic coordinated set with soft cotton lining.',
        price: 2199,
        sale_price: 1799,
        stock: 5,
        availability: 'few_left',
        featured: true,
        new_arrival: true,
        active: true,
        category: { id: 'c5', name: 'Codeset', slug: 'codeset', active: true },
        images: [{ image_url: 'https://i.ibb.co/G4bg5wKQ/379a42c6-1c91-404e-8fb6-d04a4689c4a2.png', is_primary: true }]
      }
    ];
  }
}
