export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id?: string | null;
  product_name: string;
  product_image?: string | null;
  size: string;
  color?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export type PaymentMethod = 'upi' | 'razorpay' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'awaiting_verification';
export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  discount: number;
  delivery_charge: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  payment_reference?: string | null;
  shipping_region?: string | null;
  delivery_time_range?: string | null;
  estimated_delivery_start?: string | null;
  estimated_delivery_end?: string | null;
  estimated_delivery_text?: string | null;
  razorpay_order_id?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  order_items?: OrderItem[];
}
