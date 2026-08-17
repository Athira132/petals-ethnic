import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { QrCode, CreditCard, Clipboard, Check, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CheckoutPayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const orderId = searchParams.get('orderId');
  const rpOrderIdParam = searchParams.get('razorpayOrderId');
  const amountParam = searchParams.get('amount');
  const keyIdParam = searchParams.get('keyId');

  const [order, setOrder] = useState(null);
  const [storeSettings, setStoreSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // UPI UTR States
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Load Order and settings on mount
  useEffect(() => {
    if (!orderId) {
      setPaymentError('Order ID parameter is missing.');
      setLoading(false);
      return;
    }
    fetchOrderAndSettings();
  }, [orderId]);

  const fetchOrderAndSettings = async () => {
    try {
      setLoading(true);
      // 1. Fetch Order details
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderErr || !orderData) {
        setPaymentError('We could not retrieve details for this order.');
        return;
      }
      setOrder(orderData);

      // 2. Fetch Store settings (UPI details)
      const { data: settingsData, error: settingsErr } = await supabase
        .from('store_settings')
        .select('*')
        .single();

      if (settingsErr) throw settingsErr;
      setStoreSettings(settingsData);

      // 3. Launch Razorpay automatically if parameters are passed and unpaid
      if (orderData.payment_method === 'razorpay' && orderData.payment_status === 'pending' && rpOrderIdParam) {
        initiateRazorpayPayment(orderData, settingsData);
      }

    } catch (err) {
      console.error('Payment preparation error:', err.message);
      setPaymentError('Failed to prepare checkout gateway.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // RAZORPAY FRONTEND SDK GATEWAY
  // -------------------------------------------------------------
  const initiateRazorpayPayment = async (orderData, settings) => {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      setPaymentError('Razorpay payment gateway failed to load. Please check your internet connection.');
      return;
    }

    try {
      const options = {
        key: keyIdParam,
        amount: Number(amountParam),
        currency: 'INR',
        name: settings.store_name || 'Petals Ethnic',
        description: `Order ${orderData.order_number}`,
        order_id: rpOrderIdParam,
        handler: async function (response) {
          setLoading(true);
          setPaymentError('');

          try {
            // Call serverless endpoint to verify Razorpay signature
            const verifyRes = await fetch('/api/razorpay-verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderData.id
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment signature verification checks failed.');
            }

            clearCart();
            setPaymentSuccess(true);
            setOrder(prev => ({
              ...prev,
              payment_status: 'paid',
              order_status: 'confirmed'
            }));

          } catch (err) {
            setPaymentError(err.message || 'Signature check failed. Contact support with your payment ID.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: orderData.customer_name,
          email: orderData.customer_email,
          contact: orderData.customer_phone
        },
        theme: {
          color: '#E07A5F'
        },
        modal: {
          ondismiss: function () {
            setPaymentError('Payment window closed. You can retry clicking the Payment button below.');
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      setPaymentError('Error opening Razorpay checkout page.');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // -------------------------------------------------------------
  // UPI MANUAL FLOW HANDLERS
  // -------------------------------------------------------------
  const handleUpiSubmit = async (e) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      alert('Please enter a valid Transaction UTR / Ref reference number.');
      return;
    }

    setSubmitLoading(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'awaiting_verification',
          payment_reference: utrNumber.trim(),
          notes: (order.notes || '') + `\nManual UPI Payment submitted. UTR: ${utrNumber.trim()}`
        })
        .eq('id', order.id);

      if (error) throw error;

      clearCart();
      setPaymentSuccess(true);
      setOrder(prev => ({
        ...prev,
        payment_status: 'awaiting_verification',
        payment_reference: utrNumber.trim()
      }));

    } catch (err) {
      alert('Failed to submit reference: ' + err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(storeSettings?.upi_id);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  if (loading) {
    return (
      <div className="container text-center" style={{ padding: '120px 20px' }}>
        <div className="loading-spinner" style={{ border: '3px solid var(--color-primary-light)', borderTop: '3px solid var(--color-rose)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
        <p style={{ color: 'var(--color-neutral-muted)', fontSize: '0.9rem' }}>Connecting to Payment Gateway...</p>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper container" style={{ padding: '80px 20px', maxWidth: '640px' }}>
      
      {/* 1. PAYMENT ERROR VIEW */}
      {paymentError && (
        <div className="alert alert-error animate-slide-up" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '15px', background: '#FFF5F5', color: '#C94B4B', borderRadius: '4px', fontSize: '0.9rem', marginBottom: '30px', border: '1px solid #FFD8D8' }}>
          <AlertCircle size={20} />
          <span>{paymentError}</span>
        </div>
      )}

      {/* 2. SUCCESS SCREEN */}
      {paymentSuccess || order?.payment_status === 'paid' || order?.payment_status === 'awaiting_verification' ? (
        <div className="checkout-success-container text-center animate-slide-up" style={{ background: 'white', padding: '50px 40px', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'inline-flex', padding: '16px', background: '#EAF8EB', color: '#4E8752', borderRadius: '50%', marginBottom: '20px' }}>
            <Check size={48} />
          </div>
          <h2>Payment Registered!</h2>
          <p style={{ color: 'var(--color-neutral-muted)', marginTop: '10px' }}>
            Order <strong>{order?.order_number}</strong> is successfully locked.
          </p>

          <div style={{ background: '#FAF7F5', padding: '20px', borderRadius: '4px', margin: '25px 0', border: '1px solid var(--color-border)', textAlign: 'left' }}>
            <p style={{ margin: '0 0 5px' }}>Payment Status: <strong style={{ color: order?.payment_status === 'paid' ? '#4E8752' : 'var(--color-gold)' }}>{order?.payment_status.replace(/_/g, ' ').toUpperCase()}</strong></p>
            <p style={{ margin: '0 0 5px' }}>Fulfillment: <strong>{order?.order_status.toUpperCase()}</strong></p>
            {order?.payment_status === 'awaiting_verification' && (
              <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-muted)', marginTop: '10px' }}>
                * Our support team is verifying your UPI transfer reference ({order?.payment_reference}). Sizing stock has been reserved.
              </p>
            )}
          </div>

          <Link to="/shop" className="btn btn-primary" style={{ width: '100%' }}>
            Continue Shopping
          </Link>
        </div>
      ) : (
        /* 3. GATEWAY INTERFACES */
        <div className="animate-slide-up" style={{ background: 'white', padding: '40px', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', margin: '0 0 8px' }}>Complete Checkout Payment</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-neutral-muted)' }}>Order ID: <strong>{order?.order_number}</strong> | Amount Due: <strong>₹{order?.total}</strong></p>
          </div>

          {/* Option A: Razorpay */}
          {order?.payment_method === 'razorpay' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ background: '#F4FBF7', color: '#1E88E5', padding: '15px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', border: '1px solid #D0E8FF' }}>
                <CreditCard size={20} />
                <span style={{ fontSize: '0.85rem', textAlign: 'left' }}>Secure online credit card, net banking, or auto-UPI transactions via Razorpay.</span>
              </div>
              <button
                onClick={() => initiateRazorpayPayment(order, storeSettings)}
                className="btn btn-primary"
                style={{ width: '100%', height: '46px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                Pay Online Now (Razorpay) <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Option B: UPI Manual */}
          {order?.payment_method === 'upi' && (
            <div style={{ textAlign: 'left' }}>
              <div style={{ background: '#FAF7F5', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '20px', marginBottom: '25px', textAlign: 'center' }}>
                <h4 style={{ fontFamily: 'var(--font-serif)', margin: '0 0 15px' }}>Scan & Pay Manual UPI QR</h4>
                
                {storeSettings?.upi_qr_url ? (
                  <img
                    src={storeSettings.upi_qr_url}
                    alt="UPI Payment QR Code"
                    style={{ width: '200px', height: '200px', objectFit: 'contain', margin: '0 auto 15px', display: 'block', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '8px', background: 'white' }}
                  />
                ) : (
                  <div style={{ padding: '30px 10px', background: 'white', borderRadius: '4px', border: '1px solid var(--color-border)', maxWidth: '200px', margin: '0 auto 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <QrCode size={40} style={{ color: 'var(--color-neutral-muted)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-muted)' }}>Scan using any UPI App</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '360px', margin: '0 auto', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--color-neutral-muted)' }}>Business Name:</span>
                    <strong style={{ color: 'var(--color-neutral-dark)' }}>{storeSettings?.upi_name || 'Petals Ethnic'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--color-neutral-muted)' }}>UPI ID:</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <strong style={{ color: 'var(--color-neutral-dark)' }}>{storeSettings?.upi_id}</strong>
                      <button onClick={handleCopyUpi} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-rose)', display: 'flex', padding: 0 }}>
                        {copiedUpi ? <Check size={12} /> : <Clipboard size={12} />}
                      </button>
                    </span>
                  </div>
                  {storeSettings?.upi_phone && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--color-neutral-muted)' }}>Phone:</span>
                      <strong style={{ color: 'var(--color-neutral-dark)' }}>{storeSettings.upi_phone}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--color-neutral-muted)' }}>Amount Payable:</span>
                    <strong style={{ color: 'var(--color-rose)' }}>₹{order?.total}</strong>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div style={{ marginBottom: '25px', fontSize: '0.8rem', color: 'var(--color-neutral-muted)', lineHeight: '1.5' }}>
                <h5 style={{ color: 'var(--color-neutral-dark)', margin: '0 0 6px' }}>Payment Instructions:</h5>
                <p>{storeSettings?.payment_instructions || '1. Scan the QR code or pay using the UPI ID.\n2. Complete the payment inside your UPI App.\n3. Paste the transaction reference number (UTR / Ref ID) below to verify.'}</p>
              </div>

              {/* Reference input form */}
              <form onSubmit={handleUpiSubmit} style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Transaction UTR / Reference ID</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter 12-digit UPI Transaction Ref ID"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.9rem' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="btn btn-primary"
                  style={{ width: '100%', height: '44px', fontWeight: 600 }}
                >
                  {submitLoading ? 'Registering Payment...' : 'I Have Paid (Verify)'}
                </button>
              </form>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
