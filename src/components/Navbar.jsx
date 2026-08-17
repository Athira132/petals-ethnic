import React, { useState, useEffect } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, X, ChevronDown, ChevronRight, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { categories as fallbackCategories } from '../data/categories';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { cartCount, cartItems, cartSubtotal, updateQuantity, removeFromCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { user } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  // Fetch active categories from Supabase on mount
  useEffect(() => {
    const fetchNavCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('active', true)
          .order('display_order', { ascending: true });
        
        if (error) throw error;
        if (data && data.length > 0) {
          setCategories(data);
        } else {
          setCategories(fallbackCategories);
        }
      } catch (err) {
        console.warn('Navbar categories load warning (falling back to static category list):', err.message);
        setCategories(fallbackCategories);
      }
    };

    fetchNavCategories();
  }, []);

  // Check scroll position to make navbar sticky with background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const logoUrl = "https://i.ibb.co/YFSVjCPP/Whats-App-Image-2026-08-13-at-10-59-05-AM.jpg";

  return (
    <>
      {/* Sticky Premium Navbar */}
      <header className={`navbar-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container container">
          {/* Mobile Hamburguer */}
          <button 
            className="mobile-nav-toggle" 
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open mobile menu"
          >
            <Menu size={24} />
          </button>

          {/* Brand Logo */}
          <Link to="/" className="navbar-logo-container">
            <img src={logoUrl} alt="Petals Ethnic Logo" className="navbar-logo" />
            <span className="navbar-logo-text">Petals Ethnic</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav">
            <ul className="nav-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Shop</Link></li>
              <li className="dropdown-li">
                <span className="nav-dropdown-trigger">
                  Categories <ChevronDown size={14} className="chevron-down-icon" />
                </span>
                <ul className="dropdown-menu">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link to={`/category/${cat.slug}`}>{cat.name}</Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </nav>

          {/* Action Icons */}
          <div className="navbar-actions">
            <button 
              className="action-icon-btn" 
              onClick={() => setIsSearchOpen(true)}
              aria-label="Open search bar"
            >
              <Search size={22} />
            </button>

            {/* Account Icon Shortcut */}
            <Link 
              to="/account" 
              className="action-icon-btn" 
              aria-label="Account Settings"
              title={user ? "My Account Dashboard" : "Sign In / Register"}
              style={{ color: user ? 'var(--color-rose)' : 'inherit' }}
            >
              <User size={22} />
            </Link>

            <Link to="/wishlist" className="action-icon-btn wishlist-icon-link" aria-label="View Wishlist">
              <Heart size={22} />
              {wishlistCount > 0 && <span className="action-badge">{wishlistCount}</span>}
            </Link>

            <button 
              className="action-icon-btn" 
              onClick={() => setIsCartDrawerOpen(true)}
              aria-label="Open shopping cart"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && <span className="action-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* 1. SEARCH OVERLAY */}
      {isSearchOpen && (
        <div className="search-overlay-container animate-fade-in">
          <button className="search-overlay-close" onClick={() => setIsSearchOpen(false)}>
            <X size={28} />
          </button>
          <div className="search-overlay-content">
            <form onSubmit={handleSearchSubmit} className="search-overlay-form">
              <input
                type="text"
                placeholder="Search premium ethnic outfits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-overlay-input"
                autoFocus
              />
              <button type="submit" className="search-overlay-btn" aria-label="Submit search">
                <Search size={24} />
              </button>
            </form>
            <p className="search-quick-links">
              Try searching: <span onClick={() => { setSearchQuery('Kurti'); navigate('/search?q=Kurti'); setIsSearchOpen(false); }}>Kurti</span>,{' '}
              <span onClick={() => { setSearchQuery('Anarkali'); navigate('/search?q=Anarkali'); setIsSearchOpen(false); }}>Anarkali</span>,{' '}
              <span onClick={() => { setSearchQuery('Codeset'); navigate('/search?q=Codeset'); setIsSearchOpen(false); }}>Codeset</span>
            </p>
          </div>
        </div>
      )}

      {/* 2. CART SLIDE-OUT DRAWER */}
      <div className={`cart-drawer-wrapper ${isCartDrawerOpen ? 'open' : ''}`}>
        <div className="cart-drawer-backdrop" onClick={() => setIsCartDrawerOpen(false)}></div>
        <div className="cart-drawer-panel">
          <div className="cart-drawer-header">
            <h3>Your Cart ({cartCount})</h3>
            <button className="cart-drawer-close" onClick={() => setIsCartDrawerOpen(false)} aria-label="Close cart drawer">
              <X size={24} />
            </button>
          </div>

          <div className="cart-drawer-items">
            {cartItems.length === 0 ? (
              <div className="cart-drawer-empty">
                <ShoppingBag size={48} strokeWidth={1} />
                <p>Your cart is empty</p>
                <Link to="/shop" className="btn btn-primary" onClick={() => setIsCartDrawerOpen(false)}>
                  Shop Collection
                </Link>
              </div>
            ) : (
              cartItems.map((item, idx) => {
                const activePrice = item.product.salePrice || item.product.price;
                return (
                  <div key={`${item.product.id}-${item.size}-${item.color}`} className="cart-drawer-item">
                    <img src={item.product.images[0]} alt={item.product.name} className="cart-drawer-item-img" />
                    <div className="cart-drawer-item-details">
                      <Link to={`/product/${item.product.id}`} className="cart-drawer-item-name" onClick={() => setIsCartDrawerOpen(false)}>
                        {item.product.name}
                      </Link>
                      <p className="cart-drawer-item-meta">
                        Size: {item.size} {item.color ? `| Color: ${item.color}` : ''}
                      </p>
                      <div className="cart-drawer-item-actions">
                        <div className="qty-controls">
                          <button onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}>+</button>
                        </div>
                        <span className="cart-drawer-item-price">₹{activePrice * item.quantity}</span>
                      </div>
                    </div>
                    <button 
                      className="cart-drawer-item-remove" 
                      onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                      aria-label="Remove item"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="cart-drawer-footer">
              <div className="cart-drawer-summary">
                <span>Subtotal</span>
                <span>₹{cartSubtotal}</span>
              </div>
              <p className="cart-drawer-tax-info">Shipping and taxes calculated at checkout.</p>
              <div className="cart-drawer-buttons">
                <Link 
                  to="/cart" 
                  className="btn btn-outline" 
                  style={{ width: '100%' }}
                  onClick={() => setIsCartDrawerOpen(false)}
                >
                  View Cart
                </Link>
                <Link 
                  to="/cart" 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  onClick={() => setIsCartDrawerOpen(false)}
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. MOBILE SLIDE-OUT MENU */}
      <div className={`mobile-menu-wrapper ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-backdrop" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="mobile-menu-panel">
          <div className="mobile-menu-header">
            <img src={logoUrl} alt="Petals Ethnic Logo" className="mobile-menu-logo" />
            <button className="mobile-menu-close" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
              <X size={24} />
            </button>
          </div>

          <div className="mobile-menu-nav">
            <ul className="mobile-nav-links">
              <li>
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              </li>
              <li>
                <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
              </li>
              <li>
                <div 
                  className="mobile-accordion-trigger" 
                  onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                >
                  <span>Categories</span>
                  <ChevronRight size={18} className={`accordion-arrow ${isMobileCategoriesOpen ? 'rotate-90' : ''}`} />
                </div>
                {isMobileCategoriesOpen && (
                  <ul className="mobile-submenu-links">
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <Link to={`/category/${cat.slug}`} onClick={() => setIsMobileMenuOpen(false)}>
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
              <li>
                <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
              </li>
              <li>
                <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
              </li>
              <li>
                <Link to="/account" onClick={() => setIsMobileMenuOpen(false)}>My Account</Link>
              </li>
              <li>
                <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)}>Wishlist ({wishlistCount})</Link>
              </li>
              <li>
                <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)}>Shopping Cart ({cartCount})</Link>
              </li>
            </ul>
          </div>

          <div className="mobile-menu-footer">
            <p>Need help finding an outfit?</p>
            <a href="https://wa.me/918113899319" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              WhatsApp Support
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
