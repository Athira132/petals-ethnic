import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, AlertCircle, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // 1. Check existing session on mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Check hash parameters for recovery token if session is not yet loaded
        const hash = window.location.hash || '';
        const search = window.location.search || '';
        const isRecoveryUrl = hash.includes('type=recovery') || hash.includes('access_token') || search.includes('code=');

        if (session || isRecoveryUrl) {
          if (mounted) setHasRecoverySession(true);
        } else {
          if (mounted) setHasRecoverySession(false);
        }
      } catch (err) {
        console.warn('Error checking recovery session:', err.message);
        if (mounted) setHasRecoverySession(false);
      } finally {
        if (mounted) setSessionChecking(false);
      }
    };

    checkSession();

    // 2. Listen to PASSWORD_RECOVERY auth state event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) {
        if (mounted) {
          setHasRecoverySession(true);
          setSessionChecking(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

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
      // Execute standard Supabase Auth password update
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      // Sign out to ensure user logs in with their new credentials
      await supabase.auth.signOut();
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to update user password. Your recovery session may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (sessionChecking) {
    return (
      <div className="auth-page-container container" style={{ padding: '80px 20px', maxWidth: '480px' }}>
        <div className="auth-card" style={{ padding: '40px', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-white)', textAlign: 'center' }}>
          <div className="loading-spinner" style={{ border: '3px solid var(--color-primary-light)', borderTop: '3px solid var(--color-rose)', borderRadius: '50%', width: '36px', height: '36px', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }}></div>
          <p style={{ color: 'var(--color-neutral-muted)', fontSize: '0.85rem' }}>Verifying password recovery session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-container container" style={{ padding: '80px 20px', maxWidth: '480px' }}>
      <div className="auth-card animate-slide-up" style={{ padding: '40px', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-white)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-neutral-dark)', marginBottom: '8px' }}>Set New Password</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-neutral-muted)' }}>Enter your new password below</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#FFF5F5', color: '#C94B4B', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid #FFD8D8' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '15px', background: '#EAF8EB', color: '#4E8752', borderRadius: '4px', fontSize: '0.9rem', marginBottom: '20px', border: '1px solid #C1EFC4', textAlign: 'left' }}>
              <CheckCircle size={18} style={{ flexShrink: 0 }} />
              <span>Your password has been updated successfully! You can now log in with your new password.</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary"
              style={{ width: '100%', height: '44px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}
            >
              Return to Login
            </button>
          </div>
        ) : !hasRecoverySession ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '15px', background: '#FFF5F5', color: '#C94B4B', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid #FFD8D8', textAlign: 'left' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>Invalid or expired password reset link. Please request a new recovery link.</span>
            </div>
            <Link to="/forgot-password" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', height: '44px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
              <RefreshCw size={14} /> Request New Reset Link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-neutral-dark)' }}>New Password</label>
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
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-neutral-dark)' }}>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  style={{ width: '100%', height: '42px', padding: '0 12px 0 35px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.9rem' }}
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--color-rose)' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', height: '44px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '10px' }}
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>

            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--color-neutral-muted)', fontSize: '0.85rem', fontWeight: 600, marginTop: '10px' }}>
              <ArrowLeft size={14} /> Cancel & Return to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
