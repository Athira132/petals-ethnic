import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="about-page">
      <div class="about-hero">
        <div class="container text-center">
          <span class="section-subtitle">THE PETALS ETHNIC STORY</span>
          <h1 class="about-hero-title">Timeless Luxury Indian Fashion</h1>
          <p class="about-hero-sub">Empowering style with soft fabrics, fine drapes, and traditional craftsmanship.</p>
        </div>
      </div>

      <div class="container section">
        <div class="about-grid">
          <div class="about-text-content">
            <h2 class="section-title">Our Boutique Vision</h2>
            <p class="quote-box">
              "Welcome to Petals Ethnic! Step up your style with our latest fashion collection. We offer premium quality fabrics and trendy designs that fit every occasion. Let us know what you are looking for, and we'll be happy to help you find the best outfit!"
            </p>
            <p class="body-p">
              Petals Ethnic was founded with a passion for recreating authentic Indian ethnic couture for modern women. From hand-printed floral Kurtis and flowing Anarkalis to shimmering Kasavu tissue silk kurtas, our curated designs combine grace with comfort.
            </p>
            <p class="body-p">
              Every outfit in our collection undergoes strict quality inspections to ensure rich texture, vibrant colors, and durable stitching.
            </p>
          </div>
          <div class="about-img-group">
            <img src="https://i.ibb.co/7d3T6dxp/Whats-App-Image-2026-08-13-at-12-31-11-PM-1.jpg" alt="About Petals Ethnic" class="about-main-img" />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .about-hero {
      background-color: var(--color-bg-alt);
      padding: 60px 0;
      border-bottom: 1px solid var(--color-border-light);
    }
    .text-center { text-align: center; }
    .about-hero-title { font-size: 42px; margin-bottom: 8px; }
    .about-hero-sub { font-size: 16px; color: var(--color-muted); }
    .section { padding: 80px 0; }
    .about-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
    }
    @media (max-width: 992px) {
      .about-grid { grid-template-columns: 1fr; gap: 32px; }
    }
    .quote-box {
      font-style: italic;
      font-size: 17px;
      line-height: 1.6;
      color: #C05676;
      border-left: 4px solid var(--color-pink);
      padding-left: 20px;
      margin-bottom: 24px;
    }
    .body-p {
      font-size: 15px;
      line-height: 1.7;
      color: var(--color-text);
      margin-bottom: 16px;
    }
    .about-main-img {
      width: 100%;
      height: 480px;
      object-fit: cover;
      border-radius: var(--radius-lg);
    }
  `]
})
export class AboutComponent {}
