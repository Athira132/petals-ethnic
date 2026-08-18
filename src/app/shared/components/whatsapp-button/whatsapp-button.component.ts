import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <a 
      href="https://wa.me/918113899319?text=Hello%20Petals%20Ethnic,%20I%20would%20like%20to%20know%20more%20about%20your%20products."
      target="_blank" 
      rel="noopener noreferrer" 
      class="floating-wa-btn"
      title="Chat on WhatsApp"
      aria-label="Chat on WhatsApp"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#FFFFFF">
        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.333 5.001l-1.416 5.174 5.299-1.389c1.464.798 3.114 1.218 4.774 1.218h.004c5.506 0 9.989-4.478 9.99-9.984 0-2.669-1.038-5.176-2.925-7.062-1.887-1.886-4.394-2.924-7.064-2.924zm5.82 14.281c-.244.687-1.42 1.312-1.957 1.393-.49.074-1.127.106-1.815-.115-.418-.134-.956-.31-1.657-.615-2.955-1.282-4.887-4.281-5.035-4.479-.148-.198-1.205-1.604-1.205-3.059 0-1.455.762-2.172 1.033-2.464.271-.292.593-.365.791-.365.198 0 .396.002.568.01.185.009.432-.07.676.516.244.587.834 2.036.907 2.184.073.148.122.321.024.516-.098.196-.148.318-.293.49-.148.171-.31.382-.443.513-.148.148-.303.31-.131.606.171.296.76 1.256 1.632 2.033 1.123.999 2.07 1.309 2.366 1.457.296.148.469.124.642-.074.173-.198.742-.865.94-1.162.198-.296.396-.247.668-.148.271.098 1.727.815 2.023.963.296.148.494.222.568.346.074.123.074.715-.17 1.402z"/>
      </svg>
    </a>
  `,
  styles: [`
    .floating-wa-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      background-color: #25D366;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(37, 211, 102, 0.4);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .floating-wa-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(37, 211, 102, 0.6);
    }
    @media (max-width: 576px) {
      .floating-wa-btn {
        bottom: 16px;
        right: 16px;
        width: 46px;
        height: 46px;
      }
      .floating-wa-btn svg {
        width: 24px;
        height: 24px;
      }
    }
  `]
})
export class WhatsappButtonComponent {}
