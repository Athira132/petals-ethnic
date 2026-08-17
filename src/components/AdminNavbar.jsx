import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingBag, FolderHeart, FileText, Users, LogOut, QrCode, CreditCard } from 'lucide-react';

export default function AdminNavbar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err.message);
    }
  };

  const navItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 20px',
    fontSize: '0.85rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'var(--color-neutral-dark)',
    borderRadius: '4px',
    transition: 'all var(--transition-fast)'
  };

  const activeClassName = "active-admin-link";

  return (
    <nav className="admin-sidebar" style={{ width: '260px', height: '100vh', position: 'fixed', left: 0, top: 0, background: 'var(--color-white)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', padding: '30px 20px', zIndex: 100 }}>
      {/* Brand logo area */}
      <div style={{ marginBottom: '40px', paddingLeft: '15px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="https://i.ibb.co/PvyVCLFF" 
            alt="Petals Ethnic Logo" 
            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'contain', border: '1px solid var(--color-rose)' }} 
          />
          <div>
            <h1 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-neutral-dark)', margin: 0 }}>Petals</h1>
            <span style={{ fontSize: '0.6rem', letterSpacing: '2px', color: 'var(--color-gold)', textTransform: 'uppercase', display: 'block' }}>Admin Console</span>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
        <NavLink 
          to="/admin/dashboard" 
          style={({ isActive }) => ({
            ...navItemStyle,
            color: isActive ? 'white' : 'var(--color-neutral-dark)',
            background: isActive ? 'var(--color-rose)' : 'transparent'
          })}
        >
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/admin/products" 
          style={({ isActive }) => ({
            ...navItemStyle,
            color: isActive ? 'white' : 'var(--color-neutral-dark)',
            background: isActive ? 'var(--color-rose)' : 'transparent'
          })}
        >
          <ShoppingBag size={16} />
          <span>Products</span>
        </NavLink>

        <NavLink 
          to="/admin/categories" 
          style={({ isActive }) => ({
            ...navItemStyle,
            color: isActive ? 'white' : 'var(--color-neutral-dark)',
            background: isActive ? 'var(--color-rose)' : 'transparent'
          })}
        >
          <FolderHeart size={16} />
          <span>Categories</span>
        </NavLink>

        <NavLink 
          to="/admin/orders" 
          style={({ isActive }) => ({
            ...navItemStyle,
            color: isActive ? 'white' : 'var(--color-neutral-dark)',
            background: isActive ? 'var(--color-rose)' : 'transparent'
          })}
        >
          <FileText size={16} />
          <span>Orders</span>
        </NavLink>

        <NavLink 
          to="/admin/customers" 
          style={({ isActive }) => ({
            ...navItemStyle,
            color: isActive ? 'white' : 'var(--color-neutral-dark)',
            background: isActive ? 'var(--color-rose)' : 'transparent'
          })}
        >
          <Users size={16} />
          <span>Customers</span>
        </NavLink>

        <NavLink 
          to="/admin/upi-settings" 
          style={({ isActive }) => ({
            ...navItemStyle,
            color: isActive ? 'white' : 'var(--color-neutral-dark)',
            background: isActive ? 'var(--color-rose)' : 'transparent'
          })}
        >
          <QrCode size={16} />
          <span>UPI Settings</span>
        </NavLink>

        <NavLink 
          to="/admin/razorpay-settings" 
          style={({ isActive }) => ({
            ...navItemStyle,
            color: isActive ? 'white' : 'var(--color-neutral-dark)',
            background: isActive ? 'var(--color-rose)' : 'transparent'
          })}
        >
          <CreditCard size={16} />
          <span>Razorpay</span>
        </NavLink>
      </div>

      {/* Footer / Logout */}
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
        <button 
          onClick={handleLogout} 
          style={{
            ...navItemStyle,
            width: '100%',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <LogOut size={16} style={{ color: '#C94B4B' }} />
          <span style={{ color: '#C94B4B' }}>Logout</span>
        </button>
      </div>
    </nav>
  );
}
