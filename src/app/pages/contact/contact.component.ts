import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="contact-page">
      <div class="contact-header">
        <div class="container text-center">
          <h1 class="contact-title">Contact Us</h1>
          <p class="contact-subtitle">We would love to assist you with sizing, custom orders, or any inquiries.</p>
        </div>
      </div>

      <div class="container contact-container">
        <!-- Contact Information Cards -->
        <div class="contact-info-grid">
          <div class="contact-card">
            <div class="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.333 5.001l-1.416 5.174 5.299-1.389c1.464.798 3.114 1.218 4.774 1.218h.004c5.506 0 9.989-4.478 9.99-9.984 0-2.669-1.038-5.176-2.925-7.062-1.887-1.886-4.394-2.924-7.064-2.924zm5.82 14.281c-.244.687-1.42 1.312-1.957 1.393-.49.074-1.127.106-1.815-.115-.418-.134-.956-.31-1.657-.615-2.955-1.282-4.887-4.281-5.035-4.479-.148-.198-1.205-1.604-1.205-3.059 0-1.455.762-2.172 1.033-2.464.271-.292.593-.365.791-.365.198 0 .396.002.568.01.185.009.432-.07.676.516.244.587.834 2.036.907 2.184.073.148.122.321.024.516-.098.196-.148.318-.293.49-.148.171-.31.382-.443.513-.148.148-.303.31-.131.606.171.296.76 1.256 1.632 2.033 1.123.999 2.07 1.309 2.366 1.457.296.148.469.124.642-.074.173-.198.742-.865.94-1.162.198-.296.396-.247.668-.148.271.098 1.727.815 2.023.963.296.148.494.222.568.346.074.123.074.715-.17 1.402z"/>
              </svg>
            </div>
            <h3>WhatsApp Helpline</h3>
            <p>Connect with our fashion stylists directly on WhatsApp.</p>
            <a href="https://wa.me/918113899319?text=Hello%20Petals%20Ethnic,%20I%20have%20an%20inquiry." target="_blank" class="contact-link">+91 81138 99319</a>
          </div>

          <div class="contact-card">
            <div class="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h3>Email Support</h3>
            <p>Send us your product & order questions via email.</p>
            <a href="mailto:petalsethnic@gmail.com" class="contact-link">petalsethnic@gmail.com</a>
          </div>

          <div class="contact-card">
            <div class="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <h3>Instagram & Facebook</h3>
            <p>Follow our official channels for new arrivals.</p>
            <a href="https://www.instagram.com/petalsethnic" target="_blank" class="contact-link">&#64;petalsethnic</a>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="contact-form-card">
          <h2>Send Us a Message</h2>
          <form (ngSubmit)="sendMessage()">
            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Your Name *</label>
                <input type="text" [(ngModel)]="name" name="name" required class="form-control" placeholder="Full name" />
              </div>
              <div class="form-group flex-1">
                <label class="form-label">Your Email *</label>
                <input type="email" [(ngModel)]="email" name="email" required class="form-control" placeholder="email@example.com" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Phone / WhatsApp Number</label>
              <input type="tel" [(ngModel)]="phone" name="phone" class="form-control" placeholder="+91 98765 43210" />
            </div>

            <div class="form-group">
              <label class="form-label">Message *</label>
              <textarea [(ngModel)]="message" name="message" rows="5" required class="form-control" placeholder="How can we help you?"></placeholder></textarea>
            </div>

            <button type="submit" [disabled]="isSubmitting" class="btn-primary">
              {{ isSubmitting ? 'Sending Message...' : 'Send Message' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contact-header {
      background: var(--color-bg-alt);
      padding: 48px 0;
      border-bottom: 1px solid var(--color-border-light);
    }
    .contact-title { font-size: 36px; margin-bottom: 8px; }
    .contact-subtitle { font-size: 15px; color: var(--color-muted); }
    .text-center { text-align: center; }

    .contact-container { padding-top: 48px; padding-bottom: 80px; }

    .contact-info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-bottom: 48px;
    }
    @media (max-width: 992px) {
      .contact-info-grid { grid-template-columns: 1fr; }
    }
    .contact-card {
      background: #FFFFFF;
      padding: 32px;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border-light);
      text-align: center;
    }
    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--color-pink-light);
      color: var(--color-pink-dark);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px auto;
    }
    .contact-card h3 { font-size: 18px; margin-bottom: 8px; }
    .contact-card p { font-size: 13px; color: var(--color-muted); margin-bottom: 12px; }
    .contact-link { font-weight: 600; color: var(--color-pink-dark); font-size: 14px; }

    .contact-form-card {
      background: #FFFFFF;
      padding: 40px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border-light);
      max-width: 800px;
      margin: 0 auto;
    }
    .contact-form-card h2 { font-size: 24px; margin-bottom: 24px; }
    .form-row { display: flex; gap: 16px; }
    .flex-1 { flex: 1; }
    @media (max-width: 576px) {
      .form-row { flex-direction: column; gap: 0; }
    }
  `]
})
export class ContactComponent {
  name = '';
  email = '';
  phone = '';
  message = '';
  isSubmitting = false;

  sendMessage() {
    if (!this.name || !this.email || !this.message) {
      alert('Please fill in required fields.');
      return;
    }
    this.isSubmitting = true;
    setTimeout(() => {
      alert('Thank you! Your message has been sent successfully. We will get back to you shortly.');
      this.name = '';
      this.email = '';
      this.phone = '';
      this.message = '';
      this.isSubmitting = false;
    }, 1000);
  }
}
