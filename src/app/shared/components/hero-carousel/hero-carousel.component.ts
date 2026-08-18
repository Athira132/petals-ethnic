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

          <!-- Subtle Gradient Overlay for Readability -->
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
    </section>
  `,
  styles: [`
    .hero-carousel-section {
      position: relative;
      width: 100%;
      height: 75vh;
      min-height: 480px;
      max-height: 750px;
      overflow: hidden;
      background-color: #0D0D0D;
    }
    @media (max-width: 768px) {
      .hero-carousel-section {
        height: 58vh;
        min-height: 400px;
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
      transition: opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1);
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

    /* Subtle Dark Gradient Overlay for High Contrast */
    .slide-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg, 
        rgba(0, 0, 0, 0.72) 0%, 
        rgba(0, 0, 0, 0.45) 50%, 
        rgba(0, 0, 0, 0.20) 100%
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
      max-width: 580px;
      color: #FFFFFF;
      animation: fadeInUp 0.8s ease-out forwards;
    }

    .hero-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #F8BBD0;
      background: rgba(159, 61, 98, 0.25);
      border: 1px solid rgba(248, 187, 208, 0.4);
      padding: 6px 14px;
      border-radius: 20px;
      margin-bottom: 16px;
      backdrop-filter: blur(4px);
    }

    .hero-title {
      font-size: 42px;
      font-weight: 700;
      line-height: 1.15;
      margin-bottom: 16px;
      letter-spacing: -0.5px;
      color: #FFFFFF;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }
    @media (max-width: 768px) {
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

    /* High Visibility Dark Pink Explore Button */
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
        padding: 12px 20px;
        font-size: 13px;
        min-height: 44px;
      }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  // 4 Required Hero Fashion Slides with Original Designed Content
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
  // Ping Pong Direction State: +1 = forward (0 -> 1 -> 2 -> 3), -1 = backward (3 -> 2 -> 1 -> 0)
  direction: 1 | -1 = 1;
  timer: any;

  ngOnInit() {
    this.startAutoPingPong();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  startAutoPingPong() {
    this.stopTimer();
    this.timer = setInterval(() => {
      this.stepPingPong();
    }, 3000); // 3 SECONDS AUTOMATIC INTERVAL
  }

  /**
   * PING-PONG AUTOMATIC SLIDE SEQUENCE:
   * 0 (Img 1) -> 1 (Img 2) -> 2 (Img 3) -> 3 (Img 4)
   * Reaches 3 -> direction switches to -1
   * 3 (Img 4) -> 2 (Img 3) -> 1 (Img 2) -> 0 (Img 1)
   * Reaches 0 -> direction switches to +1
   * NEVER jumps 3 -> 0 directly.
   */
  stepPingPong() {
    if (this.direction === 1) {
      if (this.currentIndex < this.slides.length - 1) {
        this.currentIndex++;
      } else {
        // Reached Image 4 (Index 3), reverse direction backward
        this.direction = -1;
        this.currentIndex--;
      }
    } else {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      } else {
        // Reached Image 1 (Index 0), reverse direction forward
        this.direction = 1;
        this.currentIndex++;
      }
    }
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
