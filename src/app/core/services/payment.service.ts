import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare var Razorpay: any;

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes?: Record<string, string>;
  theme: {
    color: string;
  };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }) => void;
  modal?: {
    ondismiss: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private scriptLoaded = false;

  constructor() {}

  public loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.scriptLoaded || (window as any).Razorpay) {
        this.scriptLoaded = true;
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        this.scriptLoaded = true;
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay SDK script.');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  public async openRazorpayCheckout(params: {
    amountInRupees: number;
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    onSuccess: (paymentId: string) => void;
    onCancel?: () => void;
  }): Promise<void> {
    const isLoaded = await this.loadRazorpayScript();
    if (!isLoaded) {
      alert('Razorpay Payment Gateway could not be loaded. Please check your internet connection.');
      return;
    }

    const options: RazorpayOptions = {
      key: environment.razorpayKeyId,
      amount: Math.round(params.amountInRupees * 100), // convert to paise
      currency: 'INR',
      name: 'Petals Ethnic',
      description: `Order #${params.orderId}`,
      image: 'https://i.ibb.co/d4SMQvxj/Whats-App-Image-2026-08-13-at-10-59-05-AM.jpg',
      prefill: {
        name: params.customerName,
        email: params.customerEmail,
        contact: params.customerPhone
      },
      notes: {
        orderId: params.orderId
      },
      theme: {
        color: '#F8C8D8' // Baby pink accent
      },
      handler: (response) => {
        params.onSuccess(response.razorpay_payment_id);
      },
      modal: {
        ondismiss: () => {
          if (params.onCancel) params.onCancel();
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }
}
