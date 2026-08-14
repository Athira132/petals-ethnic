import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, RotateCcw, ShieldCheck, Ruler, ChevronRight, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Find product
  const product = products.find((p) => p.id === id && p.isActive);

  // States
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);

  // Sync initial values when product changes
  useEffect(() => {
    if (product) {
      setActiveImage(product.images[0]);
      setSelectedSize(product.sizes ? product.sizes[0] : 'M');
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : '');
      setQuantity(1);
      window.scrollTo(0, 0); // Scroll to top when loading new product
    }
  }, [product, id]);

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
  const isOutOfStock = product.stockCount === 0;
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

  // Buy Now handler (adds to cart and immediately redirects to Cart page)
  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedSize, selectedColor);
    navigate('/cart');
  };

  // Related products (same category, excluding current product)
  const relatedProducts = products
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id && p.isActive)
    .slice(0, 4);

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
            <img src={activeImage} alt={product.name} className="main-display-img" />
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
                  <img src={img} alt={`${product.name} view ${idx + 1}`} />
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

          {/* Sizing Selector */}
          {product.sizes && product.sizes.length > 0 && (
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
                disabled={isOutOfStock}
                style={{ width: '100%', maxWidth: '280px', height: '38px', padding: '0 12px', fontSize: '0.85rem' }}
              >
                <option value="">Select Size</option>
                {product.sizes.map((size) => {
                  const isSizeSoldOut = isOutOfStock || (size === 'L' && product.id === 'prod_1');
                  return (
                    <option key={size} value={size} disabled={isSizeSoldOut}>
                      {size} {isSizeSoldOut ? '(SOLD OUT)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="detail-option-section">
              <span className="detail-option-label">Select Color: <strong>{selectedColor}</strong></span>
              <div className="detail-color-selectors">
                {product.colors.map((color) => (
                  <button
                    key={color}
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
          <div className="detail-option-section">
            <span className="detail-option-label">Quantity:</span>
            <div className="qty-row" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <select
                className="card-select-dropdown"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                disabled={isOutOfStock}
                style={{ minWidth: '100px', height: '38px', padding: '0 12px', fontSize: '0.85rem' }}
              >
                {[1, 2, 3, 4, 5].map((qty) => (
                  <option key={qty} value={qty}>
                    {qty}
                  </option>
                ))}
              </select>

              {/* Stock text */}
              <p className="detail-stock-status" style={{ margin: 0 }}>
                {isOutOfStock ? (
                  <span className="out-of-stock-label">Out of Stock</span>
                ) : product.stockCount < 5 ? (
                  <span className="low-stock-label">Hurry! Only {product.stockCount} left in stock</span>
                ) : (
                  <span className="in-stock-label">In Stock ({product.stockCount} units available)</span>
                )}
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="detail-purchase-buttons">
            <button
              className={`btn btn-secondary btn-add-cart ${addedMessage ? 'success' : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
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
            >
              Buy It Now
            </button>

            <button
              className={`btn-wishlist-toggle ${isFavorited ? 'active' : ''}`}
              onClick={() => toggleWishlist(product)}
              title={isFavorited ? "Remove from Wishlist" : "Add to Wishlist"}
              aria-label="Toggle wishlist"
            >
              <Heart size={20} fill={isFavorited ? "var(--color-primary-dark)" : "none"} />
            </button>
          </div>

          {/* Trust points strip */}
          <div className="detail-trust-points">
            <div className="trust-point-item">
              <Truck size={16} />
              <span>Ships in 24-48 hours</span>
            </div>
            <div className="trust-point-item">
              <RotateCcw size={16} />
              <span>7-day easy size exchange</span>
            </div>
            <div className="trust-point-item">
              <ShieldCheck size={16} />
              <span>100% genuine cotton & silks</span>
            </div>
          </div>

          <div className="detail-divider"></div>

          {/* Tabbed Info (Description, Specs, Shipping) */}
          <div className="detail-tabs-container">
            <div className="detail-tab-headers">
              <button 
                className={`tab-header ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button 
                className={`tab-header ${activeTab === 'specs' ? 'active' : ''}`}
                onClick={() => setActiveTab('specs')}
              >
                Fabric Details
              </button>
              <button 
                className={`tab-header ${activeTab === 'shipping' ? 'active' : ''}`}
                onClick={() => setActiveTab('shipping')}
              >
                Shipping & Returns
              </button>
            </div>
            
            <div className="detail-tab-content">
              {activeTab === 'description' && (
                <div className="tab-pane animate-fade-in">
                  <p>{product.description}</p>
                </div>
              )}
              {activeTab === 'specs' && (
                <div className="tab-pane animate-fade-in">
                  <table className="specs-table">
                    <tbody>
                      <tr>
                        <td>Silhouette</td>
                        <td>A-Line, flared ethnic structure</td>
                      </tr>
                      <tr>
                        <td>Fabric</td>
                        <td>Premium cotton / linen / silk blend depending on style</td>
                      </tr>
                      <tr>
                        <td>Embellishments</td>
                        <td>Handwork detailing and premium tailored seams</td>
                      </tr>
                      <tr>
                        <td>Care Instructions</td>
                        <td>Dry clean recommended for silks. Mild hand wash for cotton/linens.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {activeTab === 'shipping' && (
                <div className="tab-pane animate-fade-in">
                  <p>We ship all over India. Orders are processed within 2 business days and typically reach major cities in 4-6 business days.</p>
                  <p>Size exchanges are allowed within 7 days of receiving the delivery. Please ensure tags are intact and outfits are unworn.</p>
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
                  <tr>
                    <td>XXL</td>
                    <td>42 - 43</td>
                    <td>36 - 37</td>
                    <td>45 - 46</td>
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
