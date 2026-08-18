import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface HeroSlide {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="hero-carousel-section">
      <div class="carousel-track">
        <div 
          *ngFor="let slide of slides; let i = index"
          class="carousel-slide"
          [class.active]="i === currentIndex"
        >
          <!-- Background Image with Hardware-Accelerated Rendering -->
          <div 
            class="slide-bg" 
            [style.backgroundImage]="'url(' + slide.imageUrl + ')'"
          ></div>

          <!-- Ultra-Light Subtle Gradient Overlay Behind Text -->
          <div class="slide-overlay"></div>

          <!-- Premium Designed Hero Content -->
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
    /* 85-90% Viewport Height Hero Banner */
    .hero-carousel-section {
      position: relative;
      width: 100%;
      height: 88vh;
      min-height: 600px;
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
      position: relative;
      width: 100%;
      height: 100%;
    }

    /* Ultra-Fast 300ms GPU-Accelerated Transition (No Delay or Blank Frames) */
    .carousel-slide {
      position: absolute;
      inset: 0;
      opacity: 0;
      visibility: hidden;
      transition: opacity 300ms cubic-bezier(0.25, 1, 0.5, 1), transform 300ms cubic-bezier(0.25, 1, 0.5, 1);
      transform: scale(1.02) translateZ(0);
      will-change: opacity, transform;
      z-index: 1;
      display: flex;
      align-items: center;
    }
    .carousel-slide.active {
      opacity: 1;
      visibility: visible;
      transform: scale(1) translateZ(0);
      z-index: 2;
    }

    .slide-bg {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center top;
      background-repeat: no-repeat;
      transform: translateZ(0);
    }

    /* Ultra-Light Subtle Gradient Overlay Behind Text Only for Maximum Brightness */
    .slide-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg, 
        rgba(0, 0, 0, 0.35) 0%, 
        rgba(0, 0, 0, 0.12) 45%, 
        rgba(0, 0, 0, 0) 100%
      );
      z-index: 2;
    }

    /* Hero Text & Button Container */
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
      max-width: 600px;
      color: #FFFFFF;
    }

    .hero-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #F8BBD0;
      background: rgba(159, 61, 98, 0.35);
      border: 1px solid rgba(248, 187, 208, 0.4);
      padding: 6px 14px;
      border-radius: 20px;
      margin-bottom: 16px;
      backdrop-filter: blur(4px);
    }
    @media (max-width: 480px) {
      .hero-badge {
        font-size: 10px;
        padding: 4px 12px;
        margin-bottom: 10px;
      }
    }

    .hero-title {
      font-size: 46px;
      font-weight: 700;
      line-height: 1.15;
      margin-bottom: 16px;
      letter-spacing: -0.5px;
      color: #FFFFFF;
      text-shadow: 0 2px 12px rgba(0,0,0,0.6);
    }
    @media (max-width: 992px) {
      .hero-title { font-size: 36px; }
    }
    @media (max-width: 576px) {
      .hero-title {
        font-size: 26px;
        margin-bottom: 10px;
      }
    }

    .hero-subtitle {
      font-size: 16px;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.95);
      margin-bottom: 28px;
      font-weight: 400;
      text-shadow: 0 1px 4px rgba(0,0,0,0.6);
    }
    @media (max-width: 768px) {
      .hero-subtitle {
        font-size: 13px;
        line-height: 1.4;
        margin-bottom: 20px;
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
      padding: 14px 28px;
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
      background-color: #9F3D62;
      color: #FFFFFF !important;
      padding: 14px 26px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 4px 16px rgba(159, 61, 98, 0.4);
      transition: all 0.3s ease;
    }
    .btn-hero-explore:hover {
      background-color: #7F2A4C;
      color: #FFFFFF !important;
      transform: translateY(-2px);
      border-color: #FFFFFF;
      box-shadow: 0 6px 22px rgba(127, 42, 76, 0.6);
    }

    @media (max-width: 480px) {
      .btn-hero-primary, .btn-hero-explore {
        padding: 10px 18px;
        font-size: 12px;
        min-height: 40px;
      }
    }

    /* Minimal Unobtrusive Bottom Indicators */
    .carousel-indicators {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 4;
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 6px 14px;
      background: rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(8px);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .indicator-dot {
      width: 10px;
      height: 10px;
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
      width: 24px;
      border-radius: 12px;
      background: #9F3D62;
      box-shadow: 0 0 10px rgba(159, 61, 98, 0.8);
    }
  `]
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  // 4 Required Hero Fashion Slides with Original Uploaded Images & Content
  slides: HeroSlide[] = [
    { 
      id: 1, 
      imageUrl: 'https://i.ibb.co/G4bg5wKQ/379a42c6-1c91-404e-8fb6-d04a4689c4a2.png',
      title: 'Elevate Your Ethnic Style',
      subtitle: 'Discover our latest collection of premium handcrafted sarees, kurtis, and designer festive wear tailored for perfection.',
      ctaText: 'Shop New Collection',
      ctaLink: '/shop'
    },
    { 
      id: 2, 
      imageUrl: 'https://i.ibb.co/TD42QpNd/Chat-GPT-Image-Aug-13-2026-12-50-56-PM.png',
      title: 'Grace & Elegance in Every Thread',
      subtitle: 'Handpicked fabrics, soft watercolor florals, and timeless ethnic silhouettes designed for effortless celebration.',
      ctaText: 'Explore Kurtis & Sets',
      ctaLink: '/shop'
    },
    { 
      id: 3, 
      imageUrl: 'https://i.ibb.co/5ZcYbZx/Chat-GPT-Image-Aug-13-2026-12-15-54-PM.png',
      title: 'Royal Festive Anarkalis & Co-Ords',
      subtitle: 'Step into joyous occasions with regal flare Anarkalis, intricate embroideries, and modern ethnic two-piece sets.',
      ctaText: 'View Festive Edits',
      ctaLink: '/shop'
    },
    { 
      id: 4, 
      imageUrl: 'https://i.ibb.co/0yhmLfnt/Chat-GPT-Image-Aug-13-2026-11-59-23-AM.png',
      title: 'Authentic Kerala Kasavu & Tissue Silk',
      subtitle: 'Traditional golden zari Kasavu weaves combined with shimmering tissue silk kurtas for timeless elegance.',
      ctaText: 'Shop Kasavu Series',
      ctaLink: '/shop'
    }
  ];

  currentIndex = 0;
  timer: any;
  initialTimeout: any;

  ngOnInit() {
    this.preloadSlideImages();
    this.startAutoSlider();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  /**
   * Preload all 4 hero images upfront in browser memory so slide transitions are instant (0ms delay)
   */
  preloadSlideImages() {
    if (typeof window !== 'undefined') {
      this.slides.forEach(slide => {
        const img = new Image();
        img.src = slide.imageUrl;
      });
    }
  }

  /**
   * AUTOMATIC CONTINUOUS LOOPING SLIDER:
   * - 1st transition starts after EXACTLY 1 SECOND (1000ms)
   * - Subsequent transitions repeat every 2 SECONDS (2000ms)
   */
  startAutoSlider() {
    this.stopTimer();
    this.initialTimeout = setTimeout(() => {
      this.currentIndex = 1;
      this.timer = setInterval(() => {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
      }, 2000);
    }, 1000);
  }

  goToSlide(index: number) {
    this.currentIndex = index;
    this.startAutoSlider();
  }

  stopTimer() {
    if (this.initialTimeout) {
      clearTimeout(this.initialTimeout);
      this.initialTimeout = null;
    }
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
