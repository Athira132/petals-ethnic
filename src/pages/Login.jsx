import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('dhanyaadwork@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authSuccessData, setAuthSuccessData] = useState(null);
  const [connResult, setConnResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [connLoading, setConnLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAuthSuccessData(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        setError(error.message);
      } else if (data?.user) {
        setAuthSuccessData({
          userId: data.user.id,
          userEmail: data.user.email,
          emailConfirmedAt: data.user.email_confirmed_at || 'Not Confirmed',
          sessionExists: data.session ? 'yes' : 'no'
        });
      }
    } catch (err) {
      setError(err.message || 'Unexpected login error');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setConnLoading(true);
    setConnResult('');
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id')
        .limit(1);

      if (error) {
        setConnResult(`CONNECTION ERROR: ${error.message}`);
      } else {
        setConnResult(`CONNECTION SUCCESSFUL! Categories read: ${JSON.stringify(data)}`);
      }
    } finally {
      setConnLoading(false);
    }
  };

  return (
    <div className="auth-page-container container" style={{ padding: '80px 20px', maxWidth: '480px' }}>
      <div className="auth-card animate-slide-up" style={{ padding: '40px', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-white)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-neutral-dark)', marginBottom: '8px' }}>Welcome Back</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-neutral-muted)' }}>Login to view order updates and delivery details</p>
        </div>

        {/* Temporary connection test button */}
        <div style={{ marginBottom: '25px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={connLoading}
            className="btn btn-outline"
            style={{ width: '100%', height: '38px', fontSize: '0.8rem', fontWeight: 600 }}
          >
            {connLoading ? 'Testing...' : 'TEST SUPABASE CONNECTION'}
          </button>

          {connResult && (
            <div style={{ marginTop: '10px', padding: '10px', background: '#F8F9FA', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace', textAlign: 'left', wordBreak: 'break-all', border: '1px solid var(--color-border)' }}>
              {connResult}
            </div>
          )}
        </div>

        {error && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '12px', background: '#FFF5F5', color: '#C94B4B', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid #FFD8D8' }}>
            <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {authSuccessData && (
          <div className="alert alert-success" style={{ padding: '15px', background: '#EAF8EB', color: '#4E8752', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid #C1EFC4', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', marginBottom: '10px' }}>
              <CheckCircle size={18} />
              <span>AUTHENTICATION SUCCESSFUL</span>
            </div>
            <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'monospace' }}>
              <div><strong>user.id:</strong> {authSuccessData.userId}</div>
              <div><strong>user.email:</strong> {authSuccessData.userEmail}</div>
              <div><strong>email_confirmed_at:</strong> {authSuccessData.emailConfirmedAt}</div>
              <div><strong>session exists:</strong> {authSuccessData.sessionExists}</div>
            </div>
          </div>
        )}

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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-neutral-dark)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
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
            {loading ? 'Testing Sign In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
