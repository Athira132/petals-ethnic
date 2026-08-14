import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, X, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes ? product.sizes[0] : 'M');
  const [selectedColor, setSelectedColor] = useState(product.colors ? product.colors[0] : '');
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  const favorited = isInWishlist(product.id);
  const onSale = product.salePrice !== null && product.salePrice !== undefined;
  const isOutOfStock = product.stockCount === 0;

  // Calculate discount percentage
  const discountPercent = onSale 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleDirectAddToCart = (e) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart(product, 1, selectedSize, selectedColor);
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
        <div className="product-card-media img-zoom-container">
          {/* Link wraps the image */}
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

          {/* Quick Action Icons overlay on Hover */}
          <div className="product-card-actions">
            <button 
              className="card-action-btn" 
              onClick={() => setIsQuickViewOpen(true)}
              title="Quick View"
              aria-label="Quick view product"
            >
              <Eye size={18} />
            </button>
            <button 
              className={`card-action-btn ${favorited ? 'favorited' : ''}`} 
              onClick={() => toggleWishlist(product)}
              title={favorited ? "Remove from Wishlist" : "Add to Wishlist"}
              aria-label="Toggle wishlist"
            >
              <Heart size={18} fill={favorited ? "var(--color-primary-dark)" : "none"} />
            </button>
          </div>

          {/* Direct Add to Cart Button */}
          {!isOutOfStock && (
            <button 
              className={`card-add-to-cart-btn ${addedMessage ? 'success' : ''}`}
              onClick={handleDirectAddToCart}
              disabled={isOutOfStock}
            >
              {addedMessage ? (
                <>
                  <Check size={16} /> Added
                </>
              ) : (
                <>
                  <ShoppingBag size={16} /> Add to Cart
                </>
              )}
            </button>
          )}
        </div>

        {/* Product Details Info */}
        <div className="product-card-info">
          <span className="product-card-category">{product.categorySlug.replace(/-/g, ' ')}</span>
          <h3 className="product-card-title">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
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
              {/* Product Gallery */}
              <div className="quickview-gallery">
                <img src={product.images[0]} alt={product.name} className="quickview-main-img" />
              </div>

              {/* Product Details Form */}
              <div className="quickview-details">
                <span className="quickview-category">{product.categorySlug.replace(/-/g, ' ')}</span>
                <h2 className="quickview-title">{product.name}</h2>
                
                {/* Price block */}
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

                {/* Sizing selection */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="quickview-option-group">
                    <span className="option-label">Select Size</span>
                    <div className="option-selectors">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color selection */}
                {product.colors && product.colors.length > 0 && (
                  <div className="quickview-option-group">
                    <span className="option-label">Color: {selectedColor}</span>
                    <div className="option-selectors">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          className={`color-btn ${selectedColor === color ? 'selected' : ''}`}
                          onClick={() => setSelectedColor(color)}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity & Cart Action */}
                <div className="quickview-purchase-actions">
                  <div className="qty-selector-container">
                    <button 
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                    >
                      -
                    </button>
                    <span>{quantity}</span>
                    <button 
                      onClick={() => {
                        const maxVal = product.stockCount !== undefined ? product.stockCount : 99;
                        setQuantity(prev => Math.min(maxVal, prev + 1));
                      }}
                      disabled={isOutOfStock}
                    >
                      +
                    </button>
                  </div>

                  <button 
                    className="btn btn-primary quickview-add-btn"
                    onClick={handleQuickViewAddToCart}
                    disabled={isOutOfStock}
                  >
                    {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                  </button>
                </div>

                {/* Stock status indicator */}
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
