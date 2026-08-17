import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <a 
      [href]="whatsappUrl" 
      target="_blank" 
      rel="noopener noreferrer" 
      class="floating-whatsapp-btn"
      title="Chat with Petals Ethnic on WhatsApp"
    >
      <span class="wa-icon">💬</span>
      <span class="wa-text">Chat with Us</span>
    </a>
  `,
  styles: [`
    .floating-whatsapp-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999;
      background-color: #25D366;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
      border-radius: var(--radius-full);
      box-shadow: 0 4px 16px rgba(37, 211, 102, 0.4);
      transition: var(--transition);
      font-weight: 600;
      font-size: 14px;
      letter-spacing: 0.5px;
    }
    .floating-whatsapp-btn:hover {
      background-color: #1EBE57;
      transform: translateY(-4px) scale(1.03);
      box-shadow: 0 8px 24px rgba(37, 211, 102, 0.5);
      color: #FFFFFF;
    }
    .wa-icon {
      font-size: 20px;
    }
    @media (max-width: 576px) {
      .floating-whatsapp-btn {
        bottom: 16px;
        right: 16px;
        padding: 10px 16px;
        font-size: 13px;
      }
    }
  `]
})
export class WhatsappButtonComponent {
  readonly phoneNumber = '918113899319';
  readonly defaultMessage = 'Hello Petals Ethnic, I would like to know more about your products.';

  get whatsappUrl(): string {
    return `https://wa.me/${this.phoneNumber}?text=${encodeURIComponent(this.defaultMessage)}`;
  }
}
