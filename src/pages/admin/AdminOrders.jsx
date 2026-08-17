import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AdminNavbar from '../../components/AdminNavbar';
import { Search, Eye, ArrowLeft, RefreshCw, Printer, AlertCircle, Check } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [searchParams, setSearchParams] = useSearchParams();
  const queryOrderId = searchParams.get('orderId');

  // Detail View states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  // Sync details if orderId is in url query params
  useEffect(() => {
    if (orders.length > 0 && queryOrderId) {
      const match = orders.find(o => o.id === queryOrderId);
      if (match) {
        fetchOrderItems(match);
      }
    }
  }, [queryOrderId, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err.message);
    } finally {
      setLoading(false);
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

  const handleUpdateOrderStatus = async (newStatus) => {
    if (!selectedOrder) return;
    setStatusUpdateLoading(true);
    setUpdateMessage('');

    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus, updated_at: new Date() })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      setSelectedOrder(prev => ({ ...prev, order_status: newStatus }));
      setUpdateMessage('Order fulfillment status updated!');
      await fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to update order status.');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async (newPaymentStatus) => {
    if (!selectedOrder) return;
    setStatusUpdateLoading(true);
    setUpdateMessage('');

    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newPaymentStatus, updated_at: new Date() })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      // If manual UPI payment is marked as PAID: execute stock decrement!
      if (newPaymentStatus === 'paid' && selectedOrder.payment_status !== 'paid') {
        const { error: rpcErr } = await supabase.rpc('deduct_order_stock', { p_order_id: selectedOrder.id });
        if (rpcErr && !rpcErr.message.includes('already processed')) {
          console.warn('Stock reserve notice (possibly already decremented):', rpcErr.message);
        }
      }

      setSelectedOrder(prev => ({ ...prev, payment_status: newPaymentStatus }));
      setUpdateMessage('Order payment status updated!');
      await fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to update payment status.');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setSearchParams({});
  };

  const filteredOrders = orders.filter((o) => {
    // Status Filter
    if (statusFilter !== 'all' && o.order_status !== statusFilter) {
      return false;
    }
    // Search Query (ID or Customer Name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA' }}>
      <AdminNavbar />

      <div style={{ marginLeft: '260px', padding: '40px', flex: 1, textAlign: 'left' }}>
        
        {!selectedOrder ? (
          /* List View */
          <div className="animate-fade-in">
            {/* Header Title */}
            <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-neutral-dark)', margin: 0 }}>Orders Manager</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-neutral-muted)' }}>Track, verify, pack, and ship client purchases</span>
              </div>
              <button onClick={fetchOrders} className="btn btn-outline" style={{ height: '36px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={14} /> Refresh Orders
              </button>
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', marginBottom: '30px' }}>
              <div style={{ position: 'relative', width: '320px' }}>
                <input 
                  type="text" 
                  placeholder="Search by Order ID or Customer Name" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input" 
                  style={{ width: '100%', height: '38px', padding: '0 12px 0 35px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.85rem' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--color-neutral-muted)' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Fulfillment Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="card-select-dropdown"
                  style={{ minWidth: '150px', height: '38px', fontSize: '0.85rem' }}
                >
                  <option value="all">All Stages</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            {loading ? (
              <p style={{ color: 'var(--color-neutral-muted)' }}>Retrieving purchase logs...</p>
            ) : filteredOrders.length === 0 ? (
              <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '60px 20px', textAlign: 'center', color: 'var(--color-neutral-muted)' }}>
                <AlertCircle size={36} style={{ color: 'var(--color-border)', marginBottom: '10px' }} />
                <p>No matching orders found.</p>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-neutral-muted)', textAlign: 'left', background: '#FAF7F5' }}>
                      <th style={{ padding: '15px' }}>Order Number</th>
                      <th style={{ padding: '15px' }}>Date</th>
                      <th style={{ padding: '15px' }}>Customer Details</th>
                      <th style={{ padding: '15px' }}>Payment Status</th>
                      <th style={{ padding: '15px' }}>Fulfillment</th>
                      <th style={{ padding: '15px' }}>Total Price</th>
                      <th style={{ padding: '15px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr key={o.id} style={{ borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
                        <td style={{ padding: '15px', fontWeight: 'bold' }}>{o.order_number}</td>
                        <td style={{ padding: '15px' }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                        <td style={{ padding: '15px' }}>
                          <p style={{ margin: '0 0 2px', fontWeight: 600 }}>{o.customer_name}</p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-muted)' }}>{o.customer_phone}</span>
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span style={{ fontSize: '0.75rem', color: o.payment_status === 'paid' ? '#4E8752' : o.payment_status === 'awaiting_verification' ? 'var(--color-gold)' : '#C94B4B', fontWeight: 700 }}>
                            {o.payment_status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            background: o.order_status === 'delivered' ? '#EAF8EB' : o.order_status === 'cancelled' ? '#FFF5F5' : '#FAF7F5',
                            color: o.order_status === 'delivered' ? '#4E8752' : o.order_status === 'cancelled' ? '#C94B4B' : 'var(--color-gold)'
                          }}>
                            {o.order_status}
                          </span>
                        </td>
                        <td style={{ padding: '15px', fontWeight: 600 }}>₹{o.total}</td>
                        <td style={{ padding: '15px', textAlign: 'right' }}>
                          <button onClick={() => fetchOrderItems(o)} className="btn btn-outline" style={{ height: '30px', padding: '0 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Eye size={12} /> View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Detail View */
          <div className="animate-fade-in" style={{ background: 'white', padding: '30px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <button onClick={handleCloseDetails} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-neutral-muted)', fontSize: '0.85rem', marginBottom: '25px', padding: 0 }}>
              <ArrowLeft size={14} /> Back to order list
            </button>

            {updateMessage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#EAF8EB', color: '#4E8752', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid #C1EFC4' }}>
                <Check size={16} />
                <span>{updateMessage}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '15px', marginBottom: '25px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', margin: '0 0 5px' }}>Order Coordinates: {selectedOrder.order_number}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-neutral-muted)' }}>Registered: {new Date(selectedOrder.created_at).toLocaleString('en-IN')}</span>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
                {/* Fulfillment Status Select */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Fulfillment:</span>
                  <select
                    disabled={statusUpdateLoading}
                    value={selectedOrder.order_status}
                    onChange={(e) => handleUpdateOrderStatus(e.target.value)}
                    className="card-select-dropdown"
                    style={{ minWidth: '130px', height: '36px', fontSize: '0.8rem' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Payment Status Select */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Payment:</span>
                  <select
                    disabled={statusUpdateLoading}
                    value={selectedOrder.payment_status}
                    onChange={(e) => handleUpdatePaymentStatus(e.target.value)}
                    className="card-select-dropdown"
                    style={{ minWidth: '130px', height: '36px', fontSize: '0.8rem' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="awaiting_verification">Awaiting Verification</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <button onClick={() => window.print()} className="btn btn-outline" style={{ height: '36px', width: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Print Invoice"><Printer size={16} /></button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '40px' }}>
              
              {/* Items detail list */}
              <div>
                <h4 style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', color: 'var(--color-neutral-muted)', marginBottom: '15px' }}>Ordered Items breakdown</h4>
                {itemsLoading ? (
                  <p style={{ color: 'var(--color-neutral-muted)' }}>Loading items...</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {selectedOrderItems.map((item) => (
                      <div key={item.id} style={{ display: 'flex', gap: '15px', borderBottom: '1px solid var(--color-border)', paddingBottom: '15px' }}>
                        <img src={item.product_image} alt={item.product_name} style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '4px', background: '#F8F9FA' }} />
                        <div style={{ flex: 1 }}>
                          <h5 style={{ margin: '0 0 5px', fontSize: '0.9rem', fontFamily: 'var(--font-serif)' }}>{item.product_name}</h5>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-muted)', display: 'block' }}>Size Option: <strong>{item.size}</strong> | Qty: {item.quantity}</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginTop: '4px' }}>₹{item.unit_price} each</span>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          ₹{item.total_price}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Audit trail / Reference info */}
                <div style={{ marginTop: '30px', padding: '20px', background: '#FAF7F5', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
                  <h4 style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', color: 'var(--color-neutral-muted)', margin: '0 0 10px' }}>Audit & Transaction Log</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                    <span>Payment Gateway: <strong>{selectedOrder.payment_method.toUpperCase()}</strong></span>
                    {selectedOrder.payment_reference && (
                      <span>Transaction Ref (UTR/Razorpay ID): <strong style={{ color: 'var(--color-rose)' }}>{selectedOrder.payment_reference}</strong></span>
                    )}
                    {selectedOrder.notes && (
                      <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--color-neutral-muted)', whiteSpace: 'pre-line' }}>
                        <strong>Merchant/Customer Notes:</strong><br />
                        {selectedOrder.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer details details card */}
              <div>
                <div style={{ background: '#FAF7F5', padding: '20px', borderRadius: '4px', border: '1px solid var(--color-border)', marginBottom: '20px' }}>
                  <h4 style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', color: 'var(--color-neutral-muted)', marginBottom: '12px' }}>Client Coordinates</h4>
                  <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: '0.9rem' }}>{selectedOrder.customer_name}</p>
                  <p style={{ margin: '0 0 4px', fontSize: '0.85rem' }}>{selectedOrder.address}</p>
                  <p style={{ margin: '0 0 10px', fontSize: '0.85rem' }}>{selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--color-border)', paddingTop: '10px', fontSize: '0.8rem', color: 'var(--color-neutral-muted)' }}>
                    <span>Phone: <strong>{selectedOrder.customer_phone}</strong></span>
                    <span>Email: <strong>{selectedOrder.customer_email}</strong></span>
                  </div>
                </div>

                <div style={{ padding: '10px 5px' }}>
                  <h4 style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', color: 'var(--color-neutral-muted)', marginBottom: '12px' }}>Billing Statement</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.subtotal}</span>
                  </div>
                  {Number(selectedOrder.discount) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', color: '#C94B4B' }}>
                      <span>Discount Coupon:</span>
                      <span>-₹{selectedOrder.discount}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span>Shipping fee:</span>
                    <span>{selectedOrder.delivery_charge === 0 ? 'FREE' : `₹${selectedOrder.delivery_charge}`}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '10px', marginTop: '10px' }}>
                    <span>Grand Total Payable:</span>
                    <span>₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
