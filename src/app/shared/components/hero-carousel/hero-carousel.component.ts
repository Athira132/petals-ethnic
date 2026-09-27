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
      <!-- Desktop Hero Slider (Screen > 768px ONLY - Unchanged) -->
      <div class="hero-slider-track desktop-hero-track">
        <!-- Desktop Slide 1 (Current Master Hero - Eager Loaded) -->
        <div class="hero-slide desktop-hero-slide" [class.active]="currentDesktopSlide === 0">
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
        <div class="hero-slide desktop-hero-slide" [class.active]="currentDesktopSlide === 1">
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

      <!-- Mobile Hero Slider (Screen <= 768px ONLY - Fast Tap-to-Slide Track) -->
      <div 
        class="hero-slider-track mobile-hero-track"
        [class.slide-0]="currentMobileSlide === 0"
        [class.slide-1]="currentMobileSlide === 1"
        (click)="onMobileHeroTap($event)"
        (touchstart)="onTouchStart($event)"
        (touchend)="onTouchEnd($event)"
        role="button"
        tabindex="0"
        aria-label="Tap to view next hero image"
      >
        <!-- Mobile Slide 1 (Image 1 - Eager Loaded) -->
        <div class="hero-slide mobile-hero-slide">
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

        <!-- Mobile Slide 2 (Image 2 - Preloaded & Eager Loaded for Instant Tap Transition) -->
        <div class="hero-slide mobile-hero-slide">
          <img 
            src="https://i.ibb.co/HTkFZ2d8/Untitled-design-11.png" 
            alt="Petal Ethnics & Jewellers Mobile Collection 2" 
            class="hero-img mobile-hero-img"
            fetchpriority="high"
            loading="eager"
            decoding="async"
            (error)="onImageError($event)"
          />
        </div>
      </div>

      <!-- Hero Exploration Buttons in Clean Horizontal Row Beside Each Other -->
      <div class="hero-cta-container">
        <div class="hero-buttons-row">
          <a routerLink="/ethnics" class="btn-hero-cta btn-ethnics" (click)="$event.stopPropagation()" (touchend)="$event.stopPropagation()">
            EXPLORE ETHNICS
          </a>
          <a routerLink="/jewellery" class="btn-hero-cta btn-jewellery" (click)="$event.stopPropagation()" (touchend)="$event.stopPropagation()">
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

    /* Desktop Track Visibility */
    .desktop-hero-track {
      display: block;
    }
    .mobile-hero-track {
      display: none;
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
    @media (min-width: 481px) and (max-width: 768px) {
      .desktop-hero-track {
        display: none !important;
      }
      .mobile-hero-track {
        display: flex !important;
        position: absolute;
        top: 0;
        left: 0;
        width: 200%;
        height: 100%;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        touch-action: pan-y;
        transition: transform 0.32s cubic-bezier(0.25, 1, 0.5, 1);
        will-change: transform;
      }
      .mobile-hero-track.slide-0 {
        transform: translate3d(0, 0, 0);
      }
      .mobile-hero-track.slide-1 {
        transform: translate3d(-50%, 0, 0);
      }
      .mobile-hero-slide {
        position: relative;
        width: 50%;
        height: 100%;
        flex-shrink: 0;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto;
      }
      .mobile-hero-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center 65%;
      }

      .hero-slider-section {
        height: clamp(500px, 85vw, 650px);
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

    /* Mobile Phone Responsiveness (< 481px):
       - Exact 848/1264 portrait proportion to show the COMPLETE image (no aggressive cropping)
       - Lower portion (bench/necklace) completely visible
       - Fast 320ms slide on tap / touch
       - Transparent buttons with black outline in single horizontal row
    */
    @media (max-width: 480px) {
      .desktop-hero-track {
        display: none !important;
      }
      .hero-slider-section {
        height: auto;
        aspect-ratio: 848 / 1264;
        max-height: 84vh;
        min-height: 480px;
        background-color: #FAFAFA;
      }

      .mobile-hero-track {
        display: flex !important;
        position: absolute;
        top: 0;
        left: 0;
        width: 200%;
        height: 100%;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        touch-action: pan-y;
        transition: transform 0.32s cubic-bezier(0.25, 1, 0.5, 1);
        will-change: transform;
      }

      .mobile-hero-track.slide-0 {
        transform: translate3d(0, 0, 0);
      }

      .mobile-hero-track.slide-1 {
        transform: translate3d(-50%, 0, 0);
      }

      .mobile-hero-slide {
        position: relative;
        width: 50%;
        height: 100%;
        flex-shrink: 0;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto;
      }

      .mobile-hero-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center bottom;
      }

      .hero-cta-container {
        bottom: 12px;
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
  currentDesktopSlide = 0;
  currentMobileSlide = 0;
  private desktopSlideInterval: any = null;
  private lastMobileTapTime = 0;

  // Touch tracking for mobile swipe/tap
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;

  ngOnInit() {
    if (typeof window !== 'undefined') {
      // Synchronously pre-cache all hero images into browser memory for zero tap delay
      const m1 = new Image();
      m1.src = 'https://i.ibb.co/gMLZk8Dj/Untitled-design-13-1.png';
      const m2 = new Image();
      m2.src = 'https://i.ibb.co/HTkFZ2d8/Untitled-design-11.png';
      const d1 = new Image();
      d1.src = 'https://i.ibb.co/nMB7zjDr/815c69bb-715a-42d0-9148-fbc5edfa1cf6-1.png';
      const d2 = new Image();
      d2.src = 'https://i.ibb.co/Z1McJ1Nz/Gemini-Generated-Image-vabke2vabke2vabk-2.png';

      this.startDesktopSlider();
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

  /* Mobile Slider: Instant hardware-accelerated slide on tap / click */
  onMobileHeroTap(event?: Event) {
    const now = Date.now();
    if (now - this.lastMobileTapTime < 280) {
      return; // Debounce rapid multiple taps
    }
    this.lastMobileTapTime = now;
    this.currentMobileSlide = (this.currentMobileSlide + 1) % 2;
  }

  onTouchStart(e: TouchEvent) {
    if (e.touches && e.touches.length === 1) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.touchStartTime = Date.now();
    }
  }

  onTouchEnd(e: TouchEvent) {
    if (!e.changedTouches || e.changedTouches.length === 0) return;
    const deltaX = e.changedTouches[0].clientX - this.touchStartX;
    const deltaY = e.changedTouches[0].clientY - this.touchStartY;

    // If swipe horizontally (> 35px), trigger slide
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      this.onMobileHeroTap();
    }
    // Clean taps are handled by onMobileHeroTap with click & debounce
  }

  onImageError(event: Event) {
    handleImageError(event);
  }
}
