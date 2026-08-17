import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { supabase } from '../lib/supabase';
import { User, FileText, MapPin, Heart, LogOut, Check, Plus, Trash2, ArrowLeft, Package } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Account() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form States
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Address States
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    address_line: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false
  });

  // Order States
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  // Sync profile details
  useEffect(() => {
    if (profile) {
      setEditName(profile.name || '');
      setEditPhone(profile.phone || '');
    }
  }, [profile]);

  // Fetch orders and addresses
  useEffect(() => {
    if (user) {
      fetchAddresses();
      fetchOrders();
    }
  }, [user]);

  // -------------------------------------------------------------
  // 1. ORDERS API
  // -------------------------------------------------------------
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchOrderItems = async (order) => {
    try {
      setItemsLoading(true);
      setSelectedOrder(order);
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      if (error) throw error;
      setSelectedOrderItems(data || []);
    } catch (err) {
      console.error('Error fetching order items:', err.message);
    } finally {
      setItemsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 2. ADDRESSES API
  // -------------------------------------------------------------
  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (err) {
      console.error('Error fetching addresses:', err.message);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddressLoading(true);

    try {
      if (addressForm.is_default) {
        // Reset defaults first
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      if (editingAddress) {
        // Update
        const { error } = await supabase
          .from('addresses')
          .update({
            name: addressForm.name,
            phone: addressForm.phone,
            address_line: addressForm.address_line,
            city: addressForm.city,
            state: addressForm.state,
            pincode: addressForm.pincode,
            is_default: addressForm.is_default,
            updated_at: new Date()
          })
          .eq('id', editingAddress.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('addresses')
          .insert({
            user_id: user.id,
            name: addressForm.name,
            phone: addressForm.phone,
            address_line: addressForm.address_line,
            city: addressForm.city,
            state: addressForm.state,
            pincode: addressForm.pincode,
            is_default: addresses.length === 0 ? true : addressForm.is_default
          });

        if (error) throw error;
      }

      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        name: '',
        phone: '',
        address_line: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false
      });
      await fetchAddresses();
    } catch (err) {
      console.error('Error saving address:', err.message);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleEditAddressClick = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      name: addr.name,
      phone: addr.phone,
      address_line: addr.address_line,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      is_default: addr.is_default
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addrId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    setAddressLoading(true);

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addrId);

      if (error) throw error;
      await fetchAddresses();
    } catch (err) {
      console.error('Error deleting address:', err.message);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addrId) => {
    setAddressLoading(true);
    try {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addrId);

      if (error) throw error;
      await fetchAddresses();
    } catch (err) {
      console.error('Error setting default address:', err.message);
    } finally {
      setAddressLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 3. PROFILE ACTIONS
  // -------------------------------------------------------------
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });
    setProfileLoading(true);

    try {
      await updateProfile({
        name: editName,
        phone: editPhone
      });
      setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setProfileMsg({ text: err.message || 'Failed to update profile details.', type: 'error' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Signout error:', err.message);
    }
  };

  return (
    <div className="account-page-wrapper container" style={{ padding: '60px 20px', minHeight: '80vh' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '40px', alignItems: 'start' }}>
        
        {/* Left Side: Sidebar Tabs Navigation */}
        <aside style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ padding: '15px 10px', borderBottom: '1px solid var(--color-border)', marginBottom: '15px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', margin: 0, fontSize: '1.2rem' }}>Hello,</h3>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-rose)', fontWeight: 600 }}>{profile?.name || 'Customer'}</span>
          </div>

          <button 
            onClick={() => { setActiveTab('profile'); setSelectedOrder(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 15px', border: 'none', borderRadius: '4px', background: activeTab === 'profile' ? 'var(--color-rose)' : 'transparent', color: activeTab === 'profile' ? 'white' : 'var(--color-neutral-dark)', cursor: 'pointer', fontWeight: 600, textAlign: 'left' }}
          >
            <User size={16} /> Profile Details
          </button>

          <button 
            onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 15px', border: 'none', borderRadius: '4px', background: activeTab === 'orders' ? 'var(--color-rose)' : 'transparent', color: activeTab === 'orders' ? 'white' : 'var(--color-neutral-dark)', cursor: 'pointer', fontWeight: 600, textAlign: 'left' }}
          >
            <FileText size={16} /> My Orders
          </button>

          <button 
            onClick={() => { setActiveTab('addresses'); setSelectedOrder(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 15px', border: 'none', borderRadius: '4px', background: activeTab === 'addresses' ? 'var(--color-rose)' : 'transparent', color: activeTab === 'addresses' ? 'white' : 'var(--color-neutral-dark)', cursor: 'pointer', fontWeight: 600, textAlign: 'left' }}
          >
            <MapPin size={16} /> Delivery Addresses
          </button>

          <button 
            onClick={() => { setActiveTab('wishlist'); setSelectedOrder(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 15px', border: 'none', borderRadius: '4px', background: activeTab === 'wishlist' ? 'var(--color-rose)' : 'transparent', color: activeTab === 'wishlist' ? 'white' : 'var(--color-neutral-dark)', cursor: 'pointer', fontWeight: 600, textAlign: 'left' }}
          >
            <Heart size={16} /> My Wishlist ({wishlist.length})
          </button>

          <button 
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 15px', border: 'none', borderRadius: '4px', background: 'transparent', color: '#C94B4B', cursor: 'pointer', fontWeight: 600, textAlign: 'left', marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '15px' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </aside>

        {/* Right Side: Tab Viewport Content */}
        <main style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', padding: '40px', minHeight: '500px', textAlign: 'left' }}>
          
          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in">
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '25px' }}>Profile Settings</h2>

              {profileMsg.text && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: profileMsg.type === 'success' ? '#EAF8EB' : '#FFF5F5', color: profileMsg.type === 'success' ? '#4E8752' : '#C94B4B', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '20px', border: profileMsg.type === 'success' ? '1px solid #C1EFC4' : '1px solid #FFD8D8' }}>
                  {profileMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '480px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address (Login ID)</label>
                  <input type="text" value={user.email} disabled style={{ width: '100%', height: '42px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: '#F8F9FA', color: 'var(--color-neutral-muted)', cursor: 'not-allowed' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
                  <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone / WhatsApp Number</label>
                  <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="e.g. +91 98765 43210" style={{ width: '100%', height: '42px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
                </div>

                <button type="submit" disabled={profileLoading} className="btn btn-primary" style={{ width: '160px', height: '44px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '10px' }}>
                  {profileLoading ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {activeTab === 'orders' && !selectedOrder && (
            <div className="animate-fade-in">
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '25px' }}>Order History</h2>

              {ordersLoading ? (
                <p style={{ color: 'var(--color-neutral-muted)' }}>Retrieving purchase history...</p>
              ) : orders.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-neutral-muted)' }}>
                  <Package size={48} style={{ color: 'var(--color-border)', marginBottom: '15px' }} />
                  <p>You have not placed any orders yet.</p>
                  <Link to="/shop" className="btn btn-outline" style={{ marginTop: '15px' }}>Start Shopping</Link>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-neutral-muted)' }}>
                      <th style={{ padding: '12px 10px' }}>Order ID</th>
                      <th style={{ padding: '12px 10px' }}>Date</th>
                      <th style={{ padding: '12px 10px' }}>Status</th>
                      <th style={{ padding: '12px 10px' }}>Total</th>
                      <th style={{ padding: '12px 10px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => (
                      <tr key={ord.id} style={{ borderBottom: '1px solid var(--color-border)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '15px 10px', fontWeight: 'bold' }}>{ord.order_number}</td>
                        <td style={{ padding: '15px 10px' }}>{new Date(ord.created_at).toLocaleDateString('en-IN')}</td>
                        <td style={{ padding: '15px 10px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            background: ord.status === 'delivered' ? '#EAF8EB' : ord.status === 'cancelled' ? '#FFF5F5' : '#FAF7F5',
                            color: ord.status === 'delivered' ? '#4E8752' : ord.status === 'cancelled' ? '#C94B4B' : 'var(--color-gold)'
                          }}>
                            {ord.status}
                          </span>
                        </td>
                        <td style={{ padding: '15px 10px', fontWeight: 600 }}>₹{ord.total}</td>
                        <td style={{ padding: '15px 10px', textAlign: 'right' }}>
                          <button onClick={() => fetchOrderItems(ord)} className="btn btn-outline" style={{ height: '30px', padding: '0 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center' }}>
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 2: ORDER DETAILS VIEW */}
          {activeTab === 'orders' && selectedOrder && (
            <div className="animate-fade-in">
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-neutral-muted)', fontSize: '0.85rem', marginBottom: '25px' }}>
                <ArrowLeft size={14} /> Back to order list
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '15px', marginBottom: '25px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', margin: '0 0 5px' }}>Order {selectedOrder.order_number}</h2>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-neutral-muted)' }}>Placed on {new Date(selectedOrder.created_at).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    background: selectedOrder.status === 'delivered' ? '#EAF8EB' : selectedOrder.status === 'cancelled' ? '#FFF5F5' : '#FAF7F5',
                    color: selectedOrder.status === 'delivered' ? '#4E8752' : selectedOrder.status === 'cancelled' ? '#C94B4B' : 'var(--color-gold)'
                  }}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                {/* Items detail list */}
                <div>
                  <h4 style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', color: 'var(--color-neutral-muted)', marginBottom: '15px' }}>Ordered Items</h4>
                  {itemsLoading ? (
                    <p style={{ color: 'var(--color-neutral-muted)' }}>Loading items...</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {selectedOrderItems.map((item) => (
                        <div key={item.id} style={{ display: 'flex', gap: '15px', borderBottom: '1px solid var(--color-border)', paddingBottom: '15px' }}>
                          <img src={item.product_image} alt={item.product_name} style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px', background: '#F8F9FA' }} />
                          <div style={{ flex: 1 }}>
                            <h5 style={{ margin: '0 0 5px', fontSize: '0.95rem', fontFamily: 'var(--font-serif)' }}>{item.product_name}</h5>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-neutral-muted)', display: 'block' }}>Size: <strong>{item.size}</strong> | Qty: {item.quantity}</span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, display: 'block', marginTop: '4px' }}>₹{item.unit_price} each</span>
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                            ₹{item.total_price}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Shipping & Payment summary */}
                <div>
                  <div style={{ background: '#FAF7F5', padding: '20px', borderRadius: '4px', border: '1px solid var(--color-border)', marginBottom: '20px' }}>
                    <h4 style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', color: 'var(--color-neutral-muted)', marginBottom: '12px' }}>Shipping Address</h4>
                    <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: '0.9rem' }}>{selectedOrder.customer_name}</p>
                    <p style={{ margin: '0 0 4px', fontSize: '0.85rem' }}>{selectedOrder.address}</p>
                    <p style={{ margin: '0 0 10px', fontSize: '0.85rem' }}>{selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-neutral-muted)' }}>WhatsApp/Phone: {selectedOrder.customer_phone}</p>
                  </div>

                  <div style={{ padding: '15px 5px' }}>
                    <h4 style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', color: 'var(--color-neutral-muted)', marginBottom: '12px' }}>Billing Summary</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                      <span>Subtotal:</span>
                      <span>₹{selectedOrder.subtotal}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                      <span>Shipping Fee:</span>
                      <span>{selectedOrder.delivery_charge === 0 ? 'FREE' : `₹${selectedOrder.delivery_charge}`}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '10px', marginTop: '10px' }}>
                      <span>Grand Total:</span>
                      <span>₹{selectedOrder.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DELIVERY ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', margin: 0 }}>Addresses</h2>
                {!showAddressForm && (
                  <button onClick={() => { setEditingAddress(null); setShowAddressForm(true); }} className="btn btn-primary" style={{ height: '36px', padding: '0 15px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={14} /> Add Address
                  </button>
                )}
              </div>

              {addressLoading && <p style={{ color: 'var(--color-neutral-muted)' }}>Updating address book...</p>}

              {/* Address Edit/Add Form */}
              {showAddressForm && (
                <form onSubmit={handleSaveAddress} style={{ background: '#FAF7F5', padding: '25px', borderRadius: '4px', border: '1px solid var(--color-border)', marginBottom: '30px', maxWidth: '600px' }}>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '20px' }}>{editingAddress ? 'Modify Address' : 'New Address Details'}</h4>
                  
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Name</label>
                    <input type="text" required value={addressForm.name} onChange={(e) => setAddressForm({...addressForm, name: e.target.value})} className="form-input" style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '4px', marginTop: '5px' }} />
                  </div>

                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</label>
                    <input type="tel" required value={addressForm.phone} onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})} className="form-input" style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '4px', marginTop: '5px' }} />
                  </div>

                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address details</label>
                    <input type="text" required value={addressForm.address_line} onChange={(e) => setAddressForm({...addressForm, address_line: e.target.value})} className="form-input" style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '4px', marginTop: '5px' }} />
                  </div>

                  <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>City</label>
                      <input type="text" required value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} className="form-input" style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '4px', marginTop: '5px' }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>State</label>
                      <input type="text" required value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} className="form-input" style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '4px', marginTop: '5px' }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pin Code</label>
                      <input type="text" required value={addressForm.pincode} onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})} className="form-input" style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: '4px', marginTop: '5px' }} />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id="is_default" checked={addressForm.is_default} onChange={(e) => setAddressForm({...addressForm, is_default: e.target.checked})} />
                    <label htmlFor="is_default" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>Mark as default delivery address</label>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary" style={{ height: '38px', padding: '0 20px', fontSize: '0.85rem' }}>Save Address</button>
                    <button type="button" onClick={() => { setShowAddressForm(false); setEditingAddress(null); }} className="btn btn-outline" style={{ height: '38px', padding: '0 20px', fontSize: '0.85rem' }}>Cancel</button>
                  </div>
                </form>
              )}

              {/* Addresses List */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {addresses.length === 0 ? (
                  <p style={{ color: 'var(--color-neutral-muted)', gridColumn: '1/-1' }}>No addresses stored yet.</p>
                ) : (
                  addresses.map((addr) => (
                    <div key={addr.id} style={{ border: addr.is_default ? '2px solid var(--color-rose)' : '1px solid var(--color-border)', borderRadius: '4px', padding: '20px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                      {addr.is_default && (
                        <span style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', background: 'var(--color-rose)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
                          Default
                        </span>
                      )}
                      <p style={{ margin: '0 0 5px', fontWeight: 'bold', fontSize: '0.95rem' }}>{addr.name}</p>
                      <p style={{ margin: '0 0 5px', fontSize: '0.85rem', color: 'var(--color-neutral-dark)', flex: 1 }}>{addr.address_line}, {addr.city}, {addr.state} - {addr.pincode}</p>
                      <p style={{ margin: '0 0 15px', fontSize: '0.85rem', color: 'var(--color-neutral-muted)' }}>Phone: {addr.phone}</p>
                      
                      <div style={{ display: 'flex', gap: '15px', borderTop: '1px solid var(--color-border)', paddingTop: '12px', fontSize: '0.8rem' }}>
                        <button onClick={() => handleEditAddressClick(addr)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-gold)', fontWeight: 600 }}>Edit</button>
                        <button onClick={() => handleDeleteAddress(addr.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#C94B4B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}><Trash2 size={12} /> Delete</button>
                        {!addr.is_default && (
                          <button onClick={() => handleSetDefaultAddress(addr.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-neutral-muted)', marginLeft: 'auto' }}>Set Default</button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: MY WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="animate-fade-in">
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '25px' }}>My Liked Outfits</h2>

              {wishlist.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-neutral-muted)' }}>
                  <Heart size={48} style={{ color: 'var(--color-border)', marginBottom: '15px' }} />
                  <p>You have not liked any outfits yet.</p>
                  <Link to="/shop" className="btn btn-outline" style={{ marginTop: '15px' }}>Explore Catalog</Link>
                </div>
              ) : (
                <div className="products-grid grid-3">
                  {wishlist.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
