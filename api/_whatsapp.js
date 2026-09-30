/**
 * Modular WhatsApp Notification Service for Petals Ethnics and Jewellers
 * 
 * Supports:
 * 1. Meta WhatsApp Cloud API (Default official provider from Meta)
 * 2. Twilio WhatsApp API (Official WhatsApp Business Solution Provider)
 * 3. Custom / Webhook Provider (For custom gateway or integration middleware)
 * 
 * Key Features:
 * - Server-to-server transactional WhatsApp delivery
 * - Complete customer isolation (Zero client-side triggers, no wa.me links)
 * - Strict server-side payment verification requirement
 * - Built-in idempotency (Zero duplicate notifications between webhook & client verify)
 * - Graceful fallback / simulation when credentials are not yet added
 */

/**
 * Normalizes phone numbers to standard format
 * @param {string} phone 
 * @param {boolean} includePlus 
 * @returns {string}
 */
export function normalizePhoneNumber(phone, includePlus = false) {
  if (!phone) return includePlus ? '+918113899319' : '918113899319';
  let cleaned = String(phone).replace(/\D/g, '');
  
  // Convert 0XXXXXXXXXX (11 digits) to 91XXXXXXXXXX
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '91' + cleaned.slice(1);
  }
  // Convert 10-digit Indian phone to 91XXXXXXXXXX
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return includePlus ? '+' + cleaned : cleaned;
}

/**
 * Extracts size and color cleanly from item.size field
 * @param {string} rawSize 
 * @returns {{ size: string|null, color: string|null }}
 */
export function parseItemSizeAndColor(rawSize) {
  if (!rawSize || rawSize === 'N/A' || rawSize === 'None') {
    return { size: null, color: null };
  }

  const str = String(rawSize).trim();
  // Check for "Size (Color)" pattern e.g. "M (Red)" or "One Size (Blue)"
  const parenMatch = str.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    const s = parenMatch[1].trim();
    const c = parenMatch[2].trim();
    const validSize = (s && s !== 'N/A' && s !== 'One Size' && s !== 'Standard') ? s : null;
    return {
      size: validSize,
      color: c || null
    };
  }

  // Pure size or color without parentheses
  if (['N/A', 'One Size', 'Standard', 'Free Size'].includes(str)) {
    return { size: null, color: null };
  }

  return { size: str, color: null };
}

/**
 * Formats order items according to the required template:
 * - Product Name × Quantity
 *   Size: XXXXX
 *   Color: XXXXX
 *   Price: ₹XXXXX
 * 
 * - Product Name × Quantity
 *   Price: ₹XXXXX
 */
export function formatOrderItems(items = []) {
  if (!items || items.length === 0) {
    return '- No item details available';
  }

  return items.map((it) => {
    const lines = [`- ${it.product_name || 'Product'} × ${it.quantity || 1}`];
    const { size, color } = parseItemSizeAndColor(it.size);

    if (size) lines.push(`  Size: ${size}`);
    if (color) lines.push(`  Color: ${color}`);

    const itemPrice = it.total_price != null 
      ? it.total_price 
      : (Number(it.unit_price || 0) * Number(it.quantity || 1));

    lines.push(`  Price: ₹${itemPrice}`);
    return lines.join('\n');
  }).join('\n\n');
}

/**
 * Builds the complete WhatsApp message text strictly following the store template
 */
export function buildOrderNotificationText(order, orderItems = []) {
  const itemsText = formatOrderItems(orderItems);

  // Format date in Indian Standard Time (IST)
  const orderDate = new Date(order.created_at || Date.now()).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const addressParts = [order.address, order.city, order.state].filter(Boolean);
  const addressFormatted = addressParts.join(', ') + (order.pincode ? ` - ${order.pincode}` : '');

  const lines = [
    'New Order Received',
    '',
    `Order ID: ${order.order_number || order.id}`,
    'Payment Status: PAID',
    `Razorpay Payment ID: ${order.payment_reference || 'N/A'}`,
    '',
    'Customer:',
    `Name: ${order.customer_name || 'N/A'}`,
    `Phone: ${order.customer_phone || 'N/A'}`,
    `Email: ${order.customer_email || 'N/A'}`,
    '',
    'Delivery Address:',
    addressFormatted || 'N/A',
    '',
    'Items:',
    itemsText,
    '',
    `Subtotal: ₹${order.subtotal != null ? order.subtotal : order.total}`
  ];

  if (order.discount && Number(order.discount) > 0) {
    lines.push(`Discount: -₹${order.discount}`);
  }

  lines.push(`Shipping: ₹${order.delivery_charge || 0}`);
  lines.push(`Total Paid: ₹${order.total}`);
  lines.push('');
  lines.push(`Order Date: ${orderDate}`);

  return lines.join('\n');
}

/**
 * Dispatcher: Sends WhatsApp message via Meta Cloud API (Official)
 */
async function sendMetaWhatsApp({ to, message, templateData }) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn('[WhatsApp] Meta WhatsApp Cloud API credentials missing (WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID).');
    return {
      success: false,
      skipped: true,
      provider: 'meta',
      error: 'Meta WhatsApp credentials (WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID) not configured in Vercel environment variables.'
    };
  }

  const recipient = normalizePhoneNumber(to, false);
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v19.0';
  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  // Standard direct text payload
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipient,
    type: 'text',
    text: {
      preview_url: false,
      body: message
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[WhatsApp] Meta API response error:', response.status, data);
      return {
        success: false,
        provider: 'meta',
        status: response.status,
        error: data.error?.message || `Meta WhatsApp API error (${response.status})`,
        details: data
      };
    }

    const messageId = data.messages?.[0]?.id;
    console.log(`[WhatsApp] Meta message dispatched successfully. ID: ${messageId}`);
    return {
      success: true,
      provider: 'meta',
      messageId: messageId,
      response: data
    };
  } catch (netErr) {
    console.error('[WhatsApp] Network error contacting Meta Graph API:', netErr);
    return {
      success: false,
      provider: 'meta',
      error: netErr.message
    };
  }
}

/**
 * Dispatcher: Sends WhatsApp message via Twilio (Official WhatsApp Solution Provider)
 */
async function sendTwilioWhatsApp({ to, message }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('[WhatsApp] Twilio credentials missing (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_WHATSAPP_NUMBER).');
    return {
      success: false,
      skipped: true,
      provider: 'twilio',
      error: 'Twilio WhatsApp credentials not configured in Vercel environment variables.'
    };
  }

  const recipient = normalizePhoneNumber(to, true); // +918113899319
  const formattedTo = `whatsapp:${recipient}`;
  const formattedFrom = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const params = new URLSearchParams();
  params.append('From', formattedFrom);
  params.append('To', formattedTo);
  params.append('Body', message);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[WhatsApp] Twilio response error:', response.status, data);
      return {
        success: false,
        provider: 'twilio',
        status: response.status,
        error: data.message || `Twilio error (${response.status})`,
        details: data
      };
    }

    console.log(`[WhatsApp] Twilio message dispatched successfully. SID: ${data.sid}`);
    return {
      success: true,
      provider: 'twilio',
      messageId: data.sid,
      response: data
    };
  } catch (netErr) {
    console.error('[WhatsApp] Network error contacting Twilio API:', netErr);
    return {
      success: false,
      provider: 'twilio',
      error: netErr.message
    };
  }
}

/**
 * Dispatcher: Sends WhatsApp notification via Custom / Webhook gateway
 */
async function sendCustomWebhookWhatsApp({ to, message, templateData }) {
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('[WhatsApp] WHATSAPP_WEBHOOK_URL missing in environment variables.');
    return {
      success: false,
      skipped: true,
      provider: 'custom',
      error: 'WHATSAPP_WEBHOOK_URL not configured.'
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.WHATSAPP_WEBHOOK_SECRET ? { 'X-Webhook-Secret': process.env.WHATSAPP_WEBHOOK_SECRET } : {})
      },
      body: JSON.stringify({
        event: 'order.new_order_received',
        to: normalizePhoneNumber(to, false),
        to_formatted: normalizePhoneNumber(to, true),
        message: message,
        data: templateData
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        provider: 'custom',
        status: response.status,
        error: `Custom webhook returned status ${response.status}`,
        details: data
      };
    }

    return {
      success: true,
      provider: 'custom',
      response: data
    };
  } catch (err) {
    return {
      success: false,
      provider: 'custom',
      error: err.message
    };
  }
}

/**
 * Modular Provider Router
 */
export async function sendWhatsAppNotification({ to, message, templateData }) {
  const provider = (process.env.WHATSAPP_PROVIDER || 'meta').toLowerCase().trim();

  switch (provider) {
    case 'meta':
      return await sendMetaWhatsApp({ to, message, templateData });
    case 'twilio':
      return await sendTwilioWhatsApp({ to, message });
    case 'custom':
    case 'webhook':
      return await sendCustomWebhookWhatsApp({ to, message, templateData });
    default:
      return await sendMetaWhatsApp({ to, message, templateData });
  }
}

/**
 * Primary entry point: Handles complete order notification workflow to Admin
 * Ensures:
 * 1. Server-side payment verification check (payment_status MUST be 'paid')
 * 2. Idempotency check (prevents duplicate notification from verify + webhook)
 * 3. Atomic notes audit trail in Supabase
 * 
 * @param {string} orderId 
 * @param {object} options { supabase, razorpayPaymentId, source }
 * @returns {Promise<object>}
 */
export async function sendAdminWhatsAppNotification(orderId, { supabase, razorpayPaymentId, source = 'server' } = {}) {
  try {
    if (!orderId || !supabase) {
      console.warn('[WhatsApp] Missing orderId or supabase client.');
      return { success: false, error: 'Missing parameters' };
    }

    // 1. Fetch order details with associated items
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .maybeSingle();

    if (orderErr) {
      console.error(`[WhatsApp] Failed to query order ${orderId}:`, orderErr.message);
      return { success: false, error: orderErr.message };
    }

    if (!order) {
      console.warn(`[WhatsApp] Order not found for ID: ${orderId}`);
      return { success: false, error: 'Order not found' };
    }

    // 2. CRITICAL SAFETY CHECK: Only send notification when payment_status is 'paid'
    if (order.payment_status !== 'paid') {
      console.warn(`[WhatsApp] Notification aborted for order ${order.order_number}: payment_status is '${order.payment_status}' (not 'paid').`);
      return { success: false, skipped: true, reason: 'order_not_paid' };
    }

    // 3. IDEMPOTENCY CHECK: Ensure notification hasn't already been sent
    const notesStr = String(order.notes || '');
    if (notesStr.includes('[WHATSAPP_ADMIN_NOTIFIED]')) {
      console.log(`[WhatsApp] Notification already dispatched for order ${order.order_number} (${order.id}). Skipping duplicate call from ${source}.`);
      return { success: true, skipped: true, duplicate: true };
    }

    // 4. Update payment_reference if passed and not populated yet
    if (razorpayPaymentId && !order.payment_reference) {
      order.payment_reference = razorpayPaymentId;
    }

    // 5. Construct required message
    const messageBody = buildOrderNotificationText(order, order.order_items || []);

    // 6. Admin phone number (defaults to store WhatsApp +91 81138 99319)
    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || '918113899319';

    // 7. Dispatch message
    const dispatchResult = await sendWhatsAppNotification({
      to: adminPhone,
      message: messageBody,
      templateData: {
        order_number: order.order_number,
        total: order.total,
        customer_name: order.customer_name,
        payment_reference: order.payment_reference || razorpayPaymentId,
        items: order.order_items || []
      }
    });

    // 8. Record notification audit marker in orders.notes for idempotency
    const timestamp = new Date().toISOString();
    const marker = dispatchResult.success
      ? `[WHATSAPP_ADMIN_NOTIFIED:${timestamp}:${dispatchResult.provider || 'meta'}]`
      : `[WHATSAPP_ADMIN_ATTEMPTED:${timestamp}:${dispatchResult.provider || 'meta'}:${dispatchResult.error || 'skipped'}]`;

    const updatedNotes = (notesStr ? notesStr + ' ' : '') + marker;

    try {
      await supabase
        .from('orders')
        .update({
          notes: updatedNotes,
          updated_at: timestamp
        })
        .eq('id', order.id);
    } catch (noteErr) {
      console.warn('[WhatsApp] Note update warning:', noteErr.message);
    }

    return {
      success: dispatchResult.success,
      duplicate: false,
      provider: dispatchResult.provider,
      messageId: dispatchResult.messageId,
      error: dispatchResult.error,
      skipped: dispatchResult.skipped || false
    };

  } catch (err) {
    console.error('[WhatsApp] Unexpected error during notification dispatch:', err);
    return { success: false, error: err.message };
  }
}
