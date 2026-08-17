import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { updatePassword } = useAuth();
  const navigate = useNavigate();

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
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to update user password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container container" style={{ padding: '80px 20px', maxWidth: '480px' }}>
      <div className="auth-card animate-slide-up" style={{ padding: '40px', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-white)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-neutral-dark)', marginBottom: '8px' }}>Reset Password</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-neutral-muted)' }}>Configure your new account password</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#FFF5F5', color: '#C94B4B', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid #FFD8D8' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '15px', background: '#EAF8EB', color: '#4E8752', borderRadius: '4px', fontSize: '0.9rem', border: '1px solid #C1EFC4' }}>
            <CheckCircle size={18} />
            <span>Password updated successfully! Redirecting to login portal...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', height: '44px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '15px' }}
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
