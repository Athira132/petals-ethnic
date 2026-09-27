import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { handleImageError } from '../../../core/utils/image.utils';

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="hero-slider-section" (mouseenter)="pauseSlider()" (mouseleave)="resumeSlider()">
      <!-- Desktop Hero Slider (Screen > 768px) -->
      <div class="hero-slider-track desktop-hero-track">
        <!-- Desktop Slide 1 (Current Master Hero - Eager Loaded) -->
        <div class="hero-slide" [class.active]="currentSlide === 0">
          <img 
            src="https://i.ibb.co/nMB7zjDr/815c69bb-715a-42d0-9148-fbc5edfa1cf6-1.png" 
            alt="Petal Ethnics & Jewellers Couture Collection" 
            class="hero-img desktop-hero-img"
            fetchpriority="high"
            loading="eager"
            decoding="async"
            (error)="onImageError($event)"
          />
        </div>

        <!-- Desktop Slide 2 (New Luxury Slide - Lazy Loaded) -->
        <div class="hero-slide" [class.active]="currentSlide === 1">
          <img 
            src="https://i.ibb.co/Z1McJ1Nz/Gemini-Generated-Image-vabke2vabke2vabk-2.png" 
            alt="Petal Ethnics & Jewellers Festive Season" 
            class="hero-img desktop-hero-img"
            loading="lazy"
            decoding="async"
            (error)="onImageError($event)"
          />
        </div>
      </div>

      <!-- Mobile Hero Slider (Screen <= 768px ONLY) -->
      <div class="hero-slider-track mobile-hero-track">
        <!-- Mobile Slide 1 (Image 1 - Eager Loaded) -->
        <div class="hero-slide" [class.active]="currentSlide === 0">
          <img 
            src="https://i.ibb.co/gMLZk8Dj/Untitled-design-13-1.png" 
            alt="Petal Ethnics & Jewellers Mobile Collection 1" 
            class="hero-img mobile-hero-img"
            fetchpriority="high"
            loading="eager"
            decoding="async"
            (error)="onImageError($event)"
          />
        </div>

        <!-- Mobile Slide 2 (Image 2 - Lazy Loaded) -->
        <div class="hero-slide" [class.active]="currentSlide === 1">
          <img 
            src="https://i.ibb.co/HTkFZ2d8/Untitled-design-11.png" 
            alt="Petal Ethnics & Jewellers Mobile Collection 2" 
            class="hero-img mobile-hero-img"
            loading="lazy"
            decoding="async"
            (error)="onImageError($event)"
          />
        </div>
      </div>

      <!-- Hero Exploration Buttons in Clean Horizontal Row Beside Each Other -->
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
    .hero-slider-section {
      position: relative;
      width: 100%;
      height: clamp(380px, 44vw, 620px);
      overflow: hidden;
      background-color: #FAFAFA;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      user-select: none;
    }

    .hero-slider-track {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    /* Desktop vs Mobile Track Visibility */
    .desktop-hero-track {
      display: block;
    }
    .mobile-hero-track {
      display: none;
    }

    /* Cross-fade slide system */
    .hero-slide {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.8s ease-in-out, visibility 0.8s ease-in-out;
      will-change: opacity;
      pointer-events: none;
    }
    .hero-slide.active {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    .hero-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      filter: none;
    }

    .desktop-hero-img {
      object-fit: cover;
      object-position: center 25%;
    }

    .mobile-hero-img {
      object-fit: cover;
      object-position: center top;
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
      pointer-events: none;
    }

    /* Horizontal row beside each other */
    .hero-buttons-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 18px;
      flex-wrap: nowrap;
      pointer-events: auto;
    }

    /* Transparent buttons with black outline/border */
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
      background: transparent;
      border: 2px solid #000000;
      color: #000000;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
      transition: all 0.25s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      user-select: none;
      cursor: pointer;
    }

    .btn-hero-cta:hover {
      background: rgba(0, 0, 0, 0.08);
      border-color: #000000;
      color: #000000;
      transform: translateY(-2px);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
    }

    .btn-ethnics, .btn-jewellery {
      background: transparent;
      border: 2px solid #000000;
      color: #000000;
    }

    .btn-ethnics:hover, .btn-jewellery:hover {
      background: rgba(0, 0, 0, 0.08);
      border-color: #000000;
      color: #000000;
    }

    /* Tablet Responsiveness */
    @media (max-width: 768px) {
      .desktop-hero-track {
        display: none;
      }
      .mobile-hero-track {
        display: block;
      }

      .hero-slider-section {
        height: clamp(380px, 95vw, 540px);
      }
      .hero-cta-container {
        bottom: 20px;
        padding: 0 16px;
      }
      .hero-buttons-row {
        gap: 12px;
        flex-wrap: nowrap;
      }
      .btn-hero-cta {
        min-width: 150px;
        padding: 11px 18px;
        font-size: 11px;
        letter-spacing: 1px;
      }
    }

    /* Mobile Phone Responsiveness - portrait framing and strictly in one row */
    @media (max-width: 480px) {
      .hero-slider-section {
        height: clamp(350px, 105vw, 500px);
      }
      .mobile-hero-img {
        object-position: center 10%;
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
        padding: 10px 8px;
        font-size: 10.5px;
        letter-spacing: 0.5px;
        white-space: nowrap;
        text-align: center;
        border-width: 1.5px;
      }
    }
  `]
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  private slideInterval: any = null;

  ngOnInit() {
    this.startSlider();
    // Warm slide 2 images in background after first paint
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const dImg = new Image();
        dImg.src = 'https://i.ibb.co/Z1McJ1Nz/Gemini-Generated-Image-vabke2vabke2vabk-2.png';
        const mImg = new Image();
        mImg.src = 'https://i.ibb.co/HTkFZ2d8/Untitled-design-11.png';
      }, 1200);
    }
  }

  ngOnDestroy() {
    this.stopSlider();
  }

  startSlider() {
    this.stopSlider();
    this.slideInterval = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % 2;
    }, 4200);
  }

  stopSlider() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.slideInterval = null;
    }
  }

  pauseSlider() {
    this.stopSlider();
  }

  resumeSlider() {
    this.startSlider();
  }

  onImageError(event: Event) {
    handleImageError(event);
  }
}
