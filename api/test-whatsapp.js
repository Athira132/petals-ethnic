import { sendWhatsAppNotification, buildOrderNotificationText } from './services/whatsapp.js';

export default async function handler(req, res) {
  // CORS Configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Security check: require either admin authorization or matching secret key
  const authSecret = req.query.secret || req.headers['x-admin-secret'];
  const expectedSecret = process.env.ADMIN_SECRET_KEY || process.env.RAZORPAY_KEY_SECRET?.slice(0, 10) || 'petals-admin-test';

  if (authSecret !== expectedSecret && authSecret !== 'petals-admin-test') {
    return res.status(401).json({
      error: 'Unauthorized: Pass ?secret=petals-admin-test (or configured ADMIN_SECRET_KEY) to run this test.'
    });
  }

  const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || '918113899319';
  const provider = (process.env.WHATSAPP_PROVIDER || 'meta').toLowerCase().trim();

  // Create mock order data matching the exact required notification format
  const mockOrder = {
    id: 'test-order-' + Date.now().toString().slice(-6),
    order_number: 'PE-TEST-' + Math.floor(1000 + Math.random() * 9000),
    customer_name: 'Priya Nair (Test Order)',
    customer_phone: '+91 94471 23456',
    customer_email: 'priya.nair@example.com',
    address: 'Flat 4B, Skyview Towers, Marine Drive',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '682011',
    subtotal: 1298,
    discount: 0,
    delivery_charge: 0,
    total: 1298,
    payment_status: 'paid',
    payment_reference: 'pay_test_' + Date.now().toString().slice(-8),
    created_at: new Date().toISOString()
  };

  const mockItems = [
    {
      product_name: 'Everyday Soft Cotton Straight Fit Kurti',
      quantity: 1,
      size: 'M (Red)',
      unit_price: 649,
      total_price: 649
    },
    {
      product_name: 'Antique Gold Plated Floral Choker Necklace',
      quantity: 1,
      size: 'N/A',
      unit_price: 649,
      total_price: 649
    }
  ];

  const testMessage = buildOrderNotificationText(mockOrder, mockItems);

  try {
    const dispatchResult = await sendWhatsAppNotification({
      to: adminPhone,
      message: testMessage,
      templateData: {
        order_number: mockOrder.order_number,
        total: mockOrder.total,
        customer_name: mockOrder.customer_name,
        payment_reference: mockOrder.payment_reference,
        items: mockItems
      }
    });

    return res.status(200).json({
      success: true,
      mode: 'safe_test_notification',
      provider: provider,
      admin_phone: adminPhone,
      dispatch_result: dispatchResult,
      sample_message: testMessage
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      provider: provider,
      admin_phone: adminPhone
    });
  }
}
