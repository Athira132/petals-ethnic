import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AdminNavbar from '../../components/AdminNavbar';
import { Search, UserCheck, Shield, Users } from 'lucide-react';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      console.error('Error fetching customer profiles:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      await fetchCustomers();
    } catch (err) {
      alert(err.message || 'Failed to update user role.');
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q))
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA' }}>
      <AdminNavbar />

      <div style={{ marginLeft: '260px', padding: '40px', flex: 1, textAlign: 'left' }}>
        
        {/* Header Title */}
        <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-neutral-dark)', margin: 0 }}>Customer Directory</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-neutral-muted)' }}>Registered accounts and administrator permissions logs</span>
          </div>
          <div style={{ background: 'var(--color-primary-light)', padding: '8px 15px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600 }}>
            <Users size={16} /> Total Registered: {customers.length}
          </div>
        </div>

        {/* Search Toolbar */}
        <div style={{ position: 'relative', width: '320px', marginBottom: '30px' }}>
          <input 
            type="text" 
            placeholder="Search by name, email or phone" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input" 
            style={{ width: '100%', height: '38px', padding: '0 12px 0 35px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.85rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--color-neutral-muted)' }} />
        </div>

        {/* Customer list */}
        {loading ? (
          <p style={{ color: 'var(--color-neutral-muted)' }}>Retrieving user profiles...</p>
        ) : filteredCustomers.length === 0 ? (
          <p style={{ color: 'var(--color-neutral-muted)' }}>No matching profiles registered.</p>
        ) : (
          <div style={{ background: 'white', borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-neutral-muted)', textAlign: 'left', background: '#FAF7F5' }}>
                  <th style={{ padding: '15px' }}>Name</th>
                  <th style={{ padding: '15px' }}>Email Address</th>
                  <th style={{ padding: '15px' }}>Phone Number</th>
                  <th style={{ padding: '15px' }}>Registered Date</th>
                  <th style={{ padding: '15px' }}>Permissions Role</th>
                  <th style={{ padding: '15px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} style={{ borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
                    <td style={{ padding: '15px', fontWeight: 600 }}>{cust.name}</td>
                    <td style={{ padding: '15px' }}>{cust.email}</td>
                    <td style={{ padding: '15px', color: 'var(--color-neutral-muted)' }}>{cust.phone || '-'}</td>
                    <td style={{ padding: '15px' }}>{new Date(cust.created_at).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        background: cust.role === 'admin' ? '#E3F2FD' : '#F8F9FA',
                        color: cust.role === 'admin' ? '#1E88E5' : 'var(--color-neutral-dark)'
                      }}>
                        {cust.role}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleMakeAdmin(cust.id, cust.role)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          padding: 0,
                          color: cust.role === 'admin' ? '#C94B4B' : '#1E88E5',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {cust.role === 'admin' ? (
                          <>
                            <UserCheck size={12} /> Revoke Admin
                          </>
                        ) : (
                          <>
                            <Shield size={12} /> Make Admin
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
