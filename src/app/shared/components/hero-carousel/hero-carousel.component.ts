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

      <!-- Subtle bottom gradient for button contrast -->
      <div class="hero-gradient-overlay"></div>

      <!-- Exploration Buttons Only (No text, heading, or tagline) -->
      <div class="hero-cta-container">
        <div class="hero-buttons-row">
          <a routerLink="/ethnics" class="btn-hero-cta btn-ethnics">
            EXPLORE ETHNICS
          </a>
          <a routerLink="/jewellery" class="btn-hero-cta btn-jewellery">
            EXPLORE JEWELLERY
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-static-section {
      position: relative;
      width: 100%;
      height: 70vh;
      min-height: 480px;
      max-height: 660px;
      overflow: hidden;
      background-color: #0D0D0D;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .hero-static-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 20%;
    }

    .hero-gradient-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.05) 0%,
        rgba(0, 0, 0, 0.1) 50%,
        rgba(15, 10, 12, 0.55) 100%
      );
      pointer-events: none;
    }

    .hero-cta-container {
      position: relative;
      z-index: 3;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px 44px 24px;
      display: flex;
      justify-content: center;
    }

    .hero-buttons-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    /* Minimal, Elegant Exploration Buttons */
    .btn-hero-cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 200px;
      padding: 14px 30px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      text-decoration: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(8px);
      user-select: none;
    }

    /* Soft Rose Accent Button for Ethnics */
    .btn-ethnics {
      background: #FFFFFF;
      color: #0D0D0D;
      border: 1.5px solid rgba(194, 24, 91, 0.7);
    }
    .btn-ethnics:hover {
      background: #C2185B;
      color: #FFFFFF;
      border-color: #C2185B;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(194, 24, 91, 0.35);
    }

    /* Soft Gold Accent Button for Jewellery */
    .btn-jewellery {
      background: #FFFFFF;
      color: #0D0D0D;
      border: 1.5px solid rgba(197, 160, 89, 0.9);
    }
    .btn-jewellery:hover {
      background: #C5A059;
      color: #FFFFFF;
      border-color: #C5A059;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(197, 160, 89, 0.4);
    }

    /* Mobile Responsiveness */
    @media (max-width: 768px) {
      .hero-static-section {
        height: 52vh;
        min-height: 340px;
        max-height: 420px;
      }
      .hero-cta-container {
        padding: 0 16px 28px 16px;
      }
      .hero-buttons-row {
        gap: 12px;
      }
      .btn-hero-cta {
        min-width: 150px;
        padding: 11px 20px;
        font-size: 11px;
        letter-spacing: 1.2px;
      }
    }

    @media (max-width: 480px) {
      .hero-static-section {
        height: 46vh;
        min-height: 290px;
        max-height: 360px;
      }
      .hero-static-img {
        object-position: center 15%;
      }
      .hero-cta-container {
        padding: 0 12px 20px 12px;
      }
      .hero-buttons-row {
        gap: 10px;
        width: 100%;
      }
      .btn-hero-cta {
        flex: 1;
        min-width: 135px;
        padding: 10px 14px;
        font-size: 11px;
        letter-spacing: 1px;
      }
    }
  `]
})
export class HeroCarouselComponent {
  onImageError(event: Event) {
    handleImageError(event);
  }
}
