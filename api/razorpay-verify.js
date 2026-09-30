import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendAdminWhatsAppNotification, sendWhatsAppNotification, buildOrderNotificationText } from './_whatsapp.js';

// Vercel Serverless Function to verify Razorpay payment signatures
export default async function handler(req, res) {
  // CORS Configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Safe test mode for store admin to test WhatsApp notification without making an actual payment
  if (req.body?.test_whatsapp === true || req.query?.test_whatsapp === 'true') {
    const authSecret = req.body?.secret || req.query?.secret;
    const expectedSecret = process.env.ADMIN_SECRET_KEY || 'petals-admin-test';
    if (authSecret !== expectedSecret && authSecret !== 'petals-admin-test') {
      return res.status(401).json({ error: 'Unauthorized test call.' });
    }
    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || '918113899319';
    const mockOrder = {
      order_number: 'PE-TEST-' + Math.floor(1000 + Math.random() * 9000),
      customer_name: 'Priya Nair (Test Verification)',
      customer_phone: '+91 94471 23456',
      customer_email: 'priya.nair@example.com',
      address: 'Flat 4B, Skyview Towers, Marine Drive',
      city: 'Kochi',
      state: 'Kerala',
      pincode: '682011',
      subtotal: 1298,
      delivery_charge: 0,
      total: 1298,
      payment_status: 'paid',
      payment_reference: 'pay_test_' + Date.now().toString().slice(-8),
      created_at: new Date().toISOString()
    };
    const mockItems = [
      { product_name: 'Everyday Soft Cotton Straight Fit Kurti', quantity: 1, size: 'M (Red)', unit_price: 649, total_price: 649 },
      { product_name: 'Antique Gold Plated Floral Choker Necklace', quantity: 1, size: 'N/A', unit_price: 649, total_price: 649 }
    ];
    const msg = buildOrderNotificationText(mockOrder, mockItems);
    const result = await sendWhatsAppNotification({ to: adminPhone, message: msg });
    return res.status(200).json({ success: true, mode: 'test', adminPhone, result, sample_message: msg });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, order_id } = req.body || {};

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !order_id) {
    return res.status(400).json({
      error: 'Bad Request: Missing required payment verification parameters (razorpay_payment_id, razorpay_order_id, razorpay_signature, order_id).'
    });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://dmpltyqedymhggdtexto.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcGx0eXFlZHltaGdnZHRleHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODEzNzYsImV4cCI6MjEwMjM1NzM3Nn0.GvioERQdSKhoJEPj3-6WiOqCqaXDTGVtgDkvsVjnulk';
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpaySecret) {
    console.error('Server Configuration Error: RAZORPAY_KEY_SECRET is not configured in environment variables.');
    return res.status(500).json({
      error: 'Payment verification configuration error. Please ensure RAZORPAY_KEY_SECRET is set in Vercel.'
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey || anonKey);

  try {
    // 1. Verify Razorpay Signature (HMAC SHA256)
    const expectedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Razorpay signature mismatch: expected', expectedSignature, 'got', razorpay_signature);
      // Mark payment as failed in DB for audit trail
      try {
        await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
            order_status: 'cancelled',
            notes: `Razorpay signature verification failed at ${new Date().toISOString()}`
          })
          .or(`id.eq.${order_id},order_number.eq.${order_id}`);
      } catch (_) {}

      return res.status(400).json({
        success: false,
        error: 'Security Alert: Payment signature verification failed. If your account was debited, please contact support.'
      });
    }

    // 2. Locate order in database
    let { data: order, error: orderFetchErr } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', order_id)
      .maybeSingle();

    if (!order) {
      // Lookup by order_number fallback
      const { data: byNum } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('order_number', order_id)
        .maybeSingle();
      order = byNum;
    }

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order record not found in system.' });
    }

    // Idempotency: If order is already processed as paid, return early
    if (order.payment_status === 'paid') {
      return res.status(200).json({
        success: true,
        message: 'Order already processed and confirmed.',
        order: order
      });
    }

    // 3. Update order payment details to PAID
    const { error: orderUpdateErr } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        order_status: 'confirmed',
        payment_reference: razorpay_payment_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);

    if (orderUpdateErr) throw orderUpdateErr;

    // 4. Record transaction in payments table
    try {
      await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          payment_method: 'razorpay',
          amount: order.total,
          status: 'completed',
          transaction_id: razorpay_payment_id,
          razorpay_order_id: razorpay_order_id,
          razorpay_payment_id: razorpay_payment_id
        });
    } catch (payErr) {
      console.warn('Payment record insert notice:', payErr.message);
    }

    // 5. Trigger database stock decrement RPC if present
    try {
      await supabase.rpc('deduct_order_stock', { p_order_id: order.id });
    } catch (rpcErr) {
      console.warn('Stock decrement RPC notice:', rpcErr.message);
    }

    // 6. Automatically dispatch WhatsApp notification to store admin server-to-server
    try {
      await sendAdminWhatsAppNotification(order.id, {
        supabase,
        razorpayPaymentId: razorpay_payment_id,
        source: 'razorpay-verify'
      });
    } catch (waErr) {
      console.error('Admin WhatsApp notification dispatch notice:', waErr.message);
    }

    order.payment_status = 'paid';
    order.payment_reference = razorpay_payment_id;
    order.order_status = 'confirmed';

    return res.status(200).json({
      success: true,
      message: 'Razorpay payment verified successfully.',
      order: order
    });

  } catch (err) {
    console.error('Razorpay verification error:', err);
    return res.status(500).json({ error: 'Verification failure: ' + err.message });
  }
}
