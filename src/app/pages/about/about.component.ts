import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="about-page">
      <!-- Full Width Visual Header Banner -->
      <section class="about-hero-banner">
        <img src="https://i.ibb.co/7d3T6dxp/Whats-App-Image-2026-08-13-at-12-31-11-PM-1.jpg" alt="Petals Ethnic Hero" class="about-hero-img" />
        <div class="about-hero-overlay"></div>
        <div class="container about-hero-container">
          <span class="about-hero-subtitle">HERITAGE & ELEGANCE</span>
          <h1 class="about-hero-title">About Petals Ethnic</h1>
        </div>
      </section>

      <!-- Main About Content -->
      <section class="section about-story-section">
        <div class="container text-center max-w-800">
          <h2 class="section-title">Our Fashion Philosophy</h2>
          <p class="about-lead">
            Welcome to Petals Ethnic! Step up your style with our latest fashion collection. We offer premium quality fabrics and trendy designs that fit every occasion. Let us know what you are looking for, and we'll be happy to help you find the best outfit!
          </p>
        </div>
      </section>

      <!-- Full-Width Visual Showcase Image Banner -->
      <section class="full-width-showcase">
        <img src="https://i.ibb.co/7tQbhHpZ/Whats-App-Image-2026-08-13-at-12-31-11-PM-2.jpg" alt="Petals Ethnic Fashion Craftsmanship" class="showcase-img" />
      </section>

      <!-- Brand Pillars -->
      <section class="section pillars-section">
        <div class="container">
          <div class="pillars-grid">
            <div class="pillar-card">
              <div class="pillar-icon-box">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <h3>Premium Quality Fabrics</h3>
              <p>Hand-picked tissue silks, pure cottons, georgettes, and delicate drapes tailored for comfort and elegance.</p>
            </div>

            <div class="pillar-card">
              <div class="pillar-icon-box">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <h3>Trendy Festive Designs</h3>
              <p>Contemporary ethnic silhouettes from graceful royal Anarkalis to modern A-line midi dresses and co-ord sets.</p>
            </div>

            <div class="pillar-card">
              <div class="pillar-icon-box">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h3>Personalized Styling</h3>
              <p>Direct shopping assistance and custom size guidance available through our dedicated WhatsApp hotline.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .about-hero-banner {
      position: relative;
      width: 100%;
      height: 50vh;
      min-height: 360px;
      display: flex;
      align-items: center;
      overflow: hidden;
      background-color: #0D0D0D;
    }
    .about-hero-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .about-hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%);
    }
    .about-hero-container {
      position: relative;
      z-index: 2;
      color: #FFFFFF;
      text-align: center;
    }
    .about-hero-subtitle {
      display: inline-block;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 3px;
      color: var(--color-pink);
      margin-bottom: 12px;
    }
    .about-hero-title {
      font-size: 48px;
      color: #FFFFFF;
    }
    @media (max-width: 768px) {
      .about-hero-title { font-size: 32px; }
    }

    .section { padding: 64px 0; }
    .text-center { text-align: center; }
    .max-w-800 { max-width: 800px; margin: 0 auto; }

    .about-lead {
      font-size: 18px;
      line-height: 1.8;
      color: var(--color-muted);
      font-style: italic;
    }

    /* Full Width Image Showcase */
    .full-width-showcase {
      width: 100%;
      height: 550px;
      overflow: hidden;
    }
    .showcase-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    @media (max-width: 768px) {
      .full-width-showcase { height: 320px; }
    }

    /* Pillars */
    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 32px;
    }
    @media (max-width: 992px) {
      .pillars-grid { grid-template-columns: 1fr; }
    }
    .pillar-card {
      background: var(--color-bg-alt);
      padding: 40px 32px;
      border-radius: var(--radius-md);
      text-align: center;
      border: 1px solid var(--color-border-light);
    }
    .pillar-icon-box {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--color-pink-light);
      color: var(--color-pink-dark);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px auto;
    }
    .pillar-card h3 {
      font-size: 20px;
      margin-bottom: 12px;
    }
    .pillar-card p {
      font-size: 14px;
      color: var(--color-muted);
      line-height: 1.6;
    }
  `]
})
export class AboutComponent {}
