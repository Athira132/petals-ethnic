import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AdminNavbar from '../../components/AdminNavbar';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, ArrowUp, ArrowDown } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    active: true,
    display_order: 0
  });

  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-generate slug from name if creating
    if (name === 'name' && !editingCategory) {
      setFormData(prev => ({
        ...prev,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }));
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (editingCategory) {
        // Update
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            image_url: formData.image_url,
            active: formData.active,
            display_order: Number(formData.display_order),
            updated_at: new Date()
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('categories')
          .insert(formData);

        if (error) throw error;
      }

      setShowForm(false);
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        image_url: '',
        active: true,
        display_order: categories.length + 1
      });
      await fetchCategories();
    } catch (err) {
      setFormError(err.message || 'Error occurred while saving category details.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image_url: cat.image_url || '',
      active: cat.active,
      display_order: cat.display_order
    });
    setShowForm(true);
  };

  const handleDeleteCategory = async (catId) => {
    if (!confirm('Are you sure you want to delete this category? All products under this category will have their category link set to NULL.')) return;
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', catId);
      
      if (error) throw error;
      await fetchCategories();
    } catch (err) {
      alert(err.message || 'Failed to delete category.');
    }
  };

  const toggleCategoryActive = async (cat) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ active: !cat.active })
        .eq('id', cat.id);
      
      if (error) throw error;
      await fetchCategories();
    } catch (err) {
      alert(err.message || 'Failed to update category status.');
    }
  };

  const moveOrder = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const cat1 = categories[index];
    const cat2 = categories[swapIndex];

    try {
      await supabase.from('categories').update({ display_order: cat2.display_order }).eq('id', cat1.id);
      await supabase.from('categories').update({ display_order: cat1.display_order }).eq('id', cat2.id);
      await fetchCategories();
    } catch (err) {
      console.error('Swap display order error:', err.message);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA' }}>
      <AdminNavbar />

      <div style={{ marginLeft: '260px', padding: '40px', flex: 1, textAlign: 'left' }}>
        
        {/* Header Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-neutral-dark)', margin: 0 }}>Categories Editor</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-neutral-muted)' }}>Configure collections and storefront listing partitions</span>
          </div>
          {!showForm && (
            <button 
              onClick={() => { setEditingCategory(null); setFormData({ name: '', slug: '', description: '', image_url: '', active: true, display_order: categories.length + 1 }); setShowForm(true); }}
              className="btn btn-primary" 
              style={{ height: '38px', padding: '0 15px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} /> Add Category
            </button>
          )}
        </div>

        {/* Create/Edit Form Container */}
        {showForm && (
          <form onSubmit={handleSaveCategory} style={{ background: 'white', padding: '30px', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '35px', maxWidth: '680px' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{editingCategory ? 'Edit Category' : 'Create Category'}</span>
              <button type="button" onClick={() => { setShowForm(false); setEditingCategory(null); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </h4>

            {formError && (
              <div style={{ padding: '12px', background: '#FFF5F5', color: '#C94B4B', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid #FFD8D8' }}>
                {formError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Category Name</label>
                <input type="text" required name="name" value={formData.name} onChange={handleInputChange} className="form-input" style={{ width: '100%', height: '38px', padding: '0 10px', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Slug (URL path)</label>
                <input type="text" required name="slug" value={formData.slug} onChange={handleInputChange} className="form-input" style={{ width: '100%', height: '38px', padding: '0 10px', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
              </div>
            </div>

            {/* File Upload Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-muted)' }}>Secure Category Photo Upload (ImgBB)</span>
              <label style={{ height: '38px', border: '1px dashed var(--color-gold)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', background: '#FAF7F5', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-gold)' }}>
                <Plus size={14} /> {uploadLoading ? 'Uploading category image...' : 'Choose File to Upload'}
                <input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setUploadLoading(true);
                  setFormError('');
                  try {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = async () => {
                      const base64Content = reader.result.split(',')[1];
                      try {
                        const res = await fetch('/api/imgbb-upload', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ image: base64Content })
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || 'Upload failed.');
                        setFormData(prev => ({ ...prev, image_url: data.url }));
                      } catch (err) {
                        setFormError(err.message || 'ImgBB upload failed.');
                      } finally {
                        setUploadLoading(false);
                      }
                    };
                  } catch (err) {
                    setFormError(err.message);
                    setUploadLoading(false);
                  }
                }} style={{ display: 'none' }} disabled={uploadLoading} />
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Or Manual Cover Image Link</label>
              <input type="text" name="image_url" placeholder="https://i.ibb.co/..." value={formData.image_url} onChange={handleInputChange} className="form-input" style={{ width: '100%', height: '38px', padding: '0 10px', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Description / Caption</label>
              <textarea name="description" rows={3} value={formData.description} onChange={handleInputChange} className="form-input" style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Display Order</label>
                <input type="number" required name="display_order" value={formData.display_order} onChange={handleInputChange} className="form-input" style={{ width: '100%', height: '38px', padding: '0 10px', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '25px' }}>
                <input type="checkbox" id="active" name="active" checked={formData.active} onChange={handleInputChange} />
                <label htmlFor="active" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>Active (Visible on navbar/filters)</label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={formLoading} className="btn btn-primary" style={{ height: '38px', padding: '0 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Save size={14} /> Save Category
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingCategory(null); }} className="btn btn-outline" style={{ height: '38px', padding: '0 20px', fontSize: '0.85rem' }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Categories List table */}
        {loading ? (
          <p style={{ color: 'var(--color-neutral-muted)' }}>Retrieving categories table...</p>
        ) : (
          <div style={{ background: 'white', borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-neutral-muted)', textAlign: 'left', background: '#FAF7F5' }}>
                  <th style={{ padding: '15px' }}>Display Order</th>
                  <th style={{ padding: '15px' }}>Image</th>
                  <th style={{ padding: '15px' }}>Category Name</th>
                  <th style={{ padding: '15px' }}>Slug</th>
                  <th style={{ padding: '15px' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => (
                  <tr key={cat.id} style={{ borderBottom: '1px solid var(--color-border)', fontSize: '0.9rem' }}>
                    
                    {/* Display Order Controls */}
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 600 }}>{cat.display_order}</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <button onClick={() => moveOrder(idx, 'up')} disabled={idx === 0} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, opacity: idx === 0 ? 0.3 : 1 }} title="Move Up"><ArrowUp size={12} /></button>
                          <button onClick={() => moveOrder(idx, 'down')} disabled={idx === categories.length - 1} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, opacity: idx === categories.length - 1 ? 0.3 : 1 }} title="Move Down"><ArrowDown size={12} /></button>
                        </div>
                      </div>
                    </td>

                    {/* Image */}
                    <td style={{ padding: '15px' }}>
                      <img src={cat.image_url || 'https://via.placeholder.com/60x60?text=No+Cover'} alt={cat.name} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px', background: '#F8F9FA' }} />
                    </td>

                    {/* Name */}
                    <td style={{ padding: '15px', fontWeight: 600 }}>{cat.name}</td>

                    {/* Slug */}
                    <td style={{ padding: '15px', color: 'var(--color-neutral-muted)' }}>{cat.slug}</td>

                    {/* Status */}
                    <td style={{ padding: '15px' }}>
                      <button 
                        onClick={() => toggleCategoryActive(cat)} 
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, color: cat.active ? '#4E8752' : '#C94B4B', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}
                      >
                        {cat.active ? (
                          <>
                            <Eye size={14} /> Active
                          </>
                        ) : (
                          <>
                            <EyeOff size={14} /> Inactive
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '15px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                        <button onClick={() => handleEditClick(cat)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><Edit2 size={13} /> Edit</button>
                        <button onClick={() => handleDeleteCategory(cat.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: '#C94B4B', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><Trash2 size={13} /> Delete</button>
                      </div>
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
