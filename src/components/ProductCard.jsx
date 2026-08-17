import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, X, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes ? product.sizes[0] : 'M');
  const [selectedColor] = useState(product.colors ? product.colors[0] : '');
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  const favorited = isInWishlist(product.id);
  const onSale = product.salePrice !== null && product.salePrice !== undefined;
  const isOutOfStock = product.stockCount === 0;

  // Calculate discount percentage
  const discountPercent = onSale 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleAddToCartClick = (e) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedSize, selectedColor);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 2000);
  };

  const handleQuickViewAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedSize, selectedColor);
    setIsQuickViewOpen(false);
    setQuantity(1);
  };

  return (
    <>
      <div className="product-card-container">
        {/* Unobstructed Image Media Wrapper */}
        <div className="product-card-media img-zoom-container">
          <Link to={`/product/${product.id}`} className="product-card-img-link">
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="img-zoom product-card-img" 
              loading="lazy"
            />
          </Link>

          {/* Badges */}
          <div className="product-card-badges">
            {isOutOfStock && (
              <span className="badge badge-out-of-stock">Sold Out</span>
            )}
            {!isOutOfStock && onSale && (
              <span className="badge badge-sale">{discountPercent}% Off</span>
            )}
          </div>
        </div>

        {/* Restructured Info & Controls Area (Completely below image) */}
        <div className="product-card-info">
          <span className="product-card-category">{product.categorySlug.replace(/-/g, ' ')}</span>
          <h3 className="product-card-title">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          
          {/* Brand description extraction */}
          <p className="product-card-desc">
            {product.description.split('.')[0]}.
          </p>

          <div className="product-card-price-container">
            {onSale ? (
              <>
                <span className="price-sale">₹{product.salePrice}</span>
                <span className="price-original">₹{product.price}</span>
              </>
            ) : (
              <span className="price-regular">₹{product.price}</span>
            )}
          </div>

          {/* Premium Size Selection Dropdown */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="card-selector-group">
              <span className="card-selector-label">Size:</span>
              <select
                className="card-select-dropdown"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                disabled={isOutOfStock}
              >
                <option value="">Select Size</option>
                {product.sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Premium Quantity Selection Dropdown */}
          <div className="card-selector-group">
            <span className="card-selector-label">Quantity:</span>
            <select
              className="card-select-dropdown"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              disabled={isOutOfStock}
            >
              {[1, 2, 3, 4, 5].map((qty) => (
                <option key={qty} value={qty}>
                  {qty}
                </option>
              ))}
            </select>
          </div>

          {/* Actions Row */}
          <div className="card-actions-row">
            <button
              type="button"
              className={`card-btn-add-to-cart ${addedMessage ? 'success' : ''}`}
              onClick={handleAddToCartClick}
              disabled={isOutOfStock}
            >
              {addedMessage ? 'ADDED!' : isOutOfStock ? 'SOLD OUT' : 'ADD TO CART'}
            </button>
            
            <button
              type="button"
              className={`card-btn-wishlist ${favorited ? 'favorited' : ''}`}
              onClick={() => toggleWishlist(product)}
              title={favorited ? "Remove from Wishlist" : "Add to Wishlist"}
              aria-label="Toggle wishlist"
            >
              {favorited ? (
                <Heart size={20} fill="var(--color-rose)" stroke="var(--color-rose)" />
              ) : (
                <Heart size={20} stroke="var(--color-rose)" />
              )}
            </button>
          </div>

          {/* Toast Notification/Confirmation popup */}
          {addedMessage && (
            <div className="card-toast-feedback animate-fade-in">
              <CheckCircle size={14} className="toast-icon" /> Size {selectedSize} added
            </div>
          )}
        </div>
      </div>

      {/* QUICK VIEW MODAL */}
      {isQuickViewOpen && (
        <div className="quickview-overlay animate-fade-in">
          <div className="quickview-backdrop" onClick={() => setIsQuickViewOpen(false)}></div>
          <div className="quickview-modal animate-slide-up">
            <button className="quickview-close" onClick={() => setIsQuickViewOpen(false)} aria-label="Close modal">
              <X size={24} />
            </button>

            <div className="quickview-content-grid">
              <div className="quickview-gallery">
                <img src={product.images[0]} alt={product.name} className="quickview-main-img" />
              </div>

              <div className="quickview-details">
                <span className="quickview-category">{product.categorySlug.replace(/-/g, ' ')}</span>
                <h2 className="quickview-title">{product.name}</h2>
                
                <div className="quickview-price-container">
                  {onSale ? (
                    <>
                      <span className="price-sale">₹{product.salePrice}</span>
                      <span className="price-original">₹{product.price}</span>
                      <span className="quickview-sale-tag">{discountPercent}% Off</span>
                    </>
                  ) : (
                    <span className="price-regular">₹{product.price}</span>
                  )}
                </div>

                <p className="quickview-desc">{product.description}</p>

                {product.sizes && product.sizes.length > 0 && (
                  <div className="quickview-option-group">
                    <span className="option-label">Select Size</span>
                    <select
                      className="card-select-dropdown"
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      disabled={isOutOfStock}
                    >
                      <option value="">Select Size</option>
                      {product.sizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="quickview-purchase-actions">
                  <div className="qty-selector-container" style={{ border: 'none', padding: 0 }}>
                    <select
                      className="card-select-dropdown"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      disabled={isOutOfStock}
                      style={{ height: '38px', minWidth: '80px' }}
                    >
                      {[1, 2, 3, 4, 5].map((qty) => (
                        <option key={qty} value={qty}>
                          {qty}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button 
                    className="btn btn-primary quickview-add-btn"
                    onClick={handleQuickViewAddToCart}
                    disabled={isOutOfStock}
                  >
                    {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                  </button>
                </div>

                <p className="quickview-stock-indicator">
                  {isOutOfStock ? (
                    <span className="out-of-stock-text">Out of stock</span>
                  ) : product.stockCount < 5 ? (
                    <span className="low-stock-text">Only {product.stockCount} left in stock - order soon!</span>
                  ) : (
                    <span className="in-stock-text">In stock ({product.stockCount} units available)</span>
                  )}
                </p>

                <Link 
                  to={`/product/${product.id}`} 
                  className="quickview-full-details-link"
                  onClick={() => setIsQuickViewOpen(false)}
                >
                  View Full Details & Size Guide
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
