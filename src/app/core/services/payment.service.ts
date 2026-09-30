import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare var Razorpay: any;

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutParams {
  key?: string;
  razorpayOrderId: string;
  amountInPaise: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (response: RazorpayPaymentSuccessResponse) => void;
  onCancel?: () => void;
  onError?: (error: any) => void;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private scriptLoaded = false;

  constructor() {}

  public loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(false);
        return;
      }

      if (this.scriptLoaded || (window as any).Razorpay) {
        this.scriptLoaded = true;
        resolve(true);
        return;
      }

      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
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
        console.error('Failed to load Razorpay Checkout SDK script.');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  public async openRazorpayCheckout(params: RazorpayCheckoutParams): Promise<void> {
    const isLoaded = await this.loadRazorpayScript();
    if (!isLoaded || typeof Razorpay === 'undefined') {
      throw new Error('Razorpay Payment Gateway could not be loaded. Please check your network connection.');
    }

    const keyToUse = params.key || environment.razorpayKeyId || 'rzp_test_5113899319';

    const options = {
      key: keyToUse,
      order_id: params.razorpayOrderId,
      amount: params.amountInPaise,
      currency: 'INR',
      name: 'Petals Ethnics and Jewellers',
      description: `Order #${params.orderNumber}`,
      image: 'https://i.ibb.co/d4SMQvxj/Whats-App-Image-2026-08-13-at-10-59-05-AM.jpg',
      prefill: {
        name: params.customerName || '',
        email: params.customerEmail || '',
        contact: params.customerPhone || ''
      },
      notes: {
        order_number: params.orderNumber
      },
      theme: {
        color: '#C05676' // Petals signature rose pink
      },
      handler: (response: any) => {
        params.onSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id || params.razorpayOrderId,
          razorpay_signature: response.razorpay_signature
        });
      },
      modal: {
        backdropclose: false,
        escape: false,
        ondismiss: () => {
          if (params.onCancel) {
            params.onCancel();
          }
        }
      }
    };

    const rzp = new Razorpay(options);

    if (params.onError) {
      rzp.on('payment.failed', (response: any) => {
        console.warn('Razorpay payment failed callback:', response?.error);
        if (params.onError) {
          params.onError(response?.error);
        }
      });
    }

    rzp.open();
  }
}
