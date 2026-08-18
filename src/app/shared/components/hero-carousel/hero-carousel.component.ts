import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface HeroSlide {
  id: number;
  imageUrl: string;
}

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="hero-carousel-section">
      <div class="carousel-track">
        <div 
          *ngFor="let slide of slides; let i = index"
          class="carousel-slide"
          [class.active]="i === currentIndex"
        >
          <!-- Clean Hero Fashion Image -->
          <div 
            class="slide-bg" 
            [style.backgroundImage]="'url(' + slide.imageUrl + ')'"
          ></div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-carousel-section {
      position: relative;
      width: 100%;
      height: 70vh;
      min-height: 420px;
      max-height: 720px;
      overflow: hidden;
      background-color: #0D0D0D;
    }
    @media (max-width: 768px) {
      .hero-carousel-section {
        height: 48vh;
        min-height: 320px;
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
  `]
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  // 4 Required Hero Fashion Images
  slides: HeroSlide[] = [
    { id: 1, imageUrl: 'https://i.ibb.co/G4bg5wKQ/379a42c6-1c91-404e-8fb6-d04a4689c4a2.png' },
    { id: 2, imageUrl: 'https://i.ibb.co/TD42QpNd/Chat-GPT-Image-Aug-13-2026-12-50-56-PM.png' },
    { id: 3, imageUrl: 'https://i.ibb.co/5ZcYbZx/Chat-GPT-Image-Aug-13-2026-12-15-54-PM.png' },
    { id: 4, imageUrl: 'https://i.ibb.co/0yhmLfnt/Chat-GPT-Image-Aug-13-2026-11-59-23-AM.png' }
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
