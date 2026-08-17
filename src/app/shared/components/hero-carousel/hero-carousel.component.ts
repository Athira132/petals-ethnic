import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface HeroSlide {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  linkUrl: string;
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
          <!-- Hero Background Image -->
          <div 
            class="slide-bg" 
            [style.backgroundImage]="'url(' + slide.imageUrl + ')'"
          ></div>
          <div class="slide-overlay"></div>

          <!-- Hero Content Overlay -->
          <div class="container slide-container">
            <div class="slide-content" *ngIf="i === currentIndex">
              <span class="slide-subtitle animate-fade-down">{{ slide.subtitle }}</span>
              <h1 class="slide-title animate-fade-up">{{ slide.title }}</h1>
              <div class="slide-cta animate-fade-in">
                <a [routerLink]="slide.linkUrl" class="btn-primary hero-btn">
                  {{ slide.buttonText }}
                  <span class="btn-arrow">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Arrows (Manual Only) -->
      <button class="carousel-arrow prev-arrow" (click)="manualPrev()" aria-label="Previous Slide">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <button class="carousel-arrow next-arrow" (click)="manualNext()" aria-label="Next Slide">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <!-- Pagination Dot Indicators -->
      <div class="carousel-dots">
        <button 
          *ngFor="let slide of slides; let idx = index"
          class="dot-btn"
          [class.active]="idx === currentIndex"
          (click)="goToSlide(idx)"
          [attr.aria-label]="'Go to slide ' + (idx + 1)"
        >
          <span class="dot-inner"></span>
        </button>
      </div>

      <!-- Slide Status Visual Badge -->
      <div class="ping-pong-indicator">
        <span>Slide {{ currentIndex + 1 }} / 4</span>
      </div>
    </section>
  `,
  styles: [`
    .hero-carousel-section {
      position: relative;
      width: 100%;
      height: 72vh;
      min-height: 480px;
      max-height: 750px;
      overflow: hidden;
      background-color: #0D0D0D;
    }
    @media (max-width: 768px) {
      .hero-carousel-section {
        height: 52vh;
        min-height: 380px;
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
      transition: opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1), transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
      transform: scale(1.04);
      z-index: 1;
    }
    .carousel-slide.active {
      opacity: 1;
      visibility: visible;
      transform: scale(1);
      z-index: 2;
    }

    .slide-bg {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center top;
      background-repeat: no-repeat;
    }
    .slide-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        180deg, 
        rgba(0,0,0,0.2) 0%, 
        rgba(0,0,0,0.45) 60%, 
        rgba(0,0,0,0.7) 100%
      );
    }

    .slide-container {
      position: relative;
      z-index: 3;
      height: 100%;
      display: flex;
      align-items: center;
    }
    .slide-content {
      max-width: 600px;
      color: #FFFFFF;
      padding: 32px 0;
    }

    .slide-subtitle {
      display: inline-block;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: var(--color-pink);
      margin-bottom: 12px;
      background: rgba(248, 200, 216, 0.15);
      padding: 6px 14px;
      border-radius: var(--radius-full);
      backdrop-filter: blur(4px);
    }

    .slide-title {
      font-size: 52px;
      font-weight: 700;
      color: #FFFFFF;
      line-height: 1.15;
      margin-bottom: 24px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }

    @media (max-width: 768px) {
      .slide-title {
        font-size: 32px;
      }
    }

    .hero-btn {
      background-color: var(--color-pink);
      color: var(--color-text-heading);
      border: none;
      padding: 16px 36px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 1.5px;
    }
    .hero-btn:hover {
      background-color: #FFFFFF;
      color: var(--color-text-heading);
      box-shadow: 0 8px 24px rgba(255,255,255,0.3);
    }

    /* Animations */
    .animate-fade-down {
      animation: fadeDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .animate-fade-up {
      animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
    }
    .animate-fade-in {
      animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
    }

    @keyframes fadeDown {
      from { opacity: 0; transform: translateY(-16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Arrow Controls */
    .carousel-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      color: #FFFFFF;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition);
      cursor: pointer;
      border: none;
    }
    .carousel-arrow:hover {
      background: rgba(255, 255, 255, 0.8);
      color: var(--color-text-heading);
    }
    .prev-arrow { left: 24px; }
    .next-arrow { right: 24px; }

    @media (max-width: 768px) {
      .carousel-arrow { width: 36px; height: 36px; }
      .prev-arrow { left: 12px; }
      .next-arrow { right: 12px; }
    }

    /* Dots */
    .carousel-dots {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
      display: flex;
      gap: 12px;
    }
    .dot-btn {
      width: 32px;
      height: 8px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      cursor: pointer;
    }
    .dot-inner {
      width: 100%;
      height: 4px;
      background-color: rgba(255, 255, 255, 0.4);
      border-radius: 2px;
      transition: var(--transition);
    }
    .dot-btn.active .dot-inner {
      background-color: var(--color-pink);
      height: 6px;
      box-shadow: 0 0 10px rgba(248, 200, 216, 0.8);
    }

    .ping-pong-indicator {
      position: absolute;
      bottom: 24px;
      right: 24px;
      z-index: 10;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      color: rgba(255, 255, 255, 0.8);
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 1px;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
  `]
})
export class HeroCarouselComponent {
  slides: HeroSlide[] = [
    {
      id: 1,
      imageUrl: 'https://i.ibb.co/G4bg5wKQ/379a42c6-1c91-404e-8fb6-d04a4689c4a2.png',
      title: 'Graceful Royal Festive Anarkalis',
      subtitle: 'Festive & Bridal Edit 2026',
      buttonText: 'Explore Anarkalis',
      linkUrl: '/shop'
    },
    {
      id: 2,
      imageUrl: 'https://i.ibb.co/TD42QpNd/Chat-GPT-Image-Aug-13-2026-12-50-56-PM.png',
      title: 'Modern Soft Drapes & A-Line Midi Dresses',
      subtitle: 'Chic Everyday Couture',
      buttonText: 'Shop Midi Collection',
      linkUrl: '/shop'
    },
    {
      id: 3,
      imageUrl: 'https://i.ibb.co/5ZcYbZx/Chat-GPT-Image-Aug-13-2026-12-15-54-PM.png',
      title: 'Traditional Kasavu & Silk Kurtas',
      subtitle: 'Heritage Craftsmanship',
      buttonText: 'Shop Silk Kurtas',
      linkUrl: '/shop'
    },
    {
      id: 4,
      imageUrl: 'https://i.ibb.co/0yhmLfnt/Chat-GPT-Image-Aug-13-2026-11-59-23-AM.png',
      title: 'Floral Hand-Printed Kurtis & Co-ord Sets',
      subtitle: 'Contemporary Ethnic Glamour',
      buttonText: 'Discover Co-ords',
      linkUrl: '/shop'
    }
  ];

  currentIndex = 0;

  manualNext() {
    if (this.currentIndex < this.slides.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
  }

  manualPrev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.slides.length - 1;
    }
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }
}
