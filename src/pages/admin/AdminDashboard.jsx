import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AdminNavbar from '../../components/AdminNavbar';
import { IndianRupee, FileText, ShoppingBag, AlertTriangle, Users, ChevronRight, Package, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    todayRevenue: 0,
    ordersCount: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    customersCount: 0,
    productsCount: 0,
    lowStockCount: 0,
    soldOutCount: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockSizes, setLowStockSizes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // 1. Fetch Orders metrics
      const { data: orders, error: ordersErr } = await supabase
        .from('orders')
        .select('*');
      
      if (ordersErr) throw ordersErr;

      const totalOrders = orders || [];
      const revenue = totalOrders
        .filter(o => o.payment_status === 'paid' || o.payment_status === 'awaiting_verification')
        .reduce((sum, o) => sum + Number(o.total), 0);

      // Calculate Today's Sales
      const todayStr = new Date().toDateString();
      const todayRevenue = totalOrders
        .filter(o => {
          const isToday = new Date(o.created_at).toDateString() === todayStr;
          const isPaid = o.payment_status === 'paid' || o.payment_status === 'awaiting_verification';
          return isToday && isPaid;
        })
        .reduce((sum, o) => sum + Number(o.total), 0);

      const pendingOrders = totalOrders.filter(o => o.order_status === 'pending').length;
      const confirmedOrders = totalOrders.filter(o => o.order_status === 'confirmed').length;
      const deliveredOrders = totalOrders.filter(o => o.order_status === 'delivered').length;
      const cancelledOrders = totalOrders.filter(o => o.order_status === 'cancelled').length;

      // 2. Fetch Customer Count
      const { count: custCount, error: custErr } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

      if (custErr) throw custErr;

      // 3. Fetch Products Count & Stock states
      const { data: products, error: prodErr } = await supabase
        .from('products')
        .select('id, stock, low_stock_threshold, availability');

      if (prodErr) throw prodErr;

      const totalProds = products || [];
      const lowStockCount = totalProds.filter(p => p.stock > 0 && p.stock <= p.low_stock_threshold).length;
      const soldOutCount = totalProds.filter(p => p.stock === 0).length;

      // 4. Fetch Low Stock sizes Watch List
      const { data: sizes, error: sizesErr } = await supabase
        .from('product_sizes')
        .select('*, products(name)')
        .or('stock.lte.5,status.eq.few_left,status.eq.sold_out');

      if (sizesErr) throw sizesErr;
      setLowStockSizes(sizes || []);

      setStats({
        revenue: revenue.toFixed(2),
        todayRevenue: todayRevenue.toFixed(2),
        ordersCount: totalOrders.length,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        cancelledOrders,
        customersCount: custCount || 0,
        productsCount: totalProds.length,
        lowStockCount,
        soldOutCount
      });

      // 5. Fetch LATEST 10 Orders
      const { data: latest, error: latestErr } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (latestErr) throw latestErr;
      setRecentOrders(latest || []);

    } catch (err) {
      console.error('Error loading dashboard analytics:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA' }}>
        <AdminNavbar />
        <div style={{ marginLeft: '260px', padding: '40px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <div className="loading-spinner" style={{ border: '3px solid var(--color-primary-light)', borderTop: '3px solid var(--color-gold)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
            <p style={{ color: 'var(--color-neutral-muted)', fontSize: '0.9rem' }}>Loading executive dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA' }}>
      <AdminNavbar />

      <div style={{ marginLeft: '260px', padding: '40px', flex: 1, textAlign: 'left' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-neutral-dark)', margin: 0 }}>Executive Dashboard</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-neutral-muted)' }}>WooCommerce-style boutique management console</span>
          </div>
          <button onClick={fetchDashboardStats} className="btn btn-outline" style={{ height: '36px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} /> Refresh metrics
          </button>
        </div>

        {/* Sales & Orders overview grids */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#EAF8EB', color: '#4E8752', padding: '10px', borderRadius: '8px' }}><IndianRupee size={22} /></div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Revenue</span>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.2rem', fontWeight: 700 }}>₹{stats.revenue}</h3>
            </div>
          </div>

          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#FFFDF9', color: 'var(--color-gold)', padding: '10px', borderRadius: '8px' }}><IndianRupee size={22} /></div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Today's Revenue</span>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.2rem', fontWeight: 700 }}>₹{stats.todayRevenue}</h3>
            </div>
          </div>

          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#F0F7FF', color: '#1E88E5', padding: '10px', borderRadius: '8px' }}><FileText size={22} /></div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Orders</span>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.2rem', fontWeight: 700 }}>{stats.ordersCount}</h3>
            </div>
          </div>

          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#F8F9FA', color: 'var(--color-neutral-dark)', padding: '10px', borderRadius: '8px' }}><Users size={22} /></div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Active Customers</span>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.2rem', fontWeight: 700 }}>{stats.customersCount}</h3>
            </div>
          </div>
        </div>

        {/* Detailed Volumes Block */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '40px' }}>
          <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-muted)' }}>Pending Orders</span>
            <h4 style={{ margin: '5px 0 0', color: 'var(--color-gold)' }}>{stats.pendingOrders}</h4>
          </div>
          <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-muted)' }}>Confirmed Orders</span>
            <h4 style={{ margin: '5px 0 0', color: '#1E88E5' }}>{stats.confirmedOrders}</h4>
          </div>
          <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-muted)' }}>Delivered Orders</span>
            <h4 style={{ margin: '5px 0 0', color: '#4E8752' }}>{stats.deliveredOrders}</h4>
          </div>
          <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-muted)' }}>Low Stock Outfits</span>
            <h4 style={{ margin: '5px 0 0', color: stats.lowStockCount > 0 ? '#C94B4B' : 'inherit' }}>{stats.lowStockCount}</h4>
          </div>
          <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-muted)' }}>Sold Out Outfits</span>
            <h4 style={{ margin: '5px 0 0', color: stats.soldOutCount > 0 ? '#C94B4B' : 'inherit' }}>{stats.soldOutCount}</h4>
          </div>
        </div>

        {/* LATEST ORDERS TABLE */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '30px' }}>
          
          <div style={{ background: 'white', borderRadius: '8px', border: '1px solid var(--color-border)', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>LATEST ORDERS</h4>
              <Link to="/admin/orders" className="btn btn-outline" style={{ height: '30px', padding: '0 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}>
                View All Orders
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p style={{ color: 'var(--color-neutral-muted)' }}>No orders registered in the system.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-neutral-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 5px' }}>Order</th>
                    <th style={{ padding: '10px 5px' }}>Customer</th>
                    <th style={{ padding: '10px 5px' }}>Date</th>
                    <th style={{ padding: '10px 5px' }}>Payment</th>
                    <th style={{ padding: '10px 5px' }}>Status</th>
                    <th style={{ padding: '10px 5px', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
                      <td style={{ padding: '12px 5px', fontWeight: 'bold' }}>
                        <Link to={`/admin/orders?orderId=${o.id}`} style={{ color: 'var(--color-rose)', textDecoration: 'underline' }}>
                          {o.order_number}
                        </Link>
                      </td>
                      <td style={{ padding: '12px 5px' }}>{o.customer_name}</td>
                      <td style={{ padding: '12px 5px' }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                      <td style={{ padding: '12px 5px' }}>
                        <span style={{ fontSize: '0.75rem', color: o.payment_status === 'paid' ? '#4E8752' : 'var(--color-gold)', fontWeight: 600 }}>
                          {o.payment_status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px 5px' }}>
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
                      <td style={{ padding: '12px 5px', textAlign: 'right', fontWeight: 600 }}>₹{o.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Stock Watch list */}
          <div style={{ background: 'white', borderRadius: '8px', border: '1px solid var(--color-border)', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>Stock Watch Alert</h4>
              <Link to="/admin/products" style={{ fontSize: '0.85rem', color: 'var(--color-rose)', fontWeight: 600 }}>Manage Stock</Link>
            </div>

            {lowStockSizes.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-neutral-muted)' }}>
                <Package size={36} style={{ color: '#EAF8EB', marginBottom: '10px' }} />
                <p style={{ margin: 0, fontSize: '0.9rem' }}>All stock levels are healthy.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
                {lowStockSizes.slice(0, 10).map((sz) => (
                  <div key={sz.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: sz.stock === 0 ? '#FFF5F5' : '#FAF7F5' }}>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ margin: '0 0 2px', fontSize: '0.85rem', fontWeight: 600 }}>{sz.products?.name}</p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-muted)' }}>Size Option: <strong>{sz.size}</strong></span>
                    </div>
                    <div>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: sz.stock === 0 ? '#C94B4B' : 'var(--color-gold)',
                        background: sz.stock === 0 ? '#FFD8D8' : '#FEEFDD'
                      }}>
                        {sz.stock === 0 ? 'SOLD OUT' : `${sz.stock} Left`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
