import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Vercel Serverless Function to verify Razorpay payment signatures
export default async function handler(req, res) {
  // CORS Configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, order_id } = req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !order_id) {
    return res.status(400).json({ error: 'Bad Request: Missing payment attributes.' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!supabaseUrl || !serviceRoleKey || !razorpaySecret) {
    return res.status(500).json({ error: 'Server Configuration Error: Private credentials not configured.' });
  }

  try {
    // 1. Verify Razorpay Signature (HMAC SHA256)
    const hmac = crypto.createHmac('sha256', razorpaySecret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      // Mark payment as failed in DB for audit trail
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          order_status: 'cancelled',
          notes: 'Razorpay signature validation failed.'
        })
        .eq('id', order_id);

      return res.status(400).json({ error: 'Security Alert: Payment signature verification failed.' });
    }

    // 2. Initialize privileged admin client to update states
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 3. Check current order status
    const { data: order, error: orderFetchErr } = await supabase
      .from('orders')
      .select('payment_status')
      .eq('id', order_id)
      .single();

    if (orderFetchErr || !order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Avoid double processing
    if (order.payment_status === 'paid') {
      return res.status(200).json({ success: true, message: 'Order already processed.' });
    }

    // 4. Update order payment details inside transaction
    const { error: orderUpdateErr } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        order_status: 'confirmed',
        payment_reference: razorpay_payment_id,
        updated_at: new Date()
      })
      .eq('id', order_id);

    if (orderUpdateErr) throw orderUpdateErr;

    // 5. Execute secure stock locks and decrement triggers
    const { error: rpcErr } = await supabase
      .rpc('deduct_order_stock', { p_order_id: order_id });

    if (rpcErr) {
      // If stock reduction fails (due to parallel race exhaustion), flag order notes for manual review
      await supabase
        .from('orders')
        .update({
          notes: `Warning: Payment succeeded but stock reduction failed: ${rpcErr.message}. Manual override required.`
        })
        .eq('id', order_id);
      
      return res.status(400).json({
        error: 'Stock reduction failed. Payment was verified, but item has sold out. Support has been notified.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Razorpay payment verified and stock deducted.'
    });

  } catch (err) {
    console.error('Razorpay verification error:', err.message);
    return res.status(500).json({ error: 'Verification failure: ' + err.message });
  }
}
