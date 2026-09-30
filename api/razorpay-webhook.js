import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendAdminWhatsAppNotification } from './services/whatsapp.js';

// Disable default body parser in Vercel to preserve exact raw body buffer for HMAC signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  // CORS Configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Razorpay-Signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  let rawBuffer;
  let eventPayload;

  try {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      eventPayload = req.body;
      rawBuffer = Buffer.from(JSON.stringify(req.body));
    } else {
      rawBuffer = await getRawBody(req);
      eventPayload = JSON.parse(rawBuffer.toString('utf-8'));
    }
  } catch (parseErr) {
    console.error('Webhook payload parsing error:', parseErr.message);
    return res.status(400).json({ error: 'Invalid webhook JSON payload' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  // Signature verification if webhook secret is configured in Vercel
  if (webhookSecret) {
    if (!signature) {
      console.warn('Webhook rejected: Missing X-Razorpay-Signature header');
      return res.status(400).json({ error: 'Missing webhook signature header' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBuffer)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Webhook signature validation mismatch');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
  } else {
    console.warn('Notice: RAZORPAY_WEBHOOK_SECRET is not configured in Vercel environment. Webhook signature skipped.');
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://dmpltyqedymhggdtexto.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcGx0eXFlZHltaGdnZHRleHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODEzNzYsImV4cCI6MjEwMjM1NzM3Nn0.GvioERQdSKhoJEPj3-6WiOqCqaXDTGVtgDkvsVjnulk';

  const supabase = createClient(supabaseUrl, serviceRoleKey || anonKey);

  const event = eventPayload.event;
  const payload = eventPayload.payload || {};

  try {
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment?.entity;
      const orderEntity = payload.order?.entity;

      const rpOrderId = paymentEntity?.order_id || orderEntity?.id;
      const rpPaymentId = paymentEntity?.id;
      const internalOrderId = paymentEntity?.notes?.order_id || orderEntity?.notes?.order_id;
      const orderNumber = paymentEntity?.notes?.order_number || orderEntity?.notes?.order_number;

      if (!rpOrderId && !internalOrderId && !orderNumber) {
        return res.status(200).json({ received: true, note: 'No matching order identifier found.' });
      }

      // Find the order by internal ID, order number, or Razorpay order reference
      let query = supabase.from('orders').select('id, payment_status, total, order_number');
      if (internalOrderId) {
        query = query.eq('id', internalOrderId);
      } else if (orderNumber) {
        query = query.eq('order_number', orderNumber);
      } else {
        query = query.eq('payment_reference', rpOrderId);
      }

      const { data: order, error: findErr } = await query.maybeSingle();

      if (findErr) {
        console.warn('Webhook order lookup notice:', findErr.message);
      }

      if (order && order.payment_status !== 'paid') {
        // Update order status to paid and confirmed
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            order_status: 'confirmed',
            payment_reference: rpPaymentId || rpOrderId,
            updated_at: new Date().toISOString(),
            notes: 'Payment confirmed via Razorpay Webhook'
          })
          .eq('id', order.id);

        // Record in payments table
        try {
          await supabase
            .from('payments')
            .insert({
              order_id: order.id,
              payment_method: 'razorpay',
              amount: order.total,
              status: 'completed',
              transaction_id: rpPaymentId,
              razorpay_order_id: rpOrderId,
              razorpay_payment_id: rpPaymentId
            });
        } catch (payInsErr) {
          console.warn('Webhook payment insert notice:', payInsErr.message);
        }

        // Trigger stock decrement
        try {
          await supabase.rpc('deduct_order_stock', { p_order_id: order.id });
        } catch (rpcErr) {
          console.warn('Webhook stock deduction notice:', rpcErr.message);
        }

        console.log(`Order #${order.order_number} marked PAID successfully via webhook.`);

        // Trigger automated server-to-server WhatsApp notification to store admin (idempotent)
        try {
          await sendAdminWhatsAppNotification(order.id, {
            supabase,
            razorpayPaymentId: rpPaymentId,
            source: 'razorpay-webhook'
          });
        } catch (waErr) {
          console.error('Webhook WhatsApp admin notification error:', waErr.message);
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload.payment?.entity;
      const rpOrderId = paymentEntity?.order_id;
      const internalOrderId = paymentEntity?.notes?.order_id;

      if (rpOrderId || internalOrderId) {
        let query = supabase.from('orders').select('id, payment_status');
        if (internalOrderId) {
          query = query.eq('id', internalOrderId);
        } else {
          query = query.eq('payment_reference', rpOrderId);
        }

        const { data: order } = await query.maybeSingle();
        if (order && order.payment_status === 'pending') {
          await supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              notes: `Razorpay payment failed: ${paymentEntity.error_description || 'Transaction unsuccessful'}`
            })
            .eq('id', order.id);
        }
      }
    }

    return res.status(200).json({ received: true, event });

  } catch (procErr) {
    console.error('Webhook execution failure:', procErr);
    return res.status(500).json({ error: 'Webhook processing error: ' + procErr.message });
  }
}
