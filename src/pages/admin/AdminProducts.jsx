import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AdminNavbar from '../../components/AdminNavbar';
import { Plus, Edit2, Trash2, Save, X, Image, Upload, AlertCircle } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // View / Edit Toggle
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category_id: '',
    price: '',
    sale_price: '',
    featured: false,
    new_arrival: false,
    availability: 'in_stock'
  });

  const [formImages, setFormImages] = useState([]);
  const [rawImageUrl, setRawImageUrl] = useState('');
  const [colors, setColors] = useState([]);
  const [rawColor, setRawColor] = useState('');

  // Sizing stock states
  const [sizeXS, setSizeXS] = useState(0);
  const [sizeS, setSizeS] = useState(0);
  const [sizeM, setSizeM] = useState(0);
  const [sizeL, setSizeL] = useState(0);
  const [sizeXL, setSizeXL] = useState(0);

  // Loading/Error states
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name, slug), product_images(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching active categories:', err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'name' && !editingProduct) {
      setFormData(prev => ({
        ...prev,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }));
    }
  };

  // Image Upload handler proxying files to ImgBB via Vercel serverless /api/imgbb-upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadLoading(true);
    setUploadError('');

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
          if (!res.ok) {
            throw new Error(data.error || 'Upload request failed.');
          }

          setFormImages(prev => [...prev, data.url]);
        } catch (err) {
          setUploadError(err.message || 'ImgBB secure upload failed.');
        } finally {
          setUploadLoading(false);
        }
      };
      
      reader.onerror = () => {
        setUploadError('Failed to parse selected photo.');
        setUploadLoading(false);
      };

    } catch (err) {
      setUploadError(err.message || 'Error occurred during file conversion.');
      setUploadLoading(false);
    }
  };

  const handleAddImageUrl = () => {
    if (rawImageUrl.trim()) {
      setFormImages(prev => [...prev, rawImageUrl.trim()]);
      setRawImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setFormImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddColor = () => {
    if (rawColor.trim() && !colors.includes(rawColor.trim())) {
      setColors(prev => [...prev, rawColor.trim()]);
      setRawColor('');
    }
  };

  const handleRemoveColor = (col) => {
    setColors(prev => prev.filter(c => c !== col));
  };

  // Pre-load form for editing
  const handleEditClick = async (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      slug: prod.slug,
      description: prod.description || '',
      category_id: prod.category_id || '',
      price: prod.price,
      sale_price: prod.sale_price || '',
      featured: prod.featured,
      new_arrival: prod.new_arrival,
      availability: prod.availability
    });
    
    // Sort and map joined product_images records
    const sortedImages = prod.product_images 
      ? [...prod.product_images].sort((a,b) => a.display_order - b.display_order).map(img => img.image_url)
      : [];
    setFormImages(sortedImages);
    setColors(prod.colors || []);
    setFormError('');

    // Fetch this product's sizes
    try {
      const { data, error } = await supabase
        .from('product_sizes')
        .select('*')
        .eq('product_id', prod.id);

      if (error) throw error;
      
      // Reset sizes
      setSizeXS(0);
      setSizeS(0);
      setSizeM(0);
      setSizeL(0);
      setSizeXL(0);

      (data || []).forEach(item => {
        if (item.size === 'XS') setSizeXS(item.stock);
        if (item.size === 'S') setSizeS(item.stock);
        if (item.size === 'M') setSizeM(item.stock);
        if (item.size === 'L') setSizeL(item.stock);
        if (item.size === 'XL') setSizeXL(item.stock);
      });

      setShowForm(true);
    } catch (err) {
      console.error('Error fetching size variants:', err.message);
    }
  };

  // Submit save product handler
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    if (formImages.length === 0) {
      setFormError('Please add at least one product photo.');
      setFormLoading(false);
      return;
    }

    try {
      const productPayload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        category_id: formData.category_id || null,
        price: Number(formData.price),
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        featured: formData.featured,
        new_arrival: formData.new_arrival,
        availability: formData.availability,
        colors: colors,
        updated_at: new Date()
      };

      let productId;

      if (editingProduct) {
        productId = editingProduct.id;
        const { error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', productId);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(productPayload)
          .select('id')
          .single();

        if (error) throw error;
        productId = data.id;
      }

      // Upsert sizing stock records
      await supabase.from('product_sizes').delete().eq('product_id', productId);

      const sizeRows = [
        { product_id: productId, size: 'XS', stock: Number(sizeXS), status: Number(sizeXS) === 0 ? 'sold_out' : Number(sizeXS) <= 5 ? 'few_left' : 'available' },
        { product_id: productId, size: 'S', stock: Number(sizeS), status: Number(sizeS) === 0 ? 'sold_out' : Number(sizeS) <= 5 ? 'few_left' : 'available' },
        { product_id: productId, size: 'M', stock: Number(sizeM), status: Number(sizeM) === 0 ? 'sold_out' : Number(sizeM) <= 5 ? 'few_left' : 'available' },
        { product_id: productId, size: 'L', stock: Number(sizeL), status: Number(sizeL) === 0 ? 'sold_out' : Number(sizeL) <= 5 ? 'few_left' : 'available' },
        { product_id: productId, size: 'XL', stock: Number(sizeXL), status: Number(sizeXL) === 0 ? 'sold_out' : Number(sizeXL) <= 5 ? 'few_left' : 'available' }
      ];

      const { error: sizesInsertErr } = await supabase.from('product_sizes').insert(sizeRows);
      if (sizesInsertErr) throw sizesInsertErr;

      // Upsert product_images entries
      await supabase.from('product_images').delete().eq('product_id', productId);
      
      const imgRows = formImages.map((url, index) => ({
        product_id: productId,
        image_url: url,
        display_order: index,
        is_primary: index === 0
      }));

      const { error: imgInsertErr } = await supabase.from('product_images').insert(imgRows);
      if (imgInsertErr) throw imgInsertErr;

      // Update cumulative stock totals
      const totalStock = Number(sizeXS) + Number(sizeS) + Number(sizeM) + Number(sizeL) + Number(sizeXL);
      let calculatedAvailability = formData.availability;
      if (totalStock === 0) {
        calculatedAvailability = 'sold_out';
      } else if (totalStock <= 5) {
        calculatedAvailability = 'few_left';
      } else if (formData.availability === 'sold_out' || formData.availability === 'few_left') {
        calculatedAvailability = 'in_stock';
      }

      await supabase
        .from('products')
        .update({ 
          stock: totalStock,
          availability: calculatedAvailability
        })
        .eq('id', productId);

      setShowForm(false);
      setEditingProduct(null);
      setFormImages([]);
      setColors([]);
      await fetchProducts();
    } catch (err) {
      setFormError(err.message || 'Error occurred while saving product data.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (!confirm('Are you sure you want to delete this product? All sales logs, images, and size entries will be deleted.')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', prodId);

      if (error) throw error;
      await fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to delete product.');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA' }}>
      <AdminNavbar />

      <div style={{ marginLeft: '260px', padding: '40px', flex: 1, textAlign: 'left' }}>
        
        {/* Header Title */}
        <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-neutral-dark)', margin: 0 }}>Product Manager</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-neutral-muted)' }}>Configure outfit specifications, stock quantities, and catalog pricing</span>
          </div>
          {!showForm && (
            <button 
              onClick={() => {
                setEditingProduct(null);
                setFormData({ name: '', slug: '', description: '', category_id: categories[0]?.id || '', price: '', sale_price: '', featured: false, new_arrival: false, availability: 'in_stock' });
                setFormImages([]);
                setColors([]);
                setSizeXS(0); setSizeS(0); setSizeM(0); setSizeL(0); setSizeXL(0);
                setFormError('');
                setShowForm(true);
              }}
              className="btn btn-primary" 
              style={{ height: '38px', padding: '0 15px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} /> Add Product
            </button>
          )}
        </div>

        {/* Product Editor / Creator Form Viewport */}
        {showForm && (
          <form onSubmit={handleSaveProduct} style={{ background: 'white', padding: '30px', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '35px' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '20px', display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <span>{editingProduct ? `Edit Outfit: ${editingProduct.name}` : 'Upload New Design'}</span>
              <button type="button" onClick={() => { setShowForm(false); setEditingProduct(null); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </h4>

            {formError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#FFF5F5', color: '#C94B4B', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid #FFD8D8' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
              
              {/* Left Column: Specs, Category, Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Product Name</label>
                    <input type="text" required name="name" value={formData.name} onChange={handleInputChange} className="form-input" style={{ width: '100%', height: '38px', padding: '0 10px', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Slug (URL path)</label>
                    <input type="text" required name="slug" value={formData.slug} onChange={handleInputChange} className="form-input" style={{ width: '100%', height: '38px', padding: '0 10px', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Collection Category</label>
                    <select name="category_id" value={formData.category_id} onChange={handleInputChange} className="card-select-dropdown" style={{ width: '100%', height: '38px', padding: '0 10px', fontSize: '0.85rem' }}>
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>General Status</label>
                    <select name="availability" value={formData.availability} onChange={handleInputChange} className="card-select-dropdown" style={{ width: '100%', height: '38px', padding: '0 10px', fontSize: '0.85rem' }}>
                      <option value="in_stock">In Stock</option>
                      <option value="few_left">Few Left</option>
                      <option value="sold_out">Sold Out</option>
                      <option value="unavailable">Unavailable (Archived)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Regular Price (INR)</label>
                    <input type="number" step="0.01" required name="price" value={formData.price} onChange={handleInputChange} className="form-input" style={{ width: '100%', height: '38px', padding: '0 10px', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Sale Price (INR, Optional)</label>
                    <input type="number" step="0.01" name="sale_price" value={formData.sale_price} onChange={handleInputChange} className="form-input" style={{ width: '100%', height: '38px', padding: '0 10px', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Product Description</label>
                  <textarea name="description" rows={5} value={formData.description} onChange={handleInputChange} className="form-input" style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', resize: 'vertical' }} />
                </div>

                {/* Sizing stock controllers */}
                <div style={{ background: '#FAF7F5', padding: '20px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                  <h5 style={{ margin: '0 0 15px', fontFamily: 'var(--font-serif)', fontSize: '1rem' }}>Size-specific Stock Quantities</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'center' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>XS</label>
                      <input type="number" min="0" value={sizeXS} onChange={(e) => setSizeXS(Math.max(0, parseInt(e.target.value) || 0))} style={{ width: '100%', height: '34px', textAlign: 'center', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'center' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>S</label>
                      <input type="number" min="0" value={sizeS} onChange={(e) => setSizeS(Math.max(0, parseInt(e.target.value) || 0))} style={{ width: '100%', height: '34px', textAlign: 'center', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'center' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>M</label>
                      <input type="number" min="0" value={sizeM} onChange={(e) => setSizeM(Math.max(0, parseInt(e.target.value) || 0))} style={{ width: '100%', height: '34px', textAlign: 'center', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'center' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>L</label>
                      <input type="number" min="0" value={sizeL} onChange={(e) => setSizeL(Math.max(0, parseInt(e.target.value) || 0))} style={{ width: '100%', height: '34px', textAlign: 'center', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'center' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>XL</label>
                      <input type="number" min="0" value={sizeXL} onChange={(e) => setSizeXL(Math.max(0, parseInt(e.target.value) || 0))} style={{ width: '100%', height: '34px', textAlign: 'center', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id="featured" name="featured" checked={formData.featured} onChange={handleInputChange} />
                    <label htmlFor="featured" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>Spotlight Feature (Featured list)</label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id="new_arrival" name="new_arrival" checked={formData.new_arrival} onChange={handleInputChange} />
                    <label htmlFor="new_arrival" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>Mark as New Arrival</label>
                  </div>
                </div>

              </div>

              {/* Right Column: Images and Colors */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                
                {/* Images Section */}
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '20px' }}>
                  <h5 style={{ margin: '0 0 15px', fontFamily: 'var(--font-serif)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Image size={16} /> Product Media Gallery</h5>
                  
                  {/* File Upload Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-muted)' }}>Secure Vercel API upload proxy to ImgBB</span>
                    <label style={{ height: '38px', border: '1px dashed var(--color-gold)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', background: '#FAF7F5', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-gold)' }}>
                      <Upload size={16} /> {uploadLoading ? 'Uploading file...' : 'Choose File to Upload'}
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploadLoading} />
                    </label>
                    {uploadError && <span style={{ fontSize: '0.75rem', color: '#C94B4B' }}>{uploadError}</span>}
                  </div>

                  {/* Manual Input url fallback */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    <input type="text" placeholder="Or paste image URL" value={rawImageUrl} onChange={(e) => setRawImageUrl(e.target.value)} className="form-input" style={{ flex: 1, height: '36px', padding: '0 8px', fontSize: '0.8rem' }} />
                    <button type="button" onClick={handleAddImageUrl} className="btn btn-outline" style={{ height: '36px', fontSize: '0.8rem' }}>Add</button>
                  </div>

                  {/* Images list display */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {formImages.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '100%', paddingBottom: '133%', background: '#F8F9FA', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                        <img src={img} alt="preview" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => handleRemoveImage(idx)} style={{ position: 'absolute', top: '2px', right: '2px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                        {idx === 0 && <span style={{ position: 'absolute', bottom: '2px', left: '2px', background: 'var(--color-rose)', color: 'white', fontSize: '8px', padding: '2px 4px', borderRadius: '2px', fontWeight: 'bold' }}>COVER</span>}
                      </div>
                    ))}
                    {formImages.length === 0 && (
                      <div style={{ gridColumn: '1/-1', padding: '30px 10px', textAlign: 'center', color: 'var(--color-neutral-muted)', fontSize: '0.8rem' }}>
                        No product photos added.
                      </div>
                    )}
                  </div>

                </div>

                {/* Colors Capsule section */}
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '20px' }}>
                  <h5 style={{ margin: '0 0 12px', fontFamily: 'var(--font-serif)', fontSize: '0.95rem' }}>Color Variations</h5>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                    <input type="text" placeholder="e.g. Blush Pink" value={rawColor} onChange={(e) => setRawColor(e.target.value)} className="form-input" style={{ flex: 1, height: '36px', padding: '0 8px', fontSize: '0.8rem' }} />
                    <button type="button" onClick={handleAddColor} className="btn btn-outline" style={{ height: '36px', fontSize: '0.8rem' }}>Add</button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {colors.map((c) => (
                      <span key={c} style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-border)', padding: '4px 10px', borderRadius: '15px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {c}
                        <button type="button" onClick={() => handleRemoveColor(c)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#C94B4B', padding: 0, fontWeight: 'bold', fontSize: '10px' }}>✕</button>
                      </span>
                    ))}
                    {colors.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--color-neutral-muted)' }}>No colors defined.</span>}
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Actions */}
            <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '30px', paddingTop: '20px', display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={formLoading} className="btn btn-primary" style={{ height: '42px', padding: '0 25px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <Save size={16} /> {formLoading ? 'Saving...' : 'Save Product'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingProduct(null); }} className="btn btn-outline" style={{ height: '42px', padding: '0 25px' }}>
                Cancel
              </button>
            </div>

          </form>
        )}

        {/* Products list table */}
        {loading ? (
          <p style={{ color: 'var(--color-neutral-muted)' }}>Retrieving product inventory details...</p>
        ) : (
          <div style={{ background: 'white', borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-neutral-muted)', textAlign: 'left', background: '#FAF7F5' }}>
                  <th style={{ padding: '15px' }}>Image</th>
                  <th style={{ padding: '15px' }}>Name</th>
                  <th style={{ padding: '15px' }}>Collection</th>
                  <th style={{ padding: '15px' }}>Regular Price</th>
                  <th style={{ padding: '15px' }}>Sale Price</th>
                  <th style={{ padding: '15px' }}>Stock</th>
                  <th style={{ padding: '15px' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => {
                  const sortedImgs = prod.product_images 
                    ? [...prod.product_images].sort((a,b) => a.display_order - b.display_order).map(img => img.image_url)
                    : [];
                  return (
                    <tr key={prod.id} style={{ borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
                      <td style={{ padding: '12px 15px' }}>
                        <img src={sortedImgs[0] || 'https://via.placeholder.com/60x85?text=No+Photo'} alt={prod.name} style={{ width: '40px', height: '55px', objectFit: 'cover', borderRadius: '4px', background: '#F8F9FA' }} />
                      </td>
                      <td style={{ padding: '12px 15px', fontWeight: 600 }}>{prod.name}</td>
                      <td style={{ padding: '12px 15px', color: 'var(--color-neutral-muted)' }}>{prod.categories?.name || 'Unassigned'}</td>
                      <td style={{ padding: '12px 15px', fontWeight: 600 }}>₹{prod.price}</td>
                      <td style={{ padding: '12px 15px', color: '#C94B4B', fontWeight: 600 }}>{prod.sale_price ? `₹${prod.sale_price}` : '-'}</td>
                      <td style={{ padding: '12px 15px', fontWeight: 'bold' }}>{prod.stock}</td>
                      <td style={{ padding: '12px 15px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          background: prod.availability === 'in_stock' ? '#EAF8EB' : prod.availability === 'sold_out' ? '#FFF5F5' : '#FAF7F5',
                          color: prod.availability === 'in_stock' ? '#4E8752' : prod.availability === 'sold_out' ? '#C94B4B' : 'var(--color-gold)'
                        }}>
                          {prod.availability.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 15px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                          <button onClick={() => handleEditClick(prod)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><Edit2 size={13} /> Edit</button>
                          <button onClick={() => handleDeleteProduct(prod.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: '#C94B4B', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><Trash2 size={13} /> Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
