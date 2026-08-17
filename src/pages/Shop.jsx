import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { supabase, mapProduct } from '../lib/supabase';

export default function Shop() {
  const location = useLocation();
  
  // State variables for dynamic data
  const [dbCategories, setDbCategories] = useState([]);
  const [dbProducts, setDbProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('default');
  const [loading, setLoading] = useState(true);

  // Check URL query parameters on load (e.g. ?category=normal-kurti)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    
    if (catParam) {
      setSelectedCategory(catParam);
    } else {
      setSelectedCategory('all');
    }
  }, [location.search]);

  // Fetch categories and products on mount
  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);

        // Fetch active categories
        const { data: catData, error: catErr } = await supabase
          .from('categories')
          .select('*')
          .eq('active', true)
          .order('display_order', { ascending: true });
        
        if (catErr) throw catErr;
        setDbCategories(catData || []);

        // Fetch products with their category slug join
        const { data: prodData, error: prodErr } = await supabase
          .from('products')
          .select('*, categories(slug, name), product_images(*)')
          .neq('availability', 'unavailable');

        if (prodErr) throw prodErr;
        setDbProducts((prodData || []).map(mapProduct));

      } catch (err) {
        console.error('Error fetching shop details:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, []);

  // Filter products logic
  const filteredProducts = dbProducts.filter((product) => {
    // Category filter
    if (selectedCategory !== 'all' && product.categorySlug !== selectedCategory) {
      return false;
    }
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

  if (loading) {
    return (
      <div className="container text-center" style={{ padding: '120px 20px' }}>
        <div className="loading-spinner" style={{ border: '3px solid var(--color-primary-light)', borderTop: '3px solid var(--color-rose)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
        <p style={{ color: 'var(--color-neutral-muted)', fontSize: '0.9rem' }}>Loading Signature Outfits...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="shop-page-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>Discover Your Signature Style</h1>
          <div className="breadcrumbs">
            <Link to="/">Home</Link> <span>/</span> <span className="active-breadcrumb">Shop</span>
          </div>
        </div>
      </div>

      <div className="container shop-main-layout">
        {/* SHOP CONTENT AREA - SPANS FULL WIDTH */}
        <main className="shop-content-area" style={{ width: '100%' }}>
          
          {/* Top Filter and Sort Controls */}
          <div className="shop-toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid var(--color-border)' }}>
            <div className="toolbar-left" style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="collection-filter-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="sort-label" style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Collection:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="card-select-dropdown"
                  style={{ minWidth: '220px', height: '36px', fontSize: '0.8rem' }}
                >
                  <option value="all">All Collections</option>
                  {dbCategories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="toolbar-right">
              {/* Sort Selector */}
              <div className="sort-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="sort-label" style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Sort by:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="card-select-dropdown"
                  style={{ minWidth: '160px', height: '36px', fontSize: '0.8rem' }}
                >
                  <option value="default">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-asc">Name: A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid - Spacious 4 Columns */}
          {sortedProducts.length === 0 ? (
            <div className="shop-empty-state text-center" style={{ padding: '60px 20px' }}>
              <h3>No Outfits Found</h3>
              <p>Try selecting another collection.</p>
            </div>
          ) : (
            <div className="products-grid grid-4">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
