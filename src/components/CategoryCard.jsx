import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function CategoryCard({ category }) {
  return (
    <Link to={`/category/${category.slug}`} className="category-card-wrapper">
      <div className="category-card-image img-zoom-container">
        <img 
          src={category.image} 
          alt={category.name} 
          className="img-zoom category-img" 
          loading="lazy"
        />
        <div className="category-card-overlay">
          <div className="category-card-info">
            <span className="category-label">Collection</span>
            <h3 className="category-title">{category.name}</h3>
            <span className="category-shop-link">
              Shop Collection <ChevronRight size={16} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
