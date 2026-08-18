import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Order, OrderItem, OrderStatus, PaymentStatus } from '../models/order.model';
import { CartItem } from '../models/cart.model';

export interface CreateOrderPayload {
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
  payment_method: 'upi' | 'razorpay' | 'cod';
  payment_reference?: string;
  notes?: string;
  items: CartItem[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private supabaseService: SupabaseService) {}

  async createOrder(payload: CreateOrderPayload, userId?: string): Promise<Order> {
    const supabase = this.supabaseService.supabase;

    // 1. Insert order record
    const { data: orderData, error: orderErr } = await supabase
      .from('orders')
      .insert([{
        user_id: userId || null,
        customer_name: payload.customer_name,
        customer_email: payload.customer_email,
        customer_phone: payload.customer_phone,
        address: payload.address,
        city: payload.city,
        state: payload.state,
        pincode: payload.pincode,
        subtotal: payload.subtotal,
        discount: payload.discount,
        delivery_charge: payload.delivery_charge,
        total: payload.total,
        payment_method: payload.payment_method,
        payment_status: payload.payment_method === 'cod' ? 'pending' : (payload.payment_reference ? 'awaiting_verification' : 'pending'),
        order_status: 'pending',
        payment_reference: payload.payment_reference || null,
        notes: payload.notes || null
      }])
      .select()
      .single();

    if (orderErr) throw orderErr;

    const orderId = orderData.id;

    // 2. Insert order items
    const itemPayloads = payload.items.map(item => ({
      order_id: orderId,
      product_id: item.product.id,
      product_name: item.product.name,
      product_image: item.product.images && item.product.images.length > 0 ? item.product.images[0].image_url : null,
      size: item.selectedSize,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice
    }));

    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(itemPayloads);

    if (itemsErr) console.error('Error inserting order items:', itemsErr);

    // 3. Trigger stock deduction RPC if available
    try {
      await supabase.rpc('deduct_order_stock', { p_order_id: orderId });
    } catch (e) {
      console.warn('Stock deduction RPC warning:', e);
    }

    return await this.getOrderById(orderId) as Order;
  }

  async getMyOrders(userId: string): Promise<Order[]> {
    const { data, error } = await this.supabaseService.supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    const { data, error } = await this.supabaseService.supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order by ID:', error);
      return null;
    }
    return data;
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn('Direct order query notice, using API fallback:', e);
    }

    try {
      const res = await fetch('/api/admin-order');
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const resData = await res.json();
        if (resData.success && resData.orders) {
          return resData.orders as Order[];
        }
      }
    } catch (e) {
      console.error('API order fallback error:', e);
    }

    return [];
  }

  async updateOrderStatus(orderId: string, orderStatus: OrderStatus): Promise<void> {
    const { error } = await this.supabaseService.supabase
      .from('orders')
      .update({ order_status: orderStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) throw error;
  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus, paymentRef?: string): Promise<void> {
    const updateData: any = { payment_status: paymentStatus, updated_at: new Date().toISOString() };
    if (paymentRef) {
      updateData.payment_reference = paymentRef;
    }
    const { error } = await this.supabaseService.supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) throw error;
  }
}
