import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      console.log('[DEBUG] current window.location.origin:', window.location.origin);
      console.log('[DEBUG] reset redirect URL:', redirectUrl);

      const res = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl
      });

      console.log('[DEBUG] Supabase resetPasswordForEmail result:', res);

      if (res.error) {
        console.error('[DEBUG] error.message:', res.error.message);
        console.error('[DEBUG] error.code:', res.error.code);
        console.error('[DEBUG] error.status:', res.error.status);
        throw res.error;
      }

      setSuccess(true);
    } catch (err) {
      console.error('[DEBUG] Password recovery catch block:', err);
      setError(err.message || 'Failed to dispatch password recovery email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container container" style={{ padding: '80px 20px', maxWidth: '480px' }}>
      <div className="auth-card animate-slide-up" style={{ padding: '40px', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-white)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-neutral-dark)', marginBottom: '8px' }}>Recover Password</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-neutral-muted)' }}>Enter your account email to receive a password reset link</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#FFF5F5', color: '#C94B4B', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid #FFD8D8' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '15px', background: '#EAF8EB', color: '#4E8752', borderRadius: '4px', fontSize: '0.9rem', marginBottom: '20px', border: '1px solid #C1EFC4' }}>
              <CheckCircle size={18} style={{ flexShrink: 0 }} />
              <span>Password recovery instructions sent to <strong>{email}</strong>. Check your inbox and click the link to reset your password.</span>
            </div>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', height: '44px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '10px' }}
            >
              {loading ? 'Sending Link...' : 'Send Recovery Link'}
            </button>

            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--color-neutral-muted)', fontSize: '0.85rem', fontWeight: 600, marginTop: '10px' }}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
