import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/account';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, name, phone);
      setSuccess(true);
      // Wait briefly before redirecting
      setTimeout(() => {
        navigate(redirectPath);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to register account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container container" style={{ padding: '80px 20px', maxWidth: '480px' }}>
      <div className="auth-card animate-slide-up" style={{ padding: '40px', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-white)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-neutral-dark)', marginBottom: '8px' }}>Create Account</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-neutral-muted)' }}>Register to track orders and save your delivery details</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#FFF5F5', color: '#C94B4B', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid #FFD8D8' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#EAF8EB', color: '#4E8752', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid #C1EFC4' }}>
            <CheckCircle size={16} />
            <span>Registration successful! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-neutral-dark)' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                style={{ width: '100%', height: '42px', padding: '0 12px 0 35px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.9rem' }}
              />
              <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--color-rose)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-neutral-dark)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: '100%', height: '42px', padding: '0 12px 0 35px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.9rem' }}
              />
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--color-rose)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-neutral-dark)' }}>Phone Number (Optional)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 9876543210"
                style={{ width: '100%', height: '42px', padding: '0 12px 0 35px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.9rem' }}
              />
              <Phone size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--color-rose)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-neutral-dark)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                style={{ width: '100%', height: '42px', padding: '0 12px 0 35px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.9rem' }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--color-rose)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-neutral-dark)' }}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                style={{ width: '100%', height: '42px', padding: '0 12px 0 35px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.9rem' }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--color-rose)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="btn btn-primary"
            style={{ width: '100%', height: '44px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '15px' }}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-neutral-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
          Already have an account?{' '}
          <Link to={`/login?redirect=${encodeURIComponent(redirectPath)}`} style={{ color: 'var(--color-rose)', fontWeight: 600, textDecoration: 'underline' }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
