import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronDown, RefreshCw } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import { products } from '../data/products';
import { categories } from '../data/categories';

export default function Shop() {
  const location = useLocation();
  
  // State variables for filtering and sorting
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('default');
  const [filterSaleOnly, setFilterSaleOnly] = useState(false);
  const [filterNewOnly, setFilterNewOnly] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Check URL query parameters on load (e.g. ?filter=new)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    const catParam = params.get('category');
    
    if (filterParam === 'new') {
      setFilterNewOnly(true);
    } else {
      setFilterNewOnly(false);
    }
    
    if (catParam) {
      setSelectedCategory(catParam);
    } else {
      setSelectedCategory('all');
    }
  }, [location.search]);

  // Handle resets
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSortOption('default');
    setFilterSaleOnly(false);
    setFilterNewOnly(false);
  };

  // Filter products logic
  const filteredProducts = products.filter((product) => {
    // 1. Category filter
    if (selectedCategory !== 'all' && product.categorySlug !== selectedCategory) {
      return false;
    }
    // 2. Sale only filter
    if (filterSaleOnly && (product.salePrice === null || product.salePrice === undefined)) {
      return false;
    }
    // 3. New only filter
    if (filterNewOnly && !product.isNewArrival) {
      return false;
    }
    // 4. Must be active
    return product.isActive;
  });

  // Sort products logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.salePrice || a.price;
    const priceB = b.salePrice || b.price;

    if (sortOption === 'price-low') {
      return priceA - priceB;
    }
    if (sortOption === 'price-high') {
      return priceB - priceA;
    }
    if (sortOption === 'name-asc') {
      return a.name.localeCompare(b.name);
    }
    // Default / Featured
    return 0;
  });

  return (
    <div className="shop-page-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>Shop All Outfits</h1>
          <div className="breadcrumbs">
            <Link to="/">Home</Link> <span>/</span> <span className="active-breadcrumb">Shop</span>
          </div>
        </div>
      </div>

      <div className="container shop-main-layout">
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="shop-sidebar-desktop">
          <div className="sidebar-header">
            <h3>Filters</h3>
            <button onClick={handleResetFilters} className="clear-filters-btn">
              <RefreshCw size={12} /> Reset
            </button>
          </div>

          {/* Categories Filter Block */}
          <div className="filter-group">
            <h4 className="filter-title">Collections</h4>
            <div className="filter-options">
              <button 
                className={`filter-cat-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All Collections
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`filter-cat-btn ${selectedCategory === cat.slug ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.slug)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Status Filter Block */}
          <div className="filter-group">
            <h4 className="filter-title">Filter By</h4>
            <div className="filter-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filterSaleOnly}
                  onChange={(e) => setFilterSaleOnly(e.target.checked)}
                />
                <span>Special Offers / Sale</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filterNewOnly}
                  onChange={(e) => setFilterNewOnly(e.target.checked)}
                />
                <span>New Arrivals</span>
              </label>
            </div>
          </div>
        </aside>

        {/* SHOP CONTENT AREA */}
        <main className="shop-content-area">
          {/* Top toolbar */}
          <div className="shop-toolbar">
            <div className="toolbar-left">
              <p className="product-count-text">
                Showing <strong>{sortedProducts.length}</strong> outfits
              </p>
            </div>
            
            <div className="toolbar-right">
              {/* Mobile Filter Button */}
              <button 
                className="mobile-filter-trigger btn btn-outline"
                onClick={() => setIsMobileFilterOpen(true)}
              >
                <SlidersHorizontal size={16} /> Filters
              </button>

              {/* Sort Selector */}
              <div className="sort-container">
                <span className="sort-label">Sort by:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="sort-select"
                >
                  <option value="default">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-asc">Name: A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {sortedProducts.length === 0 ? (
            <div className="shop-empty-state text-center">
              <SlidersHorizontal size={48} strokeWidth={1} />
              <h3>No Outfits Found</h3>
              <p>Try resetting the filters or check another category.</p>
              <button onClick={handleResetFilters} className="btn btn-primary">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="products-grid grid-3">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MOBILE FILTER MODAL / SLIDE-OUT */}
      <div className={`mobile-filter-wrapper ${isMobileFilterOpen ? 'open' : ''}`}>
        <div className="mobile-filter-backdrop" onClick={() => setIsMobileFilterOpen(false)}></div>
        <div className="mobile-filter-panel">
          <div className="mobile-filter-header">
            <h3>Refine Selection</h3>
            <button className="mobile-filter-close" onClick={() => setIsMobileFilterOpen(false)}>
              ✕
            </button>
          </div>
          
          <div className="mobile-filter-body">
            {/* Categories */}
            <div className="filter-group">
              <h4 className="filter-title">Collections</h4>
              <div className="filter-options">
                <button 
                  className={`filter-cat-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => { setSelectedCategory('all'); setIsMobileFilterOpen(false); }}
                >
                  All Collections
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`filter-cat-btn ${selectedCategory === cat.slug ? 'active' : ''}`}
                    onClick={() => { setSelectedCategory(cat.slug); setIsMobileFilterOpen(false); }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="filter-group">
              <h4 className="filter-title">Filter By</h4>
              <div className="filter-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filterSaleOnly}
                    onChange={(e) => setFilterSaleOnly(e.target.checked)}
                  />
                  <span>On Sale Only</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filterNewOnly}
                    onChange={(e) => setFilterNewOnly(e.target.checked)}
                  />
                  <span>New Arrivals Only</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mobile-filter-footer">
            <button onClick={() => { handleResetFilters(); setIsMobileFilterOpen(false); }} className="btn btn-outline">
              Clear All
            </button>
            <button onClick={() => setIsMobileFilterOpen(false)} className="btn btn-primary">
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


