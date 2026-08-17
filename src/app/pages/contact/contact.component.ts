import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="contact-page">
      <div class="contact-hero">
        <div class="container text-center">
          <span class="section-subtitle">GET IN TOUCH</span>
          <h1 class="contact-title">Contact Petals Ethnic</h1>
          <p class="contact-sub">We are here to assist you with sizing, orders, and boutique inquiries.</p>
        </div>
      </div>

      <div class="container section">
        <div class="contact-grid">
          <!-- Info Column -->
          <div class="contact-info-card">
            <h2>Reach Out to Us</h2>
            <p>Have questions about a fabric or custom sizing? Connect with us through any of the channels below.</p>

            <div class="info-list">
              <div class="info-item">
                <span class="info-icon">📧</span>
                <div>
                  <strong>Email Us:</strong>
                  <a href="mailto:petalsethnic@gmail.com">petalsethnic@gmail.com</a>
                </div>
              </div>

              <div class="info-item">
                <span class="info-icon">💬</span>
                <div>
                  <strong>WhatsApp Helpline:</strong>
                  <a href="https://wa.me/918113899319" target="_blank">+91 81138 99319</a>
                </div>
              </div>

              <div class="info-item">
                <span class="info-icon">📸</span>
                <div>
                  <strong>Instagram:</strong>
                  <a href="https://www.instagram.com/petalsethnic" target="_blank">&#64;petalsethnic</a>
                </div>
              </div>

              <div class="info-item">
                <span class="info-icon">👍</span>
                <div>
                  <strong>Facebook Page:</strong>
                  <a href="https://www.facebook.com/share/1CZHBSGW22/" target="_blank">Petals Ethnic Official</a>
                </div>
              </div>
            </div>

            <div class="wa-box">
              <h3>Fastest Response on WhatsApp</h3>
              <p>Send us a text for immediate assistance on orders & styling.</p>
              <a href="https://wa.me/918113899319?text=Hello%20Petals%20Ethnic" target="_blank" class="btn-wa">
                Chat on WhatsApp Now
              </a>
            </div>
          </div>

          <!-- Form Column -->
          <div class="contact-form-card">
            <h2>Send Us a Message</h2>
            <div *ngIf="sentSuccess" class="alert success">
              ✅ Thank you! Your message has been received. We will contact you shortly.
            </div>

            <form (ngSubmit)="sendMessage()" class="contact-form" *ngIf="!sentSuccess">
              <div class="form-group">
                <label class="form-label">Your Name</label>
                <input type="text" [(ngModel)]="name" name="name" required class="form-control" placeholder="Priya" />
              </div>

              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" [(ngModel)]="email" name="email" required class="form-control" placeholder="you@example.com" />
              </div>

              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input type="tel" [(ngModel)]="phone" name="phone" class="form-control" placeholder="+91 98765 43210" />
              </div>

              <div class="form-group">
                <label class="form-label">Message / Outfit Inquiry</label>
                <textarea [(ngModel)]="message" name="message" required rows="4" class="form-control" placeholder="Tell us what you're looking for..."></textarea>
              </div>

              <button type="submit" class="btn-primary full-width">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contact-hero {
      background-color: var(--color-bg-alt);
      padding: 60px 0;
      border-bottom: 1px solid var(--color-border-light);
    }
    .text-center { text-align: center; }
    .contact-title { font-size: 42px; margin-bottom: 8px; }
    .contact-sub { font-size: 16px; color: var(--color-muted); }
    .section { padding: 80px 0; }
    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
    }
    @media (max-width: 992px) {
      .contact-grid { grid-template-columns: 1fr; gap: 32px; }
    }
    .contact-info-card, .contact-form-card {
      background: #FFFFFF;
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-lg);
      padding: 40px;
    }
    .info-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin: 28px 0;
    }
    .info-item {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .info-icon { font-size: 24px; }
    .info-item a { color: #C05676; font-weight: 600; }
    .wa-box {
      background: var(--color-pink-light);
      border: 1px solid var(--color-pink);
      padding: 24px;
      border-radius: var(--radius-md);
      margin-top: 32px;
      text-align: center;
    }
    .wa-box h3 { margin-bottom: 8px; }
    .wa-box p { font-size: 13px; color: var(--color-muted); margin-bottom: 16px; }
    .btn-wa {
      display: inline-block;
      background-color: #25D366;
      color: #FFFFFF;
      padding: 12px 24px;
      border-radius: var(--radius-full);
      font-weight: 600;
    }
    .full-width { width: 100%; padding: 14px; }
    .alert.success {
      background-color: #E8F5E9;
      color: #2E7D32;
      padding: 16px;
      border-radius: 4px;
      font-size: 14px;
    }
  `]
})
export class ContactComponent {
  name = '';
  email = '';
  phone = '';
  message = '';
  sentSuccess = false;

  sendMessage() {
    if (this.name && this.email && this.message) {
      this.sentSuccess = true;
    }
  }
}
