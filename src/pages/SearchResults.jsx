import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

export default function SearchResults() {
  const location = useLocation();

  // Helper to parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const q = queryParams.get('q') || '';

  // Filter products matching search term in name, description, or category
  const matchingProducts = products.filter((p) => {
    if (!q) return false;
    const query = q.toLowerCase();
    const nameMatch = p.name.toLowerCase().includes(query);
    const descMatch = p.description.toLowerCase().includes(query);
    const catMatch = p.categorySlug.toLowerCase().includes(query);
    return (nameMatch || descMatch || catMatch) && p.isActive;
  });

  return (
    <div className="search-results-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>Search Results</h1>
          <p className="search-query-desc">
            Showing matches for: <strong>"{q}"</strong>
          </p>
          <div className="breadcrumbs">
            <Link to="/">Home</Link> <span>/</span> <span className="active-breadcrumb">Search</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '80px' }}>
        {matchingProducts.length === 0 ? (
          <div className="search-empty-state text-center" style={{ padding: '60px 20px' }}>
            <Search size={64} strokeWidth={1} style={{ color: 'var(--color-primary-dark)', marginBottom: '20px' }} />
            <h2>No Outfits Matched Your Search</h2>
            <p style={{ maxWidth: '500px', margin: '15px auto 30px', color: 'var(--color-neutral-muted)' }}>
              We couldn't find any designs matching "{q}". Try checking spelling, using more general keywords like "Kurti" or "Silk", or explore our new collections.
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <Link to="/shop" className="btn btn-primary">
                Shop Collections
              </Link>
              <Link to="/" className="btn btn-outline">
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <p className="results-count-summary" style={{ marginBottom: '30px', fontSize: '1.1rem' }}>
              We found <strong>{matchingProducts.length}</strong> beautiful matching outfit{matchingProducts.length === 1 ? '' : 's'} for you:
            </p>
            <div className="products-grid grid-4 animate-slide-up">
              {matchingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
