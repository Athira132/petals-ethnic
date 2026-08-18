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
          <!-- Background Image -->
          <div 
            class="slide-bg" 
            [style.backgroundImage]="'url(' + slide.imageUrl + ')'"
          ></div>

          <!-- Subtle Dark Gradient Overlay for High Contrast -->
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
      height: 56vh;
      min-height: 420px;
      max-height: 520px;
      overflow: hidden;
      background-color: #0D0D0D;
    }
    @media (max-width: 768px) {
      .hero-carousel-section {
        height: 45vh;
        min-height: 340px;
        max-height: 400px;
      }
    }
    @media (max-width: 480px) {
      .hero-carousel-section {
        height: 42vh;
        min-height: 320px;
        max-height: 360px;
      }
    }

    .carousel-track {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .carousel-slide {
      position: absolute;
      inset: 0;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1;
      display: flex;
      align-items: center;
    }
    .carousel-slide.active {
      opacity: 1;
      visibility: visible;
      z-index: 2;
    }

    .slide-bg {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center top;
      background-repeat: no-repeat;
    }

    /* High-Contrast Gradient Overlay */
    .slide-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg, 
        rgba(0, 0, 0, 0.75) 0%, 
        rgba(0, 0, 0, 0.48) 50%, 
        rgba(0, 0, 0, 0.22) 100%
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
        padding: 0 20px;
      }
    }

    .hero-content {
      max-width: 540px;
      color: #FFFFFF;
      animation: fadeInUp 0.6s ease-out forwards;
    }

    .hero-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #F8BBD0;
      background: rgba(159, 61, 98, 0.3);
      border: 1px solid rgba(248, 187, 208, 0.4);
      padding: 4px 12px;
      border-radius: 16px;
      margin-bottom: 12px;
      backdrop-filter: blur(4px);
    }
    @media (max-width: 480px) {
      .hero-badge {
        font-size: 9px;
        padding: 3px 10px;
        margin-bottom: 8px;
      }
    }

    .hero-title {
      font-size: 36px;
      font-weight: 700;
      line-height: 1.15;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
      color: #FFFFFF;
      text-shadow: 0 2px 10px rgba(0,0,0,0.6);
    }
    @media (max-width: 768px) {
      .hero-title {
        font-size: 24px;
        margin-bottom: 8px;
      }
    }
    @media (max-width: 480px) {
      .hero-title {
        font-size: 20px;
        margin-bottom: 6px;
      }
    }

    .hero-subtitle {
      font-size: 14px;
      line-height: 1.45;
      color: rgba(255, 255, 255, 0.95);
      margin-bottom: 22px;
      font-weight: 400;
      text-shadow: 0 1px 4px rgba(0,0,0,0.6);
    }
    @media (max-width: 768px) {
      .hero-subtitle {
        font-size: 12px;
        line-height: 1.35;
        margin-bottom: 16px;
      }
    }
    @media (max-width: 480px) {
      .hero-subtitle {
        font-size: 11px;
        margin-bottom: 14px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .hero-cta-group {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }

    .btn-hero-primary {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background-color: #9F3D62;
      color: #FFFFFF !important;
      padding: 12px 24px;
      border-radius: 30px;
      font-size: 13px;
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
      padding: 12px 22px;
      border-radius: 30px;
      font-size: 13px;
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
        padding: 9px 16px;
        font-size: 11px;
        min-height: 38px;
      }
    }

    /* Minimal Unobtrusive Bottom Indicators */
    .carousel-indicators {
      position: absolute;
      bottom: 16px;
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

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(15px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
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

  ngOnInit() {
    this.startAutoSlider();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  /**
   * AUTOMATIC CONTINUOUS LOOPING SLIDER (EVERY 2 SECONDS = 2000MS)
   */
  startAutoSlider() {
    this.stopTimer();
    this.timer = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    }, 2000); // 2 SECONDS AUTOMATIC INTERVAL
  }

  goToSlide(index: number) {
    this.currentIndex = index;
    this.startAutoSlider(); // Reset 2s timer on manual click
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
