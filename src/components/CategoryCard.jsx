import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function CategoryCard({ category }) {
  return (
    <Link to={`/category/${category.slug}`} className="category-card-wrapper">
      <div className="category-card-image img-zoom-container">
        <img 
          src={category.image || category.image_url} 
          alt={category.name} 
          className="img-zoom category-img" 
          loading="lazy"
        />
        <div className="category-card-overlay">
          <div className="category-card-info">
            <span className="category-label">Collection</span>
            <h3 className="category-title">{category.name}</h3>
            {category.description && (
              <p className="category-description" style={{ fontSize: '0.8rem', opacity: 0.9, margin: '4px 0 10px 0', lineHeight: 1.3 }}>
                {category.description}
              </p>
            )}
            <span className="category-shop-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
              View Collection <ChevronRight size={14} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
