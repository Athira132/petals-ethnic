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
      <!-- Maximum Brightness Single Static Hero Image (No dark overlay, no shading) -->
      <img 
        src="https://i.ibb.co/nMB7zjDr/815c69bb-715a-42d0-9148-fbc5edfa1cf6-1.png" 
        alt="Petal Ethnics & Jewellers Collection" 
        class="hero-static-img"
        fetchpriority="high"
        loading="eager"
        decoding="async"
        (error)="onImageError($event)"
      />

      <!-- Side-Aligned Exploration Buttons (Vertically stacked on the side, fully visible & accessible) -->
      <div class="hero-cta-container">
        <div class="hero-buttons-col">
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
      background-color: #FAFAFA;
      display: flex;
      align-items: flex-end;
    }

    /* Crisp, bright, vivid hero image with preserved natural colors and maximum clarity */
    .hero-static-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 20%;
      opacity: 1;
      filter: none;
    }

    /* Positioned on one side (left) with clean margin */
    .hero-cta-container {
      position: absolute;
      left: 5%;
      bottom: 12%;
      z-index: 10;
      display: flex;
    }

    /* Vertically aligned side stack */
    .hero-buttons-col {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 14px;
    }

    /* High-contrast solid button styling ensuring 100% readability over bright imagery */
    .btn-hero-cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 220px;
      padding: 14px 28px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      text-decoration: none;
      transition: all 0.25s ease;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.22);
      user-select: none;
      cursor: pointer;
    }

    /* Rose Accent Button for Ethnics */
    .btn-ethnics {
      background: #FFFFFF;
      color: #1A1A1A;
      border: 2px solid #C2185B;
    }
    .btn-ethnics:hover {
      background: #C2185B;
      color: #FFFFFF;
      transform: translateX(4px);
      box-shadow: 0 8px 24px rgba(194, 24, 91, 0.4);
    }

    /* Gold Accent Button for Jewellery */
    .btn-jewellery {
      background: #FFFFFF;
      color: #1A1A1A;
      border: 2px solid #C5A059;
    }
    .btn-jewellery:hover {
      background: #C5A059;
      color: #FFFFFF;
      transform: translateX(4px);
      box-shadow: 0 8px 24px rgba(197, 160, 89, 0.45);
    }

    /* Tablet Responsiveness */
    @media (max-width: 768px) {
      .hero-static-section {
        height: 52vh;
        min-height: 340px;
        max-height: 440px;
      }
      .hero-cta-container {
        left: 20px;
        bottom: 24px;
      }
      .hero-buttons-col {
        gap: 10px;
      }
      .btn-hero-cta {
        min-width: 175px;
        padding: 11px 20px;
        font-size: 11px;
        letter-spacing: 1px;
      }
    }

    /* Mobile Phone Responsiveness */
    @media (max-width: 480px) {
      .hero-static-section {
        height: 48vh;
        min-height: 300px;
        max-height: 380px;
      }
      .hero-static-img {
        object-position: center 15%;
      }
      .hero-cta-container {
        left: 14px;
        bottom: 18px;
      }
      .hero-buttons-col {
        gap: 8px;
      }
      .btn-hero-cta {
        min-width: 155px;
        padding: 10px 16px;
        font-size: 11px;
        letter-spacing: 0.8px;
      }
    }
  `]
})
export class HeroCarouselComponent {
  onImageError(event: Event) {
    handleImageError(event);
  }
}
