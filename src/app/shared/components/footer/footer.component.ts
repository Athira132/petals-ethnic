import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="site-footer">
      <div class="container footer-grid">
        <!-- Brand Info Column -->
        <div class="footer-col brand-col">
          <div class="footer-logo">
            <img src="https://i.ibb.co/d4SMQvxj/Whats-App-Image-2026-08-13-at-10-59-05-AM.jpg" alt="Petals Ethnic Logo" class="footer-logo-img" />
            <span class="footer-brand-title">PETALS ETHNIC</span>
          </div>
          <p class="brand-quote">
            "Welcome to Petals Ethnic! Step up your style with our latest fashion collection. We offer premium quality fabrics and trendy designs that fit every occasion. Let us know what you are looking for, and we'll be happy to help you find the best outfit!"
          </p>
          <div class="social-links">
            <a href="https://www.instagram.com/petalsethnic" target="_blank" rel="noopener" class="social-btn" title="Instagram">
              📸 Instagram
            </a>
            <a href="https://www.facebook.com/share/1CZHBSGW22/" target="_blank" rel="noopener" class="social-btn" title="Facebook">
              👍 Facebook
            </a>
            <a href="https://wa.me/918113899319" target="_blank" rel="noopener" class="social-btn wa" title="WhatsApp">
              💬 WhatsApp
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="footer-col">
          <h4 class="footer-heading">Quick Links</h4>
          <ul class="footer-links">
            <li><a routerLink="/">Home</a></li>
            <li><a routerLink="/shop">Shop Collection</a></li>
            <li><a routerLink="/categories">All Categories</a></li>
            <li><a routerLink="/about">About Petals Ethnic</a></li>
            <li><a routerLink="/contact">Contact Us</a></li>
          </ul>
        </div>

        <!-- Shop Categories -->
        <div class="footer-col">
          <h4 class="footer-heading">Categories</h4>
          <ul class="footer-links">
            <li><a routerLink="/shop" [queryParams]="{category: 'anarkali'}">Anarkali Sets</a></li>
            <li><a routerLink="/shop" [queryParams]="{category: 'aline-midi-dress'}">A-Line Midi Dresses</a></li>
            <li><a routerLink="/shop" [queryParams]="{category: 'aline-kurti-floral-print'}">Floral Kurtis</a></li>
            <li><a routerLink="/shop" [queryParams]="{category: 'codeset'}">Co-ord Sets</a></li>
            <li><a routerLink="/shop" [queryParams]="{category: 'tissue-silk-kasavu-kurta'}">Tissue Silk Kasavu</a></li>
          </ul>
        </div>

        <!-- Customer Care & Contact -->
        <div class="footer-col">
          <h4 class="footer-heading">Customer Care</h4>
          <ul class="contact-info">
            <li>
              <span class="info-label">📧 Email:</span>
              <a href="mailto:petalsethnic@gmail.com">petalsethnic@gmail.com</a>
            </li>
            <li>
              <span class="info-label">📞 Phone / WhatsApp:</span>
              <a href="tel:+918113899319">+91 81138 99319</a>
            </li>
            <li>
              <span class="info-label">🚚 Shipping:</span>
              <span>Free Delivery on orders above ₹1499 across India</span>
            </li>
            <li>
              <span class="info-label">🔒 Payment:</span>
              <span>Secure Razorpay Gateway & Official UPI QR Support</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container footer-bottom-content">
          <p>© 2026 Petals Ethnic Boutique. All Rights Reserved.</p>
          <div class="bottom-links">
            <a routerLink="/account">My Account</a>
            <span>•</span>
            <a routerLink="/cart">Cart</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .site-footer {
      background-color: #111111;
      color: #D6D6D6;
      padding-top: 64px;
      margin-top: 80px;
      font-size: 14px;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: 40px;
      padding-bottom: 48px;
    }
    @media (max-width: 992px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (max-width: 576px) {
      .footer-grid {
        grid-template-columns: 1fr;
      }
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .footer-logo-img {
      height: 40px;
      border-radius: var(--radius-sm);
    }
    .footer-brand-title {
      font-family: var(--font-heading);
      font-size: 18px;
      font-weight: 700;
      color: #FFFFFF;
      letter-spacing: 1px;
    }
    .brand-quote {
      font-style: italic;
      font-size: 13px;
      line-height: 1.6;
      color: #AAAAAA;
      margin-bottom: 20px;
    }

    .social-links {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .social-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background-color: #222222;
      color: #FFFFFF;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 500;
      border-radius: var(--radius-sm);
      transition: var(--transition);
    }
    .social-btn:hover {
      background-color: var(--color-pink-dark);
      color: #FFFFFF;
    }
    .social-btn.wa {
      background-color: #1E824C;
    }
    .social-btn.wa:hover {
      background-color: #25D366;
    }

    .footer-heading {
      font-family: var(--font-heading);
      font-size: 16px;
      color: #FFFFFF;
      margin-bottom: 20px;
      letter-spacing: 0.5px;
    }
    .footer-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .footer-links a {
      color: #AAAAAA;
      transition: var(--transition);
    }
    .footer-links a:hover {
      color: var(--color-pink);
      padding-left: 4px;
    }

    .contact-info {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .info-label {
      display: block;
      color: #FFFFFF;
      font-weight: 500;
      margin-bottom: 2px;
    }
    .contact-info a {
      color: var(--color-pink);
    }

    .footer-bottom {
      border-top: 1px solid #222222;
      padding: 24px 0;
      font-size: 13px;
      color: #888888;
    }
    .footer-bottom-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .bottom-links {
      display: flex;
      gap: 12px;
    }
    @media (max-width: 768px) {
      .footer-bottom-content {
        flex-direction: column;
        gap: 12px;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {}
