import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AdminNavbar from '../../components/AdminNavbar';
import { Save, Check, AlertCircle, ShieldAlert } from 'lucide-react';

export default function AdminRazorpaySettings() {
  const [settings, setSettings] = useState({
    id: '',
    razorpay_enabled: true
  });

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .single();
      if (error) throw error;
      if (data) setSettings(data);
    } catch (err) {
      setErrorMsg('Failed to load store configurations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setMessage('');
    setErrorMsg('');

    try {
      const { error } = await supabase
        .from('store_settings')
        .update({
          razorpay_enabled: settings.razorpay_enabled,
          updated_at: new Date()
        })
        .eq('id', settings.id);

      if (error) throw error;
      setMessage('Razorpay status configuration saved successfully!');
    } catch (err) {
      setErrorMsg('Failed to update configurations: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA' }}>
        <AdminNavbar />
        <div style={{ marginLeft: '260px', padding: '40px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Loading store configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA' }}>
      <AdminNavbar />

      <div style={{ marginLeft: '260px', padding: '40px', flex: 1, textAlign: 'left', maxWidth: '800px' }}>
        <div style={{ marginBottom: '35px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-neutral-dark)', margin: 0 }}>Razorpay Settings</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-neutral-muted)' }}>Configure online payment gateways status</span>
        </div>

        {message && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#EAF8EB', color: '#4E8752', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid #C1EFC4' }}>
            <Check size={16} />
            <span>{message}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#FFF5F5', color: '#C94B4B', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid #FFD8D8' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '15px', borderBottom: '1px solid var(--color-border)' }}>
              <input type="checkbox" id="razorpay_enabled" name="razorpay_enabled" checked={settings.razorpay_enabled} onChange={handleInputChange} style={{ width: '16px', height: '16px' }} />
              <label htmlFor="razorpay_enabled" style={{ fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}>Enable Razorpay Gateway (Cards, Netbanking, Auto-UPI)</label>
            </div>

            {/* Vercel Security guidelines notice */}
            <div style={{ background: '#FAF7F5', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '20px' }}>
              <h5 style={{ margin: '0 0 10px', fontFamily: 'var(--font-serif)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-rose)' }}>
                <ShieldAlert size={18} /> Credentials Security Protocol
              </h5>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-neutral-muted)', lineHeight: '1.6', margin: '0 0 15px' }}>
                To comply with PCI-DSS requirements, private Razorpay Secret Tokens must never be loaded into the client bundle or saved in DB tables. Instead, configure them as environment variables directly in your **Vercel Project Dashboard** (Settings → Environment Variables):
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', background: 'white', padding: '15px', borderRadius: '4px', border: '1px solid var(--color-border)', fontFamily: 'monospace' }}>
                <div>
                  <strong style={{ color: 'var(--color-neutral-dark)' }}>RAZORPAY_KEY_ID</strong> = <span style={{ color: 'var(--color-neutral-muted)' }}>[Your Razorpay Merchant Key ID]</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--color-neutral-dark)' }}>RAZORPAY_KEY_SECRET</strong> = <span style={{ color: 'var(--color-neutral-muted)' }}>[Your Razorpay Merchant Private Secret]</span>
                </div>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-muted)', marginTop: '15px', fontStyle: 'italic' }}>
                * When Razorpay checkout is active, the app secures connection endpoints serverless using these variables.
              </p>
            </div>

          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '30px', paddingTop: '20px', textAlign: 'right' }}>
            <button type="submit" disabled={saveLoading} className="btn btn-primary" style={{ height: '40px', padding: '0 25px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginLeft: 'auto' }}>
              <Save size={16} /> {saveLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
