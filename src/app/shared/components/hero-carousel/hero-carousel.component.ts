import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { handleImageError } from '../../../core/utils/image.utils';

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="hero-static-section">
      <!-- High-Performance Single Static Hero Image -->
      <img 
        src="https://i.ibb.co/nMB7zjDr/815c69bb-715a-42d0-9148-fbc5edfa1cf6-1.png" 
        alt="Petal Ethnics & Jewellers Collection" 
        class="hero-static-img"
        fetchpriority="high"
        loading="eager"
        decoding="async"
        (error)="onImageError($event)"
      />

      <!-- Subtle Gradient Overlay for Text Readability -->
      <div class="hero-gradient-overlay"></div>

      <!-- Hero Content -->
      <div class="hero-inner-container">
        <div class="hero-text-card">
          <span class="hero-pill-badge">NEW SEASON 2026</span>
          <h1 class="hero-main-title">Timeless Ethnic Couture & Handcrafted Jewellery</h1>
          <p class="hero-desc">Discover our handpicked designer sarees, anarkalis, festive kurtis, and curated statement jewellery.</p>
          <div class="hero-buttons-row">
            <a routerLink="/ethnics" class="btn-hero-primary">
              Explore Ethnics
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
            <a routerLink="/jewellery" class="btn-hero-secondary">
              ✨ Explore Jewellery
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-static-section {
      position: relative;
      width: 100%;
      height: 72vh;
      min-height: 500px;
      max-height: 700px;
      overflow: hidden;
      background-color: #0D0D0D;
      display: flex;
      align-items: flex-end;
    }

    .hero-static-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 25%;
    }

    .hero-gradient-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.15) 0%,
        rgba(0, 0, 0, 0.25) 45%,
        rgba(15, 10, 12, 0.85) 100%
      );
      pointer-events: none;
    }

    .hero-inner-container {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px 44px 24px;
    }

    .hero-text-card {
      max-width: 650px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .hero-pill-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #F8BBD0;
      background: rgba(159, 61, 98, 0.6);
      border: 1px solid rgba(248, 187, 208, 0.45);
      padding: 5px 14px;
      border-radius: 20px;
      backdrop-filter: blur(6px);
    }

    .hero-main-title {
      font-family: var(--font-heading, "Playfair Display", Georgia, serif);
      font-size: 40px;
      font-weight: 700;
      color: #FFFFFF;
      line-height: 1.18;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
      margin: 0;
    }

    .hero-desc {
      font-size: 15px;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.5;
      text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
      margin: 0;
      max-width: 560px;
    }

    .hero-buttons-row {
      display: flex;
      gap: 14px;
      align-items: center;
      margin-top: 6px;
      flex-wrap: wrap;
    }

    .btn-hero-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background-color: #9F3D62;
      color: #FFFFFF !important;
      padding: 12px 26px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s ease;
      box-shadow: 0 4px 16px rgba(159, 61, 98, 0.5);
    }
    .btn-hero-primary:hover {
      background-color: #BD4A75;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(159, 61, 98, 0.7);
    }

    .btn-hero-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      color: #FFFFFF !important;
      padding: 12px 24px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    .btn-hero-secondary:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: #FFFFFF;
      transform: translateY(-2px);
    }

    /* Tablet Responsiveness */
    @media (max-width: 992px) {
      .hero-static-section {
        height: 55vh;
        min-height: 380px;
        max-height: 480px;
      }
      .hero-main-title {
        font-size: 30px;
      }
      .hero-desc {
        font-size: 13px;
      }
    }

    /* Mobile Responsiveness: Compact & Immediate Viewport Discovery */
    @media (max-width: 576px) {
      .hero-static-section {
        height: 44vh;
        min-height: 280px;
        max-height: 350px;
      }
      .hero-static-img {
        object-position: center 15%;
      }
      .hero-inner-container {
        padding: 0 16px 20px 16px;
      }
      .hero-text-card {
        gap: 8px;
      }
      .hero-pill-badge {
        font-size: 9px;
        padding: 3px 10px;
      }
      .hero-main-title {
        font-size: 20px;
        line-height: 1.22;
      }
      .hero-desc {
        display: none; /* Hide long subtitle on small phones to maximize visibility of buttons and products below! */
      }
      .hero-buttons-row {
        gap: 10px;
        margin-top: 4px;
      }
      .btn-hero-primary {
        padding: 9px 18px;
        font-size: 12px;
      }
      .btn-hero-secondary {
        padding: 9px 16px;
        font-size: 12px;
      }
    }
  `]
})
export class HeroCarouselComponent {
  onImageError(event: Event) {
    handleImageError(event);
  }
}
