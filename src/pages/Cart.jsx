import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Tag, Check, Gift } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, cartSubtotal, clearCart } = useCart();

  // Coupon / Discount states
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [promoError, setPromoError] = useState('');

  // Checkout Form states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    if (promoCode.trim().toUpperCase() === 'PETALS10') {
      const discount = Math.round(cartSubtotal * 0.1);
      setDiscountAmount(discount);
      setCouponApplied('PETALS10');
      setPromoCode('');
    } else {
      setPromoError('Invalid coupon code. Try "PETALS10" for 10% off.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    // In a real app we'd submit formData + cartItems to the server here.
    setIsOrdered(true);
    clearCart();
  };

  const finalTotal = cartSubtotal - discountAmount;
  const shippingFee = cartSubtotal > 1499 ? 0 : 99;
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
          /* Checkout Order Confirmed Success Screen */
          <div className="checkout-success-container text-center animate-slide-up" style={{ padding: '60px 20px', maxWidth: '600px', margin: '0 auto' }}>
            <div className="success-badge-large">
              <Check size={48} />
            </div>
            <h2>Order Placed Successfully!</h2>
            <p className="order-success-msg">
              Thank you for shopping at Petals Ethnic, <strong>{formData.name}</strong>! We have received your order details.
            </p>
            <div className="order-details-box" style={{ background: 'var(--color-primary-light)', padding: '20px', borderRadius: 'var(--border-radius-md)', margin: '20px 0', textAlign: 'left' }}>
              <h4>Next Steps:</h4>
              <p>1. We will verify your shipping coordinates: <strong>{formData.city}, {formData.state}</strong>.</p>
              <p>2. A customer executive will contact you on WhatsApp/Phone at <strong>{formData.phone}</strong> to confirm delivery timelines.</p>
              <p>3. Dispatch confirmation will be emailed to <strong>{formData.email}</strong>.</p>
            </div>
            <Link to="/shop" className="btn btn-primary" style={{ marginTop: '10px' }}>
              Continue Shopping
            </Link>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty Cart Notice */
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
          /* Cart Line Items and Summary Panel */
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

                        {/* Visible text-based Remove action button */}
                        <div style={{ marginTop: '12px', textAlign: 'left' }}>
                          <button 
                            className="item-remove-btn-text"
                            onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                            aria-label="Remove item from cart"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#C94B4B',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            <Trash2 size={13} /> Remove
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
                
                {/* Calculations */}
                <div className="summary-rows">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{cartSubtotal}</span>
                  </div>
                  
                  {couponApplied && (
                    <div className="summary-row discount-row" style={{ color: '#C94B4B' }}>
                      <span className="flex-align-center"><Tag size={12} style={{ marginRight: '5px' }} /> Discount (10%)</span>
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

                {/* Checkout Trigger Button */}
                <button 
                  className="btn btn-primary checkout-btn" 
                  style={{ width: '100%', marginTop: '20px' }}
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </button>

                {/* Secure Badge */}
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
            <p>Please enter your delivery coordinates. Payment is Cash on Delivery / WhatsApp Pay, structured dynamically for your order.</p>
            
            <form onSubmit={handleOrderSubmit} className="checkout-details-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  required 
                />
              </div>

              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone / WhatsApp</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="e.g. 81138 99319"
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Shipping Address</label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  required 
                />
              </div>

              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input 
                    type="text" 
                    name="state" 
                    value={formData.state} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">ZIP / Pin Code</label>
                  <input 
                    type="text" 
                    name="zip" 
                    value={formData.zip} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    required 
                  />
                </div>
              </div>

              <div className="checkout-summary-strip" style={{ background: '#FAF7F5', padding: '15px', borderRadius: 'var(--border-radius-sm)', marginBottom: '20px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--color-neutral-muted)' }}>
                  <span>Items Subtotal:</span>
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

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Place Order (Pay on Delivery)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
