import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, RotateCcw, ShieldCheck, Ruler, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { supabase, mapProduct } from '../lib/supabase';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Database States
  const [product, setProduct] = useState(null);
  const [productSizes, setProductSizes] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Interaction States
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);

  // Sync data when ID changes
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setErrorMsg('');

        // 1. Fetch main product details
        const { data: prodData, error: prodErr } = await supabase
          .from('products')
          .select('*, categories(id, slug, name), product_images(*)')
          .eq('id', id)
          .single();

        if (prodErr || !prodData) {
          setProduct(null);
          setLoading(false);
          return;
        }

        const mapped = mapProduct(prodData);
        setProduct(mapped);
        setActiveImage(mapped.images[0] || '');
        setSelectedColor(mapped.colors && mapped.colors.length > 0 ? mapped.colors[0] : '');
        setQuantity(1);

        // 2. Fetch size variants and stock counts
        const { data: sizeData, error: sizeErr } = await supabase
          .from('product_sizes')
          .select('*')
          .eq('product_id', id);

        if (sizeErr) throw sizeErr;
        
        // Sort sizes in order XS, S, M, L, XL
        const sizeOrder = { 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5 };
        const sortedSizes = (sizeData || []).sort((a, b) => sizeOrder[a.size] - sizeOrder[b.size]);
        setProductSizes(sortedSizes);

        // Select the first available size by default
        const firstAvailable = sortedSizes.find(s => s.status !== 'sold_out' && s.stock > 0);
        setSelectedSize(firstAvailable ? firstAvailable.size : '');

        // 3. Fetch related products in the same category
        const { data: relData, error: relErr } = await supabase
          .from('products')
          .select('*, categories(slug, name), product_images(*)')
          .eq('category_id', mapped.category_id)
          .neq('id', mapped.id)
          .neq('availability', 'unavailable')
          .limit(4);

        if (relErr) throw relErr;
        setRelatedProducts((relData || []).map(mapProduct));

      } catch (err) {
        console.error('Error fetching product details:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const [errorMsg, setErrorMsg] = useState('');

  if (loading) {
    return (
      <div className="container text-center" style={{ padding: '120px 20px' }}>
        <div className="loading-spinner" style={{ border: '3px solid var(--color-primary-light)', borderTop: '3px solid var(--color-rose)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
        <p style={{ color: 'var(--color-neutral-muted)', fontSize: '0.9rem' }}>Loading Outfit Details...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container text-center" style={{ padding: '100px 20px' }}>
        <h2>Product Not Found</h2>
        <p>The outfit you are looking for is unavailable or has been removed.</p>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Shop
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const onSale = product.salePrice !== null && product.salePrice !== undefined;
  
  // Find current selected size record
  const selectedSizeRecord = productSizes.find(s => s.size === selectedSize);
  const isOutOfStock = product.stockCount === 0 || !selectedSizeRecord || selectedSizeRecord.status === 'sold_out' || selectedSizeRecord.stock === 0;

  const discountPercent = onSale 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  // Add to cart handler
  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedSize, selectedColor);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 2000);
  };

  // Buy Now handler
  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedSize, selectedColor);
    navigate('/cart');
  };

  return (
    <div className="product-detail-page-wrapper">
      {/* Breadcrumbs */}
      <div className="container" style={{ paddingTop: '20px' }}>
        <div className="breadcrumbs" style={{ textAlign: 'left', marginBottom: '20px' }}>
          <Link to="/">Home</Link> <span>/</span> 
          <Link to="/shop">Shop</Link> <span>/</span> 
          <Link to={`/category/${product.categorySlug}`}>{product.categorySlug.replace(/-/g, ' ')}</Link> <span>/</span> 
          <span className="active-breadcrumb">{product.name}</span>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="container product-detail-grid">
        {/* Left Column: Image Gallery */}
        <div className="product-gallery-column">
          <div className="main-image-viewport">
            <img src={activeImage} alt={product.name} className="main-display-img" style={{ objectPosition: 'center top', objectFit: 'cover' }} />
            {onSale && !isOutOfStock && (
              <span className="detail-sale-badge">{discountPercent}% OFF</span>
            )}
            {isOutOfStock && (
              <span className="detail-soldout-badge">SOLD OUT</span>
            )}
          </div>

          {/* Thumbnail list */}
          {product.images.length > 1 && (
            <div className="gallery-thumbnails">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  className={`thumb-btn ${activeImage === img ? 'active' : ''}`}
                  onClick={() => setActiveImage(img)}
                >
                  <img src={img} alt={`${product.name} view ${idx + 1}`} style={{ objectPosition: 'center top', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information & Form */}
        <div className="product-info-column animate-slide-up">
          <span className="detail-category">{product.categorySlug.replace(/-/g, ' ')}</span>
          <h1 className="detail-title">{product.name}</h1>

          {/* Price Block */}
          <div className="detail-price-row">
            {onSale ? (
              <>
                <span className="detail-price-sale">₹{product.salePrice}</span>
                <span className="detail-price-original">₹{product.price}</span>
              </>
            ) : (
              <span className="detail-price-regular">₹{product.price}</span>
            )}
          </div>

          <div className="detail-divider"></div>

          {/* Sizing Selector Dropdown */}
          {productSizes.length > 0 && (
            <div className="detail-option-section">
              <div className="option-header-row">
                <span className="detail-option-label">Select Size:</span>
                <button 
                  className="size-guide-trigger-btn"
                  onClick={() => setIsSizeGuideOpen(true)}
                >
                  <Ruler size={14} /> Size Guide
                </button>
              </div>
              <select
                className="card-select-dropdown"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                disabled={product.stockCount === 0}
                style={{ width: '100%', maxWidth: '280px', height: '38px', padding: '0 12px', fontSize: '0.85rem' }}
              >
                <option value="">Select Size</option>
                {productSizes.map((szRecord) => {
                  const isSizeSoldOut = szRecord.status === 'sold_out' || szRecord.stock === 0;
                  const labelSuffix = isSizeSoldOut 
                    ? '(SOLD OUT)' 
                    : szRecord.status === 'few_left' 
                      ? `(FEW LEFT - only ${szRecord.stock} left)`
                      : '';
                  return (
                    <option key={szRecord.size} value={szRecord.size} disabled={isSizeSoldOut}>
                      {szRecord.size} {labelSuffix}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="detail-option-section" style={{ marginTop: '20px' }}>
              <span className="detail-option-label">Select Color: <strong>{selectedColor}</strong></span>
              <div className="detail-color-selectors" style={{ marginTop: '8px' }}>
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-btn-capsule ${selectedColor === color ? 'selected' : ''}`}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector & Stock Status */}
          <div className="detail-option-section" style={{ marginTop: '20px' }}>
            <span className="detail-option-label">Quantity:</span>
            <div className="qty-row" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '8px' }}>
              <select
                className="card-select-dropdown"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                disabled={isOutOfStock}
                style={{ minWidth: '100px', height: '38px', padding: '0 12px', fontSize: '0.85rem' }}
              >
                {Array.from({ length: selectedSizeRecord ? Math.min(5, selectedSizeRecord.stock) : 1 }, (_, i) => i + 1).map((qty) => (
                  <option key={qty} value={qty}>
                    {qty}
                  </option>
                ))}
              </select>

              {/* Stock text */}
              <p className="detail-stock-status" style={{ margin: 0 }}>
                {isOutOfStock ? (
                  <span className="out-of-stock-label">Out of Stock</span>
                ) : selectedSizeRecord?.status === 'few_left' ? (
                  <span className="low-stock-label" style={{ color: 'var(--color-gold)', fontWeight: 600 }}>Few left! Only {selectedSizeRecord.stock} items in stock</span>
                ) : (
                  <span className="in-stock-label" style={{ color: '#4E8752' }}>In Stock ({selectedSizeRecord?.stock} units available)</span>
                )}
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="detail-purchase-buttons" style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
            <button
              className={`btn btn-secondary btn-add-cart ${addedMessage ? 'success' : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={{ flex: 1, height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 600 }}
            >
              {addedMessage ? (
                <>
                  <Check size={18} /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingBag size={18} /> Add to Cart
                </>
              )}
            </button>

            <button
              className="btn btn-primary btn-buy-now"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              style={{ flex: 1, height: '46px', fontWeight: 600 }}
            >
              Buy It Now
            </button>

            <button
              className={`btn-wishlist-toggle ${isFavorited ? 'active' : ''}`}
              onClick={() => toggleWishlist(product)}
              title={isFavorited ? "Remove from Wishlist" : "Add to Wishlist"}
              aria-label="Toggle wishlist"
              style={{ border: '1px solid var(--color-border)', background: 'transparent', padding: '10px 14px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <Heart size={20} fill={isFavorited ? "var(--color-rose)" : "none"} stroke="var(--color-rose)" />
            </button>
          </div>

          {/* Trust points strip */}
          <div className="detail-trust-points" style={{ marginTop: '30px', display: 'flex', gap: '20px', fontSize: '0.8rem', color: 'var(--color-neutral-muted)' }}>
            <div className="trust-point-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={16} />
              <span>Ships in 24-48 hours</span>
            </div>
            <div className="trust-point-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RotateCcw size={16} />
              <span>7-day easy size exchange</span>
            </div>
            <div className="trust-point-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} />
              <span>100% genuine silks</span>
            </div>
          </div>

          <div className="detail-divider" style={{ margin: '30px 0' }}></div>

          {/* Tabbed Info */}
          <div className="detail-tabs-container">
            <div className="detail-tab-headers" style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
              <button 
                className={`tab-header ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, paddingBottom: '10px', color: activeTab === 'description' ? 'var(--color-rose)' : 'var(--color-neutral-muted)', borderBottom: activeTab === 'description' ? '2px solid var(--color-rose)' : 'none' }}
              >
                Description
              </button>
              <button 
                className={`tab-header ${activeTab === 'specs' ? 'active' : ''}`}
                onClick={() => setActiveTab('specs')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, paddingBottom: '10px', color: activeTab === 'specs' ? 'var(--color-rose)' : 'var(--color-neutral-muted)', borderBottom: activeTab === 'specs' ? '2px solid var(--color-rose)' : 'none' }}
              >
                Fabric Details
              </button>
              <button 
                className={`tab-header ${activeTab === 'shipping' ? 'active' : ''}`}
                onClick={() => setActiveTab('shipping')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, paddingBottom: '10px', color: activeTab === 'shipping' ? 'var(--color-rose)' : 'var(--color-neutral-muted)', borderBottom: activeTab === 'shipping' ? '2px solid var(--color-rose)' : 'none' }}
              >
                Shipping & Returns
              </button>
            </div>
            
            <div className="detail-tab-content" style={{ marginTop: '20px', textAlign: 'left', lineHeight: '1.6', fontSize: '0.9rem', color: 'var(--color-neutral-dark)' }}>
              {activeTab === 'description' && (
                <div className="tab-pane animate-fade-in">
                  <p>{product.description}</p>
                </div>
              )}
              {activeTab === 'specs' && (
                <div className="tab-pane animate-fade-in">
                  <table className="specs-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '8px 0', fontWeight: 600 }}>Silhouette</td>
                        <td style={{ padding: '8px 0', color: 'var(--color-neutral-muted)' }}>A-Line, flared boutique drape</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '8px 0', fontWeight: 600 }}>Fabric</td>
                        <td style={{ padding: '8px 0', color: 'var(--color-neutral-muted)' }}>Premium organic cottons / metallic tissue silks</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '8px 0', fontWeight: 600 }}>Tailoring</td>
                        <td style={{ padding: '8px 0', color: 'var(--color-neutral-muted)' }}>Premium seams, gather layers, and custom borders</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {activeTab === 'shipping' && (
                <div className="tab-pane animate-fade-in">
                  <p>We deliver all across India. Standard orders are packed and dispatched within 24-48 hours. Transit takes 4-6 business days depending on location.</p>
                  <p>Hassle-free exchanges are supported within 7 days of delivery. Outfit must be unworn and in original condition with tags attached.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="detail-related-products bg-neutral" style={{ padding: '80px 0', marginTop: '60px' }}>
          <div className="container">
            <h2 className="related-title text-center" style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', marginBottom: '40px' }}>
              You May Also Love
            </h2>
            <div className="products-grid grid-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SIZE GUIDE MODAL */}
      {isSizeGuideOpen && (
        <div className="size-guide-overlay animate-fade-in">
          <div className="size-guide-backdrop" onClick={() => setIsSizeGuideOpen(false)}></div>
          <div className="size-guide-modal animate-slide-up">
            <button className="size-guide-close" onClick={() => setIsSizeGuideOpen(false)}>✕</button>
            <h2>Size Guide & Measurement Table</h2>
            <p>Our sizes are structured to give you the perfect comfortable ethnic drape. Refer to the table below (all measurements in inches):</p>
            
            <div className="table-responsive">
              <table className="size-guide-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Bust (in)</th>
                    <th>Waist (in)</th>
                    <th>Hip (in)</th>
                    <th>Length (in)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>XS</td>
                    <td>32 - 33</td>
                    <td>26 - 27</td>
                    <td>35 - 36</td>
                    <td>44</td>
                  </tr>
                  <tr>
                    <td>S</td>
                    <td>34 - 35</td>
                    <td>28 - 29</td>
                    <td>37 - 38</td>
                    <td>44</td>
                  </tr>
                  <tr>
                    <td>M</td>
                    <td>36 - 37</td>
                    <td>30 - 31</td>
                    <td>39 - 40</td>
                    <td>45</td>
                  </tr>
                  <tr>
                    <td>L</td>
                    <td>38 - 39</td>
                    <td>32 - 33</td>
                    <td>41 - 42</td>
                    <td>45</td>
                  </tr>
                  <tr>
                    <td>XL</td>
                    <td>40 - 41</td>
                    <td>34 - 35</td>
                    <td>43 - 44</td>
                    <td>46</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="size-guide-tips">
              <h4>Measuring Tips</h4>
              <p><strong>Bust:</strong> Measure around the fullest part of your chest, keeping the tape level.</p>
              <p><strong>Waist:</strong> Measure around your natural waistline, keeping the tape slightly loose.</p>
              <p><strong>Length:</strong> Measured from the highest point of the shoulder down to the hemline.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
