import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="about-page">
      <!-- Header Banner -->
      <div class="about-header-banner">
        <div class="container">
          <span class="about-tag">AUTHENTIC BOUTIQUE HERITAGE</span>
          <h1 class="about-header-title">About Petals Ethnic</h1>
          <p class="about-header-subtitle">Celebrating Indian craftsmanship, soft watercolor florals, and timeless ethnic drapes.</p>
        </div>
      </div>

      <!-- Main Two-Column Premium Photo + Text Composition -->
      <section class="section about-main-section">
        <div class="container">
          <div class="about-composition-grid">
            <!-- Left Side: High Quality Image (Positioned Center Top) -->
            <div class="about-photo-frame">
              <img 
                src="https://i.ibb.co/7N2bJC2X/Whats-App-Image-2026-08-13-at-12-31-10-PM-1.jpg" 
                alt="Petals Ethnic Boutique Heritage" 
                class="about-photo-img" 
              />
              <div class="photo-badge">
                <span>PETALS ETHNIC BOUTIQUE</span>
              </div>
            </div>

            <!-- Right Side: Heading & Introduction -->
            <div class="about-text-content">
              <span class="section-subtitle">OUR FASHION PHILOSOPHY</span>
              <h2 class="about-heading">Crafting Timeless Ethnic Elegance</h2>
              
              <p class="about-lead">
                Welcome to Petals Ethnic! Step up your style with our latest fashion collection of handcrafted Kurtis, Anarkalis, Tissue Silk Kasavu, Co-ord Sets, and Midi Dresses tailored for perfection.
              </p>

              <p class="about-body-text">
                We offer premium quality breathable fabrics, soft watercolor botanical prints, and intricate embroidery that fit every celebration. Whether you are seeking a traditional saree for a sacred ritual or a modern two-piece co-ord set for an evening festive edit, our boutique silhouettes ensure effortless comfort and regal flair.
              </p>

              <p class="about-body-text">
                Let us know what you are looking for, and our fashion stylists will be happy to help you find the best outfit tailored to your size preferences!
              </p>

              <div class="about-cta-group">
                <a routerLink="/shop" class="btn-primary">Explore Our Collection &rarr;</a>
                <a href="https://wa.me/918113899319?text=Hello%20Petals%20Ethnic,%20I%20would%20like%20to%20know%20more%20about%20your%20boutique." target="_blank" rel="noopener" class="btn-outline">Styling Advice on WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Brand Pillars Section -->
      <section class="section pillars-section">
        <div class="container">
          <div class="section-header text-center">
            <span class="section-subtitle">WHY CHOOSE US</span>
            <h2 class="section-title">The Petals Ethnic Promise</h2>
            <p class="section-desc">Our commitment to quality, authenticity, and personalized boutique care.</p>
          </div>

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
    .about-header-banner {
      position: relative;
      background: linear-gradient(rgba(0,0,0,0.68), rgba(0,0,0,0.68)), url('https://i.ibb.co/7d3T6dxp/Whats-App-Image-2026-08-13-at-12-31-11-PM-1.jpg') center/cover no-repeat;
      padding: 60px 20px;
      text-align: center;
      color: #FFFFFF;
    }
    .about-tag {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2.5px;
      color: #F8BBD0;
      margin-bottom: 12px;
    }
    .about-header-title {
      font-size: 38px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 8px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }
    .about-header-subtitle {
      font-size: 15px;
      color: rgba(255, 255, 255, 0.9);
      text-shadow: 0 1px 4px rgba(0,0,0,0.5);
    }
    @media (max-width: 768px) {
      .about-header-banner { padding: 40px 16px; }
      .about-header-title { font-size: 26px; }
      .about-header-subtitle { font-size: 13px; }
    }

    .section { padding: 64px 0; }
    .text-center { text-align: center; }

    /* Main Two-Column Composition */
    .about-composition-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 56px;
      align-items: center;
    }
    @media (max-width: 992px) {
      .about-composition-grid {
        grid-template-columns: 1fr;
        gap: 32px;
      }
    }

    .about-photo-frame {
      position: relative;
      width: 100%;
      max-width: 520px;
      margin: 0 auto;
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
      border: 1px solid var(--color-border);
    }
    .about-photo-img {
      width: 100%;
      height: 520px;
      object-fit: cover;
      object-position: center top; /* Subject visible from top without zoom */
      display: block;
      transition: transform 0.6s ease;
    }
    .about-photo-frame:hover .about-photo-img {
      transform: scale(1.03);
    }
    @media (max-width: 768px) {
      .about-photo-img { height: 360px; }
    }

    .photo-badge {
      position: absolute;
      bottom: 20px;
      left: 20px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #9F3D62;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .about-text-content {
      padding: 10px 0;
    }
    .about-heading {
      font-size: 36px;
      font-weight: 700;
      color: var(--color-text-heading);
      margin-bottom: 20px;
      line-height: 1.2;
    }
    @media (max-width: 768px) {
      .about-heading { font-size: 26px; }
    }

    .about-lead {
      font-size: 17px;
      line-height: 1.6;
      color: var(--color-text);
      font-weight: 500;
      margin-bottom: 16px;
    }

    .about-body-text {
      font-size: 15px;
      line-height: 1.65;
      color: var(--color-muted);
      margin-bottom: 16px;
    }

    .about-cta-group {
      display: flex;
      gap: 14px;
      margin-top: 28px;
      flex-wrap: wrap;
    }

    /* Pillars */
    .pillars-section {
      background-color: #FAF8F6;
      border-top: 1px solid var(--color-border-light);
    }
    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 32px;
    }
    @media (max-width: 992px) {
      .pillars-grid { grid-template-columns: 1fr; }
    }
    .pillar-card {
      background: #FFFFFF;
      padding: 40px 32px;
      border-radius: var(--radius-md);
      text-align: center;
      border: 1px solid var(--color-border-light);
      box-shadow: var(--shadow-sm);
    }
    .pillar-icon-box {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--color-pink-light);
      color: #9F3D62;
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
