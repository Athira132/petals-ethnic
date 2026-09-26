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
      <!-- Maximum Brightness Edge-to-Edge Hero Banner (Zoomed out, properly centered, no dark overlay) -->
      <img 
        src="https://i.ibb.co/nMB7zjDr/815c69bb-715a-42d0-9148-fbc5edfa1cf6-1.png" 
        alt="Petal Ethnics & Jewellers Collection" 
        class="hero-static-img"
        fetchpriority="high"
        loading="eager"
        decoding="async"
        (error)="onImageError($event)"
      />

      <!-- Hero Exploration Buttons in a Clean Horizontal Row Beside Each Other -->
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
      height: clamp(380px, 46vw, 620px);
      overflow: hidden;
      background-color: #FAFAFA;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    /* Edge-to-edge, zoomed out, centered without excessive cropping or dark overlays */
    .hero-static-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 25%;
      opacity: 1;
      filter: none;
      display: block;
    }

    /* Centered bottom container for horizontal buttons */
    .hero-cta-container {
      position: absolute;
      bottom: 34px;
      left: 0;
      right: 0;
      z-index: 10;
      display: flex;
      justify-content: center;
      padding: 0 20px;
    }

    /* Horizontal row beside each other */
    .hero-buttons-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 18px;
      flex-wrap: wrap;
    }

    /* Solid high-contrast buttons with rose & gold accents */
    .btn-hero-cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 210px;
      padding: 13px 30px;
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
      transform: translateY(-2px);
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
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(197, 160, 89, 0.45);
    }

    /* Tablet Responsiveness */
    @media (max-width: 768px) {
      .hero-static-section {
        height: clamp(280px, 50vw, 400px);
      }
      .hero-cta-container {
        bottom: 22px;
        padding: 0 16px;
      }
      .hero-buttons-row {
        gap: 12px;
      }
      .btn-hero-cta {
        min-width: 160px;
        padding: 11px 20px;
        font-size: 11px;
        letter-spacing: 1px;
      }
    }

    /* Mobile Phone Responsiveness - strictly beside each other in a row */
    @media (max-width: 480px) {
      .hero-static-section {
        height: clamp(240px, 58vw, 320px);
      }
      .hero-static-img {
        object-position: center 20%;
      }
      .hero-cta-container {
        bottom: 14px;
        padding: 0 12px;
      }
      .hero-buttons-row {
        gap: 8px;
        flex-wrap: nowrap;
        width: 100%;
        max-width: 380px;
      }
      .btn-hero-cta {
        flex: 1;
        min-width: 0;
        padding: 9px 8px;
        font-size: 10px;
        letter-spacing: 0.5px;
        white-space: nowrap;
        text-align: center;
      }
    }
  `]
})
export class HeroCarouselComponent {
  onImageError(event: Event) {
    handleImageError(event);
  }
}
