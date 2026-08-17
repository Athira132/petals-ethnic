import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

// Vercel Serverless Function to create Razorpay Order securely
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

  const { items, order_data, coupon_code } = req.body;
  if (!items || items.length === 0 || !order_data) {
    return res.status(400).json({ error: 'Bad Request: Missing items list or order coordinates.' });
  }

  // Validate Private Keys
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!supabaseUrl || !serviceRoleKey || !razorpayKeyId || !razorpaySecret) {
    return res.status(500).json({ error: 'Server Configuration Error: Missing private keys.' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpaySecret
  });

  try {
    let subtotal = 0;

    // 1. Verify pricing directly against Database
    for (const item of items) {
      const { data: product, error: prodErr } = await supabase
        .from('products')
        .select('name, price, sale_price, availability')
        .eq('id', item.product_id)
        .single();

      if (prodErr || !product || product.availability === 'unavailable') {
        return res.status(400).json({ error: `Product ${item.product_id} is currently unavailable.` });
      }

      // Check size stock status
      const { data: sizeRecord, error: sizeErr } = await supabase
        .from('product_sizes')
        .select('stock, status')
        .eq('product_id', item.product_id)
        .eq('size', item.size)
        .single();

      if (sizeErr || !sizeRecord || sizeRecord.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name} (Size: ${item.size}).` });
      }

      const activePrice = Number(product.sale_price || product.price);
      subtotal += activePrice * item.quantity;
    }

    // 2. Load Store Settings for shipping calculation
    const { data: settings, error: settingsErr } = await supabase
      .from('store_settings')
      .select('*')
      .single();

    if (settingsErr) throw settingsErr;

    const deliveryCharge = subtotal > Number(settings.free_delivery_threshold) 
      ? 0.00 
      : Number(settings.delivery_charge);

    // 3. Verify discount coupon code
    let discount = 0;
    if (coupon_code) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', coupon_code.trim().toUpperCase())
        .eq('active', true)
        .single();

      if (coupon) {
        // Expiry check
        if (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) {
          if (subtotal >= Number(coupon.minimum_order_amount)) {
            if (coupon.discount_type === 'percentage') {
              discount = Math.round(subtotal * (Number(coupon.discount_value) / 100));
            } else {
              discount = Number(coupon.discount_value);
            }
          }
        }
      }
    }

    const total = subtotal - discount + deliveryCharge;

    // 4. Create pending order row in Supabase
    const orderNumber = 'PE-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: order_data.user_id || null,
        customer_name: order_data.customer_name,
        customer_email: order_data.customer_email,
        customer_phone: order_data.customer_phone,
        address: order_data.address,
        city: order_data.city,
        state: order_data.state,
        pincode: order_data.pincode,
        subtotal: subtotal,
        discount: discount,
        delivery_charge: deliveryCharge,
        total: total,
        payment_method: 'razorpay',
        payment_status: 'pending',
        order_status: 'pending',
        notes: order_data.notes || ''
      })
      .select('id')
      .single();

    if (orderErr) throw orderErr;
    const orderId = order.id;

    // 5. Insert order items snapshots
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('name, price, sale_price, product_images(*)')
        .eq('id', item.product_id)
        .single();

      const activePrice = Number(product.sale_price || product.price);
      const sortedImgs = product.product_images 
        ? [...product.product_images].sort((a,b) => a.display_order - b.display_order).map(img => img.image_url)
        : [];
      
      await supabase
        .from('order_items')
        .insert({
          order_id: orderId,
          product_id: item.product_id,
          product_name: product.name,
          product_image: sortedImgs[0] || '',
          size: item.size,
          quantity: item.quantity,
          unit_price: activePrice,
          total_price: activePrice * item.quantity
        });
    }

    // 6. Create Razorpay order
    const rpOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // Razorpay operates in lowest currency units (paise)
      currency: 'INR',
      receipt: orderId
    });

    // 7. Update order with payment reference
    await supabase
      .from('orders')
      .update({ payment_reference: rpOrder.id })
      .eq('id', orderId);

    return res.status(200).json({
      success: true,
      order_id: orderId,
      order_number: orderNumber,
      razorpay_order_id: rpOrder.id,
      amount: rpOrder.amount,
      key_id: razorpayKeyId
    });

  } catch (err) {
    console.error('Razorpay creation error:', err.message);
    return res.status(500).json({ error: 'Failed to create payment session: ' + err.message });
  }
}
