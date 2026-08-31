import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { handleImageError } from '../../../core/utils/image.utils';

export interface HeroSlide {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  objectPosition?: string;
}

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="hero-carousel-section">
      <div 
        class="carousel-track"
        [style.transform]="'translate3d(-' + (currentIndex * 100) + '%, 0, 0)'"
      >
        <div 
          *ngFor="let slide of slides; let i = index"
          class="carousel-slide"
          [class.active]="i === currentIndex"
        >
          <!-- Semantic High-Priority First Hero Image + Right-Center Biased Crop -->
          <img 
            [src]="slide.imageUrl" 
            [alt]="slide.title"
            class="slide-img" 
            [style.object-position]="slide.objectPosition || '85% center'"
            [attr.fetchpriority]="i === 0 ? 'high' : 'auto'"
            [loading]="i === 0 ? 'eager' : 'lazy'"
            decoding="async"
            (error)="onImageError($event)"
          />

          <!-- Elegant Bottom Gradient Overlay Behind Text (Upper Banner Remains Completely Bright) -->
          <div class="slide-overlay"></div>

          <!-- Hero Content Aligned To Bottom -->
          <div class="hero-container">
            <div class="hero-content">
              <span class="hero-badge">NEW SEASON 2026</span>
              <h1 class="hero-title">{{ slide.title }}</h1>
              <p class="hero-subtitle">{{ slide.subtitle }}</p>
              <div class="hero-cta-group">
                <a [routerLink]="slide.ctaLink" class="btn-hero-primary">
                  {{ slide.ctaText }}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
                <a routerLink="/shop" class="btn-hero-explore">Explore All Categories</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Minimal Unobtrusive Slider Indicators (Dots) -->
      <div class="carousel-indicators">
        <button 
          *ngFor="let slide of slides; let i = index"
          class="indicator-dot"
          [class.active]="i === currentIndex"
          (click)="goToSlide(i)"
          [attr.aria-label]="'Go to slide ' + (i + 1)"
        ></button>
      </div>
    </section>
  `,
  styles: [`
    .hero-carousel-section {
      position: relative;
      width: 100%;
      height: 88vh;
      min-height: 580px;
      max-height: 850px;
      overflow: hidden;
      background-color: #0D0D0D;
    }
    @media (max-width: 992px) {
      .hero-carousel-section {
        height: 82vh;
        min-height: 520px;
      }
    }
    @media (max-width: 576px) {
      .hero-carousel-section {
        height: 78vh;
        min-height: 480px;
        max-height: 620px;
      }
    }

    .carousel-track {
      display: flex;
      width: 100%;
      height: 100%;
      transition: transform 500ms cubic-bezier(0.25, 1, 0.5, 1);
      will-change: transform;
    }

    .carousel-slide {
      flex: 0 0 100%;
      min-width: 100%;
      width: 100%;
      height: 100%;
      position: relative;
      opacity: 1;
      visibility: visible;
      display: flex;
      align-items: flex-end; /* ALIGN HERO TEXT TO BOTTOM */
      padding-bottom: 60px; /* Padding above carousel indicators */
    }
    @media (max-width: 768px) {
      .carousel-slide {
        padding-bottom: 48px;
      }
    }

    .slide-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: 85% center; /* Biased toward right-center so subjects on right are preserved */
    }

    @media (max-width: 768px) {
      .slide-img {
        object-position: right center;
      }
    }

    /* Bottom Gradient Overlay: Leaves top 60% of fashion photo bright & unshaded */
    .slide-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        0deg, 
        rgba(0, 0, 0, 0.75) 0%, 
        rgba(0, 0, 0, 0.35) 45%, 
        rgba(0, 0, 0, 0) 80%
      );
      z-index: 2;
    }

    .hero-container {
      position: relative;
      z-index: 3;
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 40px;
      width: 100%;
    }
    @media (max-width: 768px) {
      .hero-container {
        padding: 0 24px;
      }
    }

    .hero-content {
      max-width: 640px;
      color: #FFFFFF;
    }

    .hero-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #F8BBD0;
      background: rgba(159, 61, 98, 0.45);
      border: 1px solid rgba(248, 187, 208, 0.4);
      padding: 6px 14px;
      border-radius: 20px;
      margin-bottom: 12px;
      backdrop-filter: blur(4px);
    }
    @media (max-width: 480px) {
      .hero-badge {
        font-size: 10px;
        padding: 4px 12px;
        margin-bottom: 8px;
      }
    }

    .hero-title {
      font-size: 44px;
      font-weight: 700;
      line-height: 1.15;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
      color: #FFFFFF;
      text-shadow: 0 2px 12px rgba(0,0,0,0.6);
    }
    @media (max-width: 992px) {
      .hero-title { font-size: 34px; }
    }
    @media (max-width: 576px) {
      .hero-title {
        font-size: 24px;
        margin-bottom: 8px;
      }
    }

    .hero-subtitle {
      font-size: 15px;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.95);
      margin-bottom: 22px;
      font-weight: 400;
      text-shadow: 0 1px 4px rgba(0,0,0,0.6);
    }
    @media (max-width: 768px) {
      .hero-subtitle {
        font-size: 13px;
        line-height: 1.4;
        margin-bottom: 16px;
      }
    }

    .hero-cta-group {
      display: flex;
      gap: 14px;
      align-items: center;
      flex-wrap: wrap;
    }

    .btn-hero-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background-color: #9F3D62;
      color: #FFFFFF !important;
      padding: 13px 26px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s ease;
      box-shadow: 0 4px 16px rgba(159, 61, 98, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .btn-hero-primary:hover {
      background-color: #7F2A4C;
      color: #FFFFFF !important;
      transform: translateY(-2px);
      box-shadow: 0 6px 22px rgba(127, 42, 76, 0.6);
    }

    .btn-hero-explore {
      display: inline-flex;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.15);
      color: #FFFFFF !important;
      padding: 13px 24px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      border: 1px solid rgba(255, 255, 255, 0.35);
      backdrop-filter: blur(6px);
      transition: all 0.3s ease;
    }
    .btn-hero-explore:hover {
      background-color: #9F3D62;
      color: #FFFFFF !important;
      transform: translateY(-2px);
      border-color: #FFFFFF;
      box-shadow: 0 6px 22px rgba(159, 61, 98, 0.6);
    }

    @media (max-width: 480px) {
      .btn-hero-primary, .btn-hero-explore {
        padding: 9px 16px;
        font-size: 12px;
        min-height: 38px;
      }
    }

    /* Minimal Bottom Indicators */
    .carousel-indicators {
      position: absolute;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 4;
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 5px 12px;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(8px);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .indicator-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.4);
      border: none;
      cursor: pointer;
      padding: 0;
      transition: all 0.3s ease;
    }
    .indicator-dot:hover {
      background: rgba(255, 255, 255, 0.75);
    }
    .indicator-dot.active {
      width: 20px;
      border-radius: 10px;
      background: #9F3D62;
      box-shadow: 0 0 10px rgba(159, 61, 98, 0.8);
    }
  `]
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  // 4 Required Hero Fashion Slides with Original Uploaded Images & Custom Right-Biased Object Position
  slides: HeroSlide[] = [
    { 
      id: 1, 
      imageUrl: 'https://i.ibb.co/G4bg5wKQ/379a42c6-1c91-404e-8fb6-d04a4689c4a2.png',
      title: 'Elevate Your Ethnic Style',
      subtitle: 'Discover our latest collection of premium handcrafted sarees, kurtis, and designer festive wear tailored for perfection.',
      ctaText: 'Shop New Collection',
      ctaLink: '/shop',
      objectPosition: '85% center'
    },
    { 
      id: 2, 
      imageUrl: 'https://i.ibb.co/TD42QpNd/Chat-GPT-Image-Aug-13-2026-12-50-56-PM.png',
      title: 'Grace & Elegance in Every Thread',
      subtitle: 'Handpicked fabrics, soft watercolor florals, and timeless ethnic silhouettes designed for effortless celebration.',
      ctaText: 'Explore Kurtis & Sets',
      ctaLink: '/shop',
      objectPosition: '80% center'
    },
    { 
      id: 3, 
      imageUrl: 'https://i.ibb.co/5ZcYbZx/Chat-GPT-Image-Aug-13-2026-12-15-54-PM.png',
      title: 'Royal Festive Anarkalis & Co-Ords',
      subtitle: 'Step into joyous occasions with regal flare Anarkalis, intricate embroideries, and modern ethnic two-piece sets.',
      ctaText: 'View Festive Edits',
      ctaLink: '/shop',
      objectPosition: 'center top'
    },
    { 
      id: 4, 
      imageUrl: 'https://i.ibb.co/0yhmLfnt/Chat-GPT-Image-Aug-13-2026-11-59-23-AM.png',
      title: 'Authentic Kerala Kasavu & Tissue Silk',
      subtitle: 'Traditional golden zari Kasavu weaves combined with shimmering tissue silk kurtas for timeless elegance.',
      ctaText: 'Shop Kasavu Series',
      ctaLink: '/shop',
      objectPosition: '85% center'
    }
  ];

  currentIndex = 0;
  timer: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.startAutoSlider();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  /**
   * AUTOMATIC CONTINUOUS LOOPING SLIDER:
   * - Slides automatically once EVERY 1 SECOND (1000ms)
   */
  startAutoSlider() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.stopTimer();

    this.ngZone.runOutsideAngular(() => {
      this.timer = setInterval(() => {
        this.ngZone.run(() => {
          this.currentIndex = (this.currentIndex + 1) % this.slides.length;
          this.cdr.markForCheck();
        });
      }, 1000); // 1-SECOND CONTINUOUS AUTO-SLIDE INTERVAL
    });
  }

  goToSlide(index: number) {
    this.currentIndex = index;
    this.startAutoSlider();
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  onImageError(event: Event) {
    handleImageError(event);
  }
}
