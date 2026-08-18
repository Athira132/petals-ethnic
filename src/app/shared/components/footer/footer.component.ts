import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="site-footer">
      <div class="container footer-container">
        <!-- Brand Column -->
        <div class="footer-col brand-col">
          <div class="footer-brand">
            <div class="footer-logo-circle">
              <img src="https://i.ibb.co/GQ2GstYF/Whats-App-Image-2026-08-13-at-10-59-05-AM.jpg" alt="Petals Ethnic Logo" class="footer-logo-img" />
            </div>
            <span class="footer-brand-title">PETALS ETHNIC</span>
          </div>
          <p class="footer-brand-quote">
            "Step up your style with our latest fashion collection. We offer premium quality fabrics and trendy designs that fit every occasion."
          </p>
          <!-- Official Social Icons -->
          <div class="footer-socials">
            <a href="https://www.instagram.com/petalsethnic" target="_blank" rel="noopener" class="social-icon-btn" title="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://www.facebook.com/share/1CZHBSGW22/" target="_blank" rel="noopener" class="social-icon-btn" title="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/>
              </svg>
            </a>
            <a href="https://wa.me/918113899319" target="_blank" rel="noopener" class="social-icon-btn" title="WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.333 5.001l-1.416 5.174 5.299-1.389c1.464.798 3.114 1.218 4.774 1.218h.004c5.506 0 9.989-4.478 9.99-9.984 0-2.669-1.038-5.176-2.925-7.062-1.887-1.886-4.394-2.924-7.064-2.924zm5.82 14.281c-.244.687-1.42 1.312-1.957 1.393-.49.074-1.127.106-1.815-.115-.418-.134-.956-.31-1.657-.615-2.955-1.282-4.887-4.281-5.035-4.479-.148-.198-1.205-1.604-1.205-3.059 0-1.455.762-2.172 1.033-2.464.271-.292.593-.365.791-.365.198 0 .396.002.568.01.185.009.432-.07.676.516.244.587.834 2.036.907 2.184.073.148.122.321.024.516-.098.196-.148.318-.293.49-.148.171-.31.382-.443.513-.148.148-.303.31-.131.606.171.296.76 1.256 1.632 2.033 1.123.999 2.07 1.309 2.366 1.457.296.148.469.124.642-.074.173-.198.742-.865.94-1.162.198-.296.396-.247.668-.148.271.098 1.727.815 2.023.963.296.148.494.222.568.346.074.123.074.715-.17 1.402z"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Quick Links Column -->
        <div class="footer-col">
          <h4 class="footer-heading">Quick Links</h4>
          <ul class="footer-links">
            <li><a routerLink="/">Home</a></li>
            <li><a routerLink="/shop">Shop Collection</a></li>
            <li><a routerLink="/categories">Categories</a></li>
            <li><a routerLink="/about">About Us</a></li>
            <li><a routerLink="/contact">Contact Us</a></li>
          </ul>
        </div>

        <!-- Customer Care Column -->
        <div class="footer-col">
          <h4 class="footer-heading">Customer Care</h4>
          <p class="footer-care-text">We are here to help you with product information, orders, and inquiries.</p>
          <ul class="contact-info-list">
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <a href="https://wa.me/918113899319" target="_blank">+91 81138 99319</a>
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <a href="mailto:petalsethnic@gmail.com">petalsethnic@gmail.com</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="footer-bottom">
        <div class="container footer-bottom-content">
          <p>© 2026 Petals Ethnic. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .site-footer {
      background-color: var(--color-text-heading);
      color: #E0E0E0;
      padding-top: 60px;
      font-size: 14px;
    }
    .footer-container {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 48px;
      padding-bottom: 48px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    @media (max-width: 992px) {
      .footer-container {
        grid-template-columns: 1fr;
        gap: 32px;
      }
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .footer-logo-circle {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: 1.5px solid var(--color-gold);
      overflow: hidden;
      background: #FFFFFF;
    }
    .footer-logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .footer-brand-title {
      font-family: var(--font-heading);
      font-size: 18px;
      font-weight: 700;
      color: #FFFFFF;
      letter-spacing: 1px;
    }
    .footer-brand-quote {
      font-size: 13px;
      color: #AAAAAA;
      line-height: 1.6;
      margin-bottom: 20px;
      max-width: 400px;
    }

    .footer-socials {
      display: flex;
      gap: 12px;
    }
    .social-icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.1);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition);
    }
    .social-icon-btn:hover {
      background-color: var(--color-pink-dark);
      color: #FFFFFF;
      transform: translateY(-2px);
    }

    .footer-heading {
      font-size: 15px;
      font-weight: 600;
      color: #FFFFFF;
      letter-spacing: 0.5px;
      margin-bottom: 20px;
    }
    .footer-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .footer-links a {
      color: #BBBBBB;
      transition: var(--transition);
    }
    .footer-links a:hover {
      color: var(--color-pink);
    }

    .footer-care-text {
      font-size: 13px;
      color: #AAAAAA;
      margin-bottom: 16px;
      line-height: 1.5;
    }
    .contact-info-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .contact-info-list li {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #CCCCCC;
      font-size: 13px;
    }
    .contact-info-list a {
      color: #CCCCCC;
      transition: var(--transition);
    }
    .contact-info-list a:hover {
      color: var(--color-pink);
    }

    .footer-bottom {
      padding: 20px 0;
      background-color: #050505;
      font-size: 12px;
      color: #888888;
    }
    .footer-bottom-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    @media (max-width: 576px) {
      .footer-bottom-content {
        flex-direction: column;
        gap: 8px;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {}
