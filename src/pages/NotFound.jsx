import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="notfound-page-wrapper text-center animate-fade-in" style={{ padding: '120px 20px 150px' }}>
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div 
          className="notfound-icon-box" 
          style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'var(--color-primary-light)', 
            color: 'var(--color-primary-dark)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 30px' 
          }}
        >
          <HelpCircle size={40} strokeWidth={1.5} />
        </div>
        
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '4rem', color: 'var(--color-neutral-dark)', marginBottom: '15px' }}>
          404
        </h1>
        
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-neutral-dark)', marginBottom: '20px' }}>
          Outfit Not Found
        </h2>
        
        <p style={{ color: 'var(--color-neutral-muted)', lineHeight: '1.8', marginBottom: '40px' }}>
          We couldn't find the page or outfit you are looking for. It might have been moved, renamed, or is temporarily out of stock in our boutique database.
        </p>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">
            Go to Homepage
          </Link>
          <Link to="/shop" className="btn btn-outline">
            Browse All Outfits
          </Link>
        </div>
      </div>
    </div>
  );
}
