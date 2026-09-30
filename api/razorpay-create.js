import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

// Vercel Serverless Function to create Razorpay Order securely
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { items, order_data, coupon_code } = req.body || {};
  if (!items || !Array.isArray(items) || items.length === 0 || !order_data) {
    return res.status(400).json({ error: 'Bad Request: Missing items list or order customer details.' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://dmpltyqedymhggdtexto.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcGx0eXFlZHltaGdnZHRleHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODEzNzYsImV4cCI6MjEwMjM1NzM3Nn0.GvioERQdSKhoJEPj3-6WiOqCqaXDTGVtgDkvsVjnulk';
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_5113899319';
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpaySecret) {
    console.error('Server Configuration Error: RAZORPAY_KEY_SECRET is not configured in environment variables.');
    return res.status(500).json({
      error: 'Payment gateway configuration error. Please ensure RAZORPAY_KEY_SECRET is configured in Vercel.'
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey || anonKey);

  try {
    let subtotal = 0;
    const validatedItems = [];

    // 1. Verify pricing & availability directly against Database (Never trust client prices)
    for (const rawItem of items) {
      const productId = rawItem.product_id || rawItem.product?.id || rawItem.id;
      if (!productId) {
        return res.status(400).json({ error: 'Invalid product item in cart.' });
      }

      const quantity = Math.max(1, parseInt(rawItem.quantity || rawItem.qty || 1, 10));
      const size = rawItem.size || rawItem.selectedSize || 'N/A';
      const color = rawItem.color || rawItem.selectedColor || null;

      const { data: product, error: prodErr } = await supabase
        .from('products')
        .select('id, name, price, sale_price, availability, stock, active, description, product_images(*)')
        .eq('id', productId)
        .maybeSingle();

      if (prodErr) {
        console.error(`Database error querying product ${productId}:`, prodErr);
        return res.status(400).json({ error: `Product query failed for ${productId}: ${prodErr.message}` });
      }

      if (!product) {
        return res.status(400).json({ error: `Product not found or unavailable: ${productId}` });
      }

      // Check whether product has size using description metadata if available
      let productHasSize = true;
      if (product.description && product.description.includes('<!--PRODUCT_META:')) {
        try {
          const match = product.description.match(/<!--PRODUCT_META:([\s\S]*?)-->/);
          if (match && match[1]) {
            const meta = JSON.parse(match[1]);
            if (meta.has_size !== undefined) {
              productHasSize = Boolean(meta.has_size);
            }
          }
        } catch (_) {}
      }

      if (product.active === false || product.availability === 'unavailable') {
        return res.status(400).json({ error: `"${product.name}" is currently unavailable.` });
      }

      if (product.availability === 'sold_out') {
        return res.status(400).json({ error: `"${product.name}" is sold out.` });
      }

      // Check size-specific stock if applicable
      const requiresSizeCheck = productHasSize && size && !['N/A', 'One Size', 'Standard', 'Free Size'].includes(size);
      if (requiresSizeCheck) {
        const { data: sizeRecord } = await supabase
          .from('product_sizes')
          .select('stock, status')
          .eq('product_id', productId)
          .eq('size', size)
          .maybeSingle();

        if (sizeRecord) {
          if (sizeRecord.status === 'sold_out' || (typeof sizeRecord.stock === 'number' && sizeRecord.stock < quantity)) {
            return res.status(400).json({ error: `Size "${size}" for "${product.name}" is out of stock.` });
          }
        }
      }

      // Check general stock
      if (typeof product.stock === 'number' && product.stock < quantity) {
        return res.status(400).json({ error: `Insufficient stock for "${product.name}". Only ${product.stock} left.` });
      }

      const activeUnitPrice = Number(product.sale_price != null && Number(product.sale_price) > 0 ? product.sale_price : product.price);
      const itemTotal = activeUnitPrice * quantity;
      subtotal += itemTotal;

      let itemImg = rawItem.image || rawItem.selectedImage || '';
      if (!itemImg && product.product_images && product.product_images.length > 0) {
        const sorted = [...product.product_images].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        itemImg = sorted[0]?.image_url || '';
      }

      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        product_image: itemImg,
        size: size,
        color: color,
        quantity: quantity,
        unit_price: activeUnitPrice,
        total_price: itemTotal
      });
    }

    // 2. Configurable shipping calculation (defaulting to ₹0 shipping fee)
    const STORE_SHIPPING_FEE = 0.00;
    const STORE_FREE_SHIPPING_THRESHOLD = 0.00;

    let deliveryCharge = STORE_SHIPPING_FEE;
    try {
      const { data: settings } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (settings) {
        if (settings.delivery_charge !== 0 || settings.free_delivery_threshold !== 0) {
          // Sync store_settings table in Supabase so database reflects ₹0 shipping
          await supabase
            .from('store_settings')
            .update({ delivery_charge: 0, free_delivery_threshold: 0 })
            .eq('id', settings.id);
        }
        const threshold = Number(settings.free_delivery_threshold ?? STORE_FREE_SHIPPING_THRESHOLD);
        const configuredFee = Number(settings.delivery_charge ?? STORE_SHIPPING_FEE);
        deliveryCharge = (threshold === 0 || subtotal >= threshold) ? 0.00 : configuredFee;
      } else {
        deliveryCharge = STORE_SHIPPING_FEE;
      }
    } catch (_) {
      deliveryCharge = STORE_SHIPPING_FEE;
    }

    // 3. Verify discount coupon code if provided
    let discount = 0;
    if (coupon_code && typeof coupon_code === 'string') {
      try {
        const { data: coupon } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', coupon_code.trim().toUpperCase())
          .eq('active', true)
          .maybeSingle();

        if (coupon) {
          const notExpired = !coupon.expires_at || new Date(coupon.expires_at) > new Date();
          const meetsMin = subtotal >= Number(coupon.minimum_order_amount || 0);
          if (notExpired && meetsMin) {
            if (coupon.discount_type === 'percentage') {
              discount = Math.round(subtotal * (Number(coupon.discount_value) / 100));
            } else {
              discount = Math.min(subtotal, Number(coupon.discount_value || 0));
            }
          }
        }
      } catch (cErr) {
        console.warn('Coupon verification notice:', cErr.message);
      }
    }

    const total = Math.max(0, subtotal - discount + deliveryCharge);
    const orderNumber = 'PE-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900);

    // 4. Create pending order row in Supabase
    const orderInsertPayload = {
      order_number: orderNumber,
      user_id: order_data.user_id || null,
      customer_name: (order_data.customer_name || '').trim(),
      customer_email: (order_data.customer_email || '').trim(),
      customer_phone: (order_data.customer_phone || '').trim(),
      address: (order_data.address || '').trim(),
      city: (order_data.city || '').trim(),
      state: (order_data.state || '').trim(),
      pincode: (order_data.pincode || '').trim(),
      subtotal: subtotal,
      discount: discount,
      delivery_charge: deliveryCharge,
      total: total,
      payment_method: 'razorpay',
      payment_status: 'pending',
      order_status: 'pending',
      notes: order_data.notes || ''
    };

    let orderRecord = null;
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert(orderInsertPayload)
      .select('id, order_number')
      .single();

    if (orderErr) {
      // If user_id caused foreign key constraint failure, retry with null user_id
      if (orderInsertPayload.user_id) {
        orderInsertPayload.user_id = null;
        const { data: retryOrder, error: retryErr } = await supabase
          .from('orders')
          .insert(orderInsertPayload)
          .select('id, order_number')
          .single();
        if (retryErr) throw retryErr;
        orderRecord = retryOrder;
      } else {
        throw orderErr;
      }
    } else {
      orderRecord = order;
    }

    const orderId = orderRecord.id;

    // 5. Insert order items snapshots
    for (const it of validatedItems) {
      const itemPayload = {
        order_id: orderId,
        product_id: it.product_id,
        product_name: it.product_name,
        product_image: it.product_image,
        size: it.color ? `${it.size} (${it.color})` : it.size,
        quantity: it.quantity,
        unit_price: it.unit_price,
        total_price: it.total_price
      };

      const { error: insErr } = await supabase
        .from('order_items')
        .insert(itemPayload);

      if (insErr) {
        console.warn('Order item insert notice:', insErr.message);
      }
    }

    // 6. Create Razorpay order via Razorpay SDK (with REST API fallback)
    const amountInPaise = Math.round(total * 100);
    let rpOrder = null;

    try {
      const razorpay = new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpaySecret
      });

      rpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: orderNumber.slice(0, 40),
        notes: {
          order_id: String(orderId),
          order_number: orderNumber
        }
      });
    } catch (sdkErr) {
      console.warn('Razorpay SDK order creation notice, attempting direct API:', sdkErr.message);
      const authHeader = 'Basic ' + Buffer.from(`${razorpayKeyId}:${razorpaySecret}`).toString('base64');
      const apiRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: orderNumber.slice(0, 40),
          notes: {
            order_id: String(orderId),
            order_number: orderNumber
          }
        })
      });

      if (!apiRes.ok) {
        const errBody = await apiRes.text();
        throw new Error(`Razorpay API error (${apiRes.status}): ${errBody}`);
      }
      rpOrder = await apiRes.json();
    }

    // 7. Update order with Razorpay order reference
    await supabase
      .from('orders')
      .update({ payment_reference: rpOrder.id })
      .eq('id', orderId);

    return res.status(200).json({
      success: true,
      order_id: orderId,
      order_number: orderNumber,
      razorpay_order_id: rpOrder.id,
      amount: rpOrder.amount, // in paise
      currency: rpOrder.currency || 'INR',
      key_id: razorpayKeyId
    });

  } catch (err) {
    console.error('Razorpay creation error:', err);
    return res.status(500).json({ error: 'Failed to create payment session: ' + err.message });
  }
}
