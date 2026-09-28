import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { handleImageError } from '../../../core/utils/image.utils';

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="hero-slider-section" (mouseenter)="pauseDesktopSlider()" (mouseleave)="resumeDesktopSlider()">
      <!-- Primary Semantic H1 for Homepage SEO (Accessible and visually non-obtrusive) -->
      <h1 class="hero-sr-heading">Petals Ethnics and Jewellers | Ethnic Wear &amp; Jewellery</h1>

      <!-- Desktop Hero Slider (Screen > 768px ONLY - Unchanged) -->
      <div class="hero-slider-track desktop-hero-track">
        <!-- Desktop Slide 1 (Current Master Hero - Eager Loaded) -->
        <div class="hero-slide desktop-hero-slide" [class.active]="currentDesktopSlide === 0">
          <picture>
            <source type="image/webp" srcset="/images/hero/desktop_hero_1440.webp">
            <img 
              src="https://i.ibb.co/nMB7zjDr/815c69bb-715a-42d0-9148-fbc5edfa1cf6-1.png" 
              alt="Petals Ethnics and Jewellers | Handcrafted Ethnic Wear & Jewellery" 
              class="hero-img desktop-hero-img"
              fetchpriority="high"
              loading="eager"
              decoding="async"
              width="1440"
              height="620"
              (error)="onImageError($event)"
            />
          </picture>
        </div>

        <!-- Desktop Slide 2 (New Luxury Slide - Lazy Loaded) -->
        <div class="hero-slide desktop-hero-slide" [class.active]="currentDesktopSlide === 1">
          <img 
            src="https://i.ibb.co/Z1McJ1Nz/Gemini-Generated-Image-vabke2vabke2vabk-2.png" 
            alt="Petals Ethnics and Jewellers Festive Indian Wear & Jewellery" 
            class="hero-img desktop-hero-img"
            loading="lazy"
            decoding="async"
            width="1440"
            height="620"
            (error)="onImageError($event)"
          />
        </div>
      </div>

      <!-- Desktop Hero Exploration Buttons in Clean Horizontal Row (Screen > 768px) -->
      <div class="hero-cta-container desktop-hero-cta">
        <div class="hero-buttons-row">
          <a routerLink="/ethnics" class="btn-hero-cta btn-ethnics">
            EXPLORE ETHNICS
          </a>
          <a routerLink="/jewellery" class="btn-hero-cta btn-jewellery">
            EXPLORE JEWELLERY
          </a>
        </div>
      </div>

      <!-- Mobile Hero Banner (Screen <= 768px ONLY - Controlled center-top framing showing complete products) -->
      <div class="mobile-hero-container" role="banner" aria-label="Petals Ethnics and Jewellers Mobile Collection">
        <picture>
          <source type="image/webp" srcset="/images/hero/mobile_hero_480.webp 480w, /images/hero/mobile_hero_768.webp 768w" sizes="(max-width: 480px) 480px, 768px">
          <img 
            src="/images/hero/mobile_hero_768.webp" 
            alt="Petals Ethnics and Jewellers | Ethnic Wear & Jewellery Collection" 
            class="mobile-hero-img"
            fetchpriority="high"
            loading="eager"
            decoding="async"
            width="768"
            height="840"
            (error)="onMobileImageError($event)"
          />
        </picture>

        <!-- Mobile Hero Exploration Buttons in Clean Horizontal Row -->
        <div class="hero-cta-container mobile-hero-cta">
          <div class="hero-buttons-row">
            <a routerLink="/ethnics" class="btn-hero-cta btn-ethnics">
              EXPLORE ETHNICS
            </a>
            <a routerLink="/jewellery" class="btn-hero-cta btn-jewellery">
              EXPLORE JEWELLERY
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-sr-heading {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

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

    /* Desktop Track Visibility */
    .desktop-hero-track {
      display: block;
    }

    /* Desktop Cross-fade slide system */
    .desktop-hero-track .desktop-hero-slide {
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
    .desktop-hero-track .desktop-hero-slide.active {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    .hero-slide picture,
    .mobile-hero-container picture {
      display: contents;
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

    /* Desktop Centered bottom container for horizontal buttons */
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

    /* Mobile Hero Banner - Hidden on Desktop (> 768px) */
    .mobile-hero-container {
      display: none;
    }

    /* Mobile / Tablet Responsiveness (Screen <= 768px):
       - Exact provided image (https://ibb.co/gFHDsb4r / 1024x1536)
       - Noticeably shorter height: cropped MORE from the bottom
       - Top portion (model, face, hair ornaments, jewellery, saree drape, title) 100% UNCHANGED
       - Zero cropping from left, right, or top
       - Compact framing that fits comfortably within the first mobile viewport alongside header
       - Transparent buttons with black outline in single horizontal row
    */
    @media (max-width: 768px) {
      .desktop-hero-track {
        display: none !important;
      }
      .desktop-hero-cta {
        display: none !important;
      }
      .hero-slider-section {
        height: auto !important;
        min-height: 0 !important;
        display: block !important;
        background-color: #F8F6F4;
      }
      .mobile-hero-container {
        display: block;
        position: relative;
        width: 100%;
        aspect-ratio: 1024 / 1120;
        max-height: clamp(350px, 58vh, 460px);
        overflow: hidden;
        background-color: #F8F6F4;
      }
      .mobile-hero-img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center top;
        display: block;
      }
      .mobile-hero-cta {
        position: absolute;
        bottom: 10px;
        left: 0;
        right: 0;
        z-index: 10;
        display: flex;
        justify-content: center;
        padding: 0 12px;
        pointer-events: none;
      }
      .mobile-hero-cta .hero-buttons-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 8px;
        flex-wrap: nowrap;
        width: 100%;
        max-width: 360px;
        pointer-events: auto;
      }
      .mobile-hero-cta .btn-hero-cta {
        flex: 1;
        min-width: 0;
        padding: 9px 8px;
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.5px;
        white-space: nowrap;
        text-align: center;
        background: transparent;
        border: 1.5px solid #000000;
        color: #000000;
        border-radius: 4px;
        text-decoration: none;
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      }
      .mobile-hero-cta .btn-hero-cta:hover,
      .mobile-hero-cta .btn-hero-cta:active {
        background: rgba(0, 0, 0, 0.08);
        border-color: #000000;
        color: #000000;
      }
    }

    @media (max-width: 480px) {
      .mobile-hero-container {
        aspect-ratio: 1024 / 1120;
        max-height: clamp(330px, 56vh, 430px);
      }
      .mobile-hero-cta {
        bottom: 9px;
        padding: 0 10px;
      }
      .mobile-hero-cta .hero-buttons-row {
        gap: 6px;
        max-width: 340px;
      }
      .mobile-hero-cta .btn-hero-cta {
        padding: 8px 6px;
        font-size: 10px;
        letter-spacing: 0.3px;
      }
    }

    @media (max-width: 360px) {
      .mobile-hero-container {
        aspect-ratio: 1024 / 1120;
        max-height: 350px;
      }
      .mobile-hero-cta {
        bottom: 7px;
        padding: 0 8px;
      }
      .mobile-hero-cta .hero-buttons-row {
        gap: 4px;
      }
      .mobile-hero-cta .btn-hero-cta {
        padding: 7px 4px;
        font-size: 9.5px;
      }
    }
  `]
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  currentDesktopSlide = 0;
  private desktopSlideInterval: any = null;

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        const m = new Image();
        m.src = '/images/hero/mobile_hero_768.webp';
      } else {
        const d1 = new Image();
        d1.src = '/images/hero/desktop_hero_1440.webp';
        const d2 = new Image();
        d2.src = 'https://i.ibb.co/Z1McJ1Nz/Gemini-Generated-Image-vabke2vabke2vabk-2.png';
        this.startDesktopSlider();
      }
    }
  }

  ngOnDestroy() {
    this.stopDesktopSlider();
  }

  /* Desktop Slider: Unchanged 4.2s crossfade rotation */
  startDesktopSlider() {
    this.stopDesktopSlider();
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      this.desktopSlideInterval = setInterval(() => {
        this.currentDesktopSlide = (this.currentDesktopSlide + 1) % 2;
      }, 4200);
    }
  }

  stopDesktopSlider() {
    if (this.desktopSlideInterval) {
      clearInterval(this.desktopSlideInterval);
      this.desktopSlideInterval = null;
    }
  }

  pauseDesktopSlider() {
    this.stopDesktopSlider();
  }

  resumeDesktopSlider() {
    this.startDesktopSlider();
  }

  onMobileImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target && !target.src.includes('Chat-GPT-Image-Sep-28-2026-10-35-37-AM.png')) {
      target.src = 'https://i.ibb.co/6JV46cXy/Chat-GPT-Image-Sep-28-2026-10-35-37-AM.png';
    } else {
      handleImageError(event);
    }
  }

  onImageError(event: Event) {
    handleImageError(event);
  }
}
