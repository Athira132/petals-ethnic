import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Tag, Check, Gift, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, cartSubtotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Settings & Configurations
  const [storeSettings, setStoreSettings] = useState({
    delivery_charge: 99,
    free_delivery_threshold: 1499,
    upi_enabled: true,
    razorpay_enabled: true
  });

  // Coupon / Discount states
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [promoError, setPromoError] = useState('');

  // Checkout Form states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isOrdered, setIsOrdered] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    notes: ''
  });

  // Fetch Store Settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .single();
        if (error) throw error;
        if (data) {
          setStoreSettings(data);
          // Set default payment method based on what is active
          if (data.razorpay_enabled) {
            setPaymentMethod('razorpay');
          } else if (data.upi_enabled) {
            setPaymentMethod('upi');
          } else {
            setPaymentMethod('cod');
          }
        }
      } catch (err) {
        console.warn('Could not load store delivery configurations:', err.message);
      }
    };
    fetchSettings();
  }, []);

  // Pre-fill user data if profile updates
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || ''
      }));
    }
  }, [profile]);

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    setPromoError('');
    setDiscountAmount(0);
    setCouponApplied('');

    if (!promoCode.trim()) return;

    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', promoCode.trim().toUpperCase())
        .eq('active', true)
        .single();

      if (error || !coupon) {
        setPromoError('Invalid coupon code.');
        return;
      }

      // Check Expiry
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        setPromoError('This coupon code has expired.');
        return;
      }

      // Check Minimum Purchase
      if (cartSubtotal < Number(coupon.minimum_order_amount)) {
        setPromoError(`Minimum purchase of ₹${coupon.minimum_order_amount} required.`);
        return;
      }

      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = Math.round(cartSubtotal * (Number(coupon.discount_value) / 100));
      } else {
        discount = Number(coupon.discount_value);
      }

      setDiscountAmount(discount);
      setCouponApplied(coupon.code);
      setPromoCode('');

    } catch (err) {
      setPromoError('Failed to validate promo code.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit checkout order
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setCheckoutError('');
    setLoading(true);

    try {
      if (paymentMethod === 'razorpay') {
        // 1. ONLINE PAYMENT: Call serverless endpoint to create Razorpay checkout order
        const res = await fetch('/api/razorpay-create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            items: cartItems.map(item => ({
              product_id: item.product.id,
              size: item.size,
              quantity: item.quantity
            })),
            order_data: {
              user_id: user?.id || null,
              customer_name: formData.name,
              customer_email: formData.email,
              customer_phone: formData.phone,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              pincode: formData.zip,
              notes: formData.notes
            },
            coupon_code: couponApplied || null
          })
        });

        const rpData = await res.json();
        if (!res.ok || !rpData.success) {
          throw new Error(rpData.error || 'Failed to initialize payment.');
        }

        // Redirect to processing view
        navigate(`/checkout-payment?orderId=${rpData.order_id}&razorpayOrderId=${rpData.razorpay_order_id}&amount=${rpData.amount}&keyId=${rpData.key_id}`);
        return;

      } else {
        // 2. MANUAL PAYMENT (UPI / COD): Register order immediately in the database
        const orderNumber = 'PE' + Math.floor(10000 + Math.random() * 90000);
        
        const { data: order, error: orderErr } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            user_id: user?.id || null,
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.zip,
            subtotal: cartSubtotal,
            discount: discountAmount,
            delivery_charge: shippingFee,
            total: grandTotal,
            payment_method: paymentMethod,
            payment_status: 'pending',
            order_status: 'pending',
            notes: formData.notes
          })
          .select('id')
          .single();

        if (orderErr) throw orderErr;

        // Insert Order Items snapshots
        for (const item of cartItems) {
          const activePrice = item.product.salePrice || item.product.price;
          await supabase
            .from('order_items')
            .insert({
              order_id: order.id,
              product_id: item.product.id,
              product_name: item.product.name,
              product_image: item.product.images[0] || '',
              size: item.size,
              quantity: item.quantity,
              unit_price: activePrice,
              total_price: activePrice * item.quantity
            });
        }

        if (paymentMethod === 'cod') {
          // COD: Deduct stock immediately
          const { error: rpcErr } = await supabase.rpc('deduct_order_stock', { p_order_id: order.id });
          if (rpcErr) throw rpcErr;
          
          setOrderInfo({ order_number: orderNumber });
          setIsOrdered(true);
          setIsCheckoutOpen(false);
          clearCart();
        } else {
          // UPI: Redirect to display QR code and input transaction UTR
          navigate(`/checkout-payment?orderId=${order.id}`);
        }
      }

    } catch (err) {
      setCheckoutError(err.message || 'Failed to register order. Please verify cart items stock.');
    } finally {
      setLoading(false);
    }
  };

  const finalTotal = cartSubtotal - discountAmount;
  const shippingFee = cartSubtotal > Number(storeSettings.free_delivery_threshold) ? 0 : Number(storeSettings.delivery_charge);
  const grandTotal = finalTotal + shippingFee;

  return (
    <div className="cart-page-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>Shopping Bag</h1>
          <div className="breadcrumbs">
            <Link to="/">Home</Link> <span>/</span> <span className="active-breadcrumb">Shopping Bag</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '80px' }}>
        {isOrdered ? (
          /* COD Success Screen */
          <div className="checkout-success-container text-center animate-slide-up" style={{ padding: '60px 20px', maxWidth: '600px', margin: '0 auto' }}>
            <div className="success-badge-large" style={{ display: 'inline-flex', padding: '16px', background: '#EAF8EB', color: '#4E8752', borderRadius: '50%', marginBottom: '20px' }}>
              <Check size={48} />
            </div>
            <h2>Order Placed Successfully!</h2>
            <p className="order-success-msg">
              Thank you for shopping at Petals Ethnic, <strong>{formData.name}</strong>! Your Cash on Delivery order has been registered.
            </p>
            <div className="order-details-box" style={{ background: 'var(--color-primary-light)', padding: '20px', borderRadius: 'var(--border-radius-md)', margin: '20px 0', textAlign: 'left', border: '1px solid var(--color-border)' }}>
              <p>Order Number: <strong>{orderInfo?.order_number}</strong></p>
              <p>Shipping Address: <strong>{formData.address}, {formData.city}, {formData.state} - {formData.zip}</strong></p>
              <p>Payment: <strong>Cash on Delivery (Pending Verification)</strong></p>
            </div>
            <Link to="/shop" className="btn btn-primary" style={{ marginTop: '10px' }}>
              Continue Shopping
            </Link>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty Bag Notice */
          <div className="cart-empty-state text-center animate-slide-up" style={{ padding: '60px 20px' }}>
            <ShoppingBag size={64} strokeWidth={1} style={{ color: 'var(--color-primary-dark)', marginBottom: '20px' }} />
            <h2>Your Shopping Bag is Empty</h2>
            <p style={{ maxWidth: '400px', margin: '15px auto 25px', color: 'var(--color-neutral-muted)' }}>
              Looks like you haven't added any elegant ethnic outfits to your bag yet.
            </p>
            <Link to="/shop" className="btn btn-primary">
              Browse Boutique Collections
            </Link>
          </div>
        ) : (
          /* Cart Listing and Checkout summary */
          <div className="cart-layout-grid animate-slide-up">
            {/* Left Column: Items */}
            <div className="cart-items-column">
              <h3>Bagged Items ({cartItems.length})</h3>
              
              <div className="cart-items-list">
                {cartItems.map((item) => {
                  const activePrice = item.product.salePrice || item.product.price;
                  return (
                    <div key={`${item.product.id}-${item.size}-${item.color}`} className="cart-page-item">
                      <img src={item.product.images[0]} alt={item.product.name} className="cart-item-img" />
                      
                      <div className="cart-item-details">
                        <div className="item-title-row">
                          <Link to={`/product/${item.product.id}`} className="item-name">
                            {item.product.name}
                          </Link>
                        </div>
                        
                        <p className="item-meta">
                          Size: <strong>{item.size}</strong> {item.color ? `| Color: ${item.color}` : ''}
                        </p>

                        <div className="item-qty-price-row">
                          <div className="qty-selector-container">
                            <button onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}>+</button>
                          </div>
                          
                          <div className="item-pricing">
                            {item.product.salePrice && (
                              <span className="original-strike">₹{item.product.price * item.quantity}</span>
                            )}
                            <span className="active-item-total">₹{activePrice * item.quantity}</span>
                          </div>
                        </div>

                        <div style={{ marginTop: '12px', textAlign: 'left' }}>
                          <button 
                            className="item-remove-btn-text"
                            onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                            style={{ background: 'transparent', border: 'none', color: '#C94B4B', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                          >
                            <Trash2 size={13} style={{ marginRight: '4px', display: 'inline' }} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="cart-summary-column">
              <div className="summary-card">
                <h3>Order Summary</h3>
                
                <div className="summary-rows">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{cartSubtotal}</span>
                  </div>
                  
                  {couponApplied && (
                    <div className="summary-row discount-row" style={{ color: '#C94B4B' }}>
                      <span className="flex-align-center"><Tag size={12} style={{ marginRight: '5px' }} /> Discount ({couponApplied})</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>{shippingFee === 0 ? <strong style={{ color: '#4E8752' }}>FREE</strong> : `₹${shippingFee}`}</span>
                  </div>
                  
                  <div className="summary-divider"></div>
                  
                  <div className="summary-row grand-total-row">
                    <span>Grand Total</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="promo-code-container">
                  {couponApplied ? (
                    <div className="applied-promo">
                      <span className="flex-align-center"><Gift size={14} style={{ marginRight: '6px' }} /> Coupon <strong>{couponApplied}</strong> Applied!</span>
                      <button onClick={() => { setDiscountAmount(0); setCouponApplied(''); }} className="remove-promo-btn">Remove</button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="promo-form">
                      <input 
                        type="text" 
                        placeholder="Promo Code" 
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="form-input promo-input"
                      />
                      <button type="submit" className="btn btn-outline promo-btn">Apply</button>
                    </form>
                  )}
                  {promoError && <p className="promo-error">{promoError}</p>}
                </div>

                <button 
                  className="btn btn-primary checkout-btn" 
                  style={{ width: '100%', marginTop: '20px' }}
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </button>

                <div className="secure-badge" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '15px', color: 'var(--color-neutral-muted)', fontSize: '0.8rem' }}>
                  <ShieldCheck size={16} />
                  <span>Petals Secure Checkout Support</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CHECKOUT INFORMATION MODAL */}
      {isCheckoutOpen && (
        <div className="checkout-modal-overlay animate-fade-in">
          <div className="checkout-modal-backdrop" onClick={() => setIsCheckoutOpen(false)}></div>
          <div className="checkout-modal-panel animate-slide-up">
            <button className="checkout-modal-close" onClick={() => setIsCheckoutOpen(false)}>✕</button>
            <h2>Checkout Details</h2>
            <p>Please enter your coordinates. Sizing stock is reserved upon order registry.</p>

            {checkoutError && (
              <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#FFF5F5', color: '#C94B4B', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid #FFD8D8' }}>
                <AlertCircle size={16} />
                <span>{checkoutError}</span>
              </div>
            )}
            
            <form onSubmit={handleOrderSubmit} className="checkout-details-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" required />
              </div>

              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone / WhatsApp</label>
                  <input type="tel" name="phone" placeholder="e.g. 81138 99319" value={formData.phone} onChange={handleInputChange} className="form-input" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Shipping Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="form-input" required />
              </div>

              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Pin Code</label>
                  <input type="text" name="zip" value={formData.zip} onChange={handleInputChange} className="form-input" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Order Notes (Optional)</label>
                <input type="text" name="notes" placeholder="Any delivery instructions..." value={formData.notes} onChange={handleInputChange} className="form-input" />
              </div>

              {/* PAYMENT OPTION SELECTOR */}
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '15px', textAlign: 'left' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-dark)', display: 'block', marginBottom: '10px' }}>Select Payment Option:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  
                  {storeSettings.razorpay_enabled && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8F9FA', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input type="radio" name="payment_method" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} />
                      <span><strong>Pay Online Now</strong> (Cards, UPI, Netbanking via Razorpay)</span>
                    </label>
                  )}

                  {storeSettings.upi_enabled && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8F9FA', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input type="radio" name="payment_method" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                      <span><strong>Scan UPI QR Code</strong> (Manual verification)</span>
                    </label>
                  )}

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8F9FA', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input type="radio" name="payment_method" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                    <span><strong>Cash on Delivery (COD)</strong></span>
                  </label>
                </div>
              </div>

              {/* Total breakdown */}
              <div className="checkout-summary-strip" style={{ background: '#FAF7F5', padding: '15px', borderRadius: 'var(--border-radius-sm)', margin: '20px 0', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--color-neutral-muted)' }}>
                  <span>Subtotal:</span>
                  <span>₹{cartSubtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#C94B4B' }}>
                    <span>Promo Applied:</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--color-neutral-muted)' }}>
                  <span>Shipping:</span>
                  <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', fontSize: '1rem', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                  <span>Total Amount Payable:</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', height: '46px', fontWeight: 600 }}>
                {loading ? 'Processing Order...' : paymentMethod === 'razorpay' ? 'Proceed to Online Payment' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
