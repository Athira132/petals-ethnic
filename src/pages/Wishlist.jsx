import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { wishlistItems, clearWishlist } = useWishlist();

  return (
    <div className="wishlist-page-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>My Wishlist</h1>
          <div className="breadcrumbs">
            <Link to="/">Home</Link> <span>/</span> <span className="active-breadcrumb">Wishlist</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '80px' }}>
        {wishlistItems.length === 0 ? (
          <div className="wishlist-empty-state text-center animate-slide-up" style={{ padding: '60px 20px' }}>
            <Heart size={64} strokeWidth={1} style={{ color: 'var(--color-primary-dark)', marginBottom: '20px' }} />
            <h2>Your Wishlist is Empty</h2>
            <p style={{ maxWidth: '400px', margin: '15px auto 25px', color: 'var(--color-neutral-muted)' }}>
              Save your favorite ethnic outfits here to inspect them later, share with friends, or add to your shopping cart.
            </p>
            <Link to="/shop" className="btn btn-primary">
              Discover Outfits
            </Link>
          </div>
        ) : (
          <div className="animate-slide-up">
            <div className="wishlist-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <p>You have saved <strong>{wishlistItems.length}</strong> designer outfit{wishlistItems.length === 1 ? '' : 's'}.</p>
              <button 
                onClick={clearWishlist} 
                className="btn btn-outline"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}
              >
                Clear All Items
              </button>
            </div>

            {/* Reuse ProductCard for consistent styling, badges, and quick-view actions */}
            <div className="products-grid grid-4">
              {wishlistItems.map((product) => (
                <div key={product.id} className="wishlist-item-container" style={{ position: 'relative' }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
