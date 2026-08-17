import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AdminNavbar from '../../components/AdminNavbar';
import { Save, QrCode, Upload, Check, AlertCircle } from 'lucide-react';

export default function AdminUpiSettings() {
  const [settings, setSettings] = useState({
    upi_id: '',
    upi_phone: '',
    upi_name: '',
    upi_qr_url: '',
    upi_enabled: true,
    delivery_charge: 99,
    free_delivery_threshold: 1499
  });

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
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
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Upload QR code to ImgBB securely via serverless function
  const handleQrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadLoading(true);
    setErrorMsg('');
    setMessage('');

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Content = reader.result.split(',')[1];
        
        try {
          const res = await fetch('/api/imgbb-upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: base64Content })
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to upload QR.');

          setSettings(prev => ({ ...prev, upi_qr_url: data.url }));
          setMessage('QR Code uploaded to ImgBB successfully!');
        } catch (err) {
          setErrorMsg(err.message || 'QR upload failed.');
        } finally {
          setUploadLoading(false);
        }
      };
      
      reader.onerror = () => {
        setErrorMsg('Failed to read QR file.');
        setUploadLoading(false);
      };

    } catch (err) {
      setErrorMsg(err.message);
      setUploadLoading(false);
    }
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
          upi_id: settings.upi_id,
          upi_phone: settings.upi_phone,
          upi_name: settings.upi_name,
          upi_qr_url: settings.upi_qr_url,
          upi_enabled: settings.upi_enabled,
          delivery_charge: Number(settings.delivery_charge),
          free_delivery_threshold: Number(settings.free_delivery_threshold),
          updated_at: new Date()
        })
        .eq('id', settings.id);

      if (error) throw error;
      setMessage('Store UPI and shipping settings saved successfully!');
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
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-neutral-dark)', margin: 0 }}>UPI & Delivery Settings</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-neutral-muted)' }}>Configure manual UPI receipt routing coordinates and shipping fee brackets</span>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
            
            {/* Left Column: UPI Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
                <input type="checkbox" id="upi_enabled" name="upi_enabled" checked={settings.upi_enabled} onChange={handleInputChange} style={{ width: '16px', height: '16px' }} />
                <label htmlFor="upi_enabled" style={{ fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}>Enable UPI Manual Checkout</label>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Boutique UPI ID</label>
                <input type="text" name="upi_id" required={settings.upi_enabled} value={settings.upi_id || ''} onChange={handleInputChange} className="form-input" style={{ height: '38px', padding: '0 10px', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Registered Merchant / Business Name</label>
                <input type="text" name="upi_name" required={settings.upi_enabled} value={settings.upi_name || ''} onChange={handleInputChange} className="form-input" style={{ height: '38px', padding: '0 10px', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Merchant Phone (Optional)</label>
                <input type="text" name="upi_phone" value={settings.upi_phone || ''} onChange={handleInputChange} className="form-input" style={{ height: '38px', padding: '0 10px', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px', borderTop: '1px solid var(--color-border)', paddingTop: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Shipping Fee (₹)</label>
                  <input type="number" name="delivery_charge" required value={settings.delivery_charge} onChange={handleInputChange} className="form-input" style={{ height: '38px', padding: '0 10px', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Free Shipping Over (₹)</label>
                  <input type="number" name="free_delivery_threshold" required value={settings.free_delivery_threshold} onChange={handleInputChange} className="form-input" style={{ height: '38px', padding: '0 10px', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
                </div>
              </div>
            </div>

            {/* Right Column: QR Image */}
            <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '40px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
              <h5 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}><QrCode size={16} /> UPI QR Code</h5>
              
              <div style={{ width: '180px', height: '180px', border: '1px solid var(--color-border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA', overflow: 'hidden' }}>
                {settings.upi_qr_url ? (
                  <img src={settings.upi_qr_url} alt="Merchant QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <QrCode size={48} style={{ color: 'var(--color-neutral-muted)' }} />
                )}
              </div>

              <label style={{ height: '36px', width: '100%', border: '1px dashed var(--color-gold)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', background: '#FAF7F5', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-gold)' }}>
                <Upload size={14} /> {uploadLoading ? 'Uploading...' : 'Upload QR Image'}
                <input type="file" accept="image/*" onChange={handleQrUpload} style={{ display: 'none' }} disabled={uploadLoading} />
              </label>
              
              {settings.upi_qr_url && (
                <button type="button" onClick={() => setSettings(prev => ({ ...prev, upi_qr_url: '' }))} style={{ color: '#C94B4B', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Remove Image</button>
              )}
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
