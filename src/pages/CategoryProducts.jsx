import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { supabase, mapProduct } from '../lib/supabase';

export default function CategoryProducts() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [sortedProducts, setSortedProducts] = useState([]);
  const [rawProducts, setRawProducts] = useState([]);
  const [sortOption, setSortOption] = useState('default');
  const [loading, setLoading] = useState(true);

  // Fetch Category details and Products on mount or slug change
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        
        // Find current category
        const { data: catData, error: catErr } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', slug)
          .eq('active', true)
          .single();

        if (catErr || !catData) {
          setCategory(null);
          setLoading(false);
          return;
        }

        // Map description and cover image matching frontend CategoryCard expectations
        setCategory({
          ...catData,
          image: catData.image_url
        });

        // Filter active products by category
        const { data: prodData, error: prodErr } = await supabase
          .from('products')
          .select('*, categories(slug, name), product_images(*)')
          .eq('category_id', catData.id)
          .neq('availability', 'unavailable');

        if (prodErr) throw prodErr;
        const mappedProducts = (prodData || []).map(mapProduct);
        setRawProducts(mappedProducts);
        setSortedProducts(mappedProducts);

      } catch (err) {
        console.error('Error loading category detail list:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [slug]);

  // Handle local sorting updates when option changes
  useEffect(() => {
    const sorted = [...rawProducts].sort((a, b) => {
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
      return 0; // default featured
    });
    setSortedProducts(sorted);
  }, [sortOption, rawProducts]);

  if (loading) {
    return (
      <div className="container text-center" style={{ padding: '120px 20px' }}>
        <div className="loading-spinner" style={{ border: '3px solid var(--color-primary-light)', borderTop: '3px solid var(--color-rose)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
        <p style={{ color: 'var(--color-neutral-muted)', fontSize: '0.9rem' }}>Loading Collection...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container text-center" style={{ padding: '80px 20px' }}>
        <h2>Category Not Found</h2>
        <p>We couldn't find the collection you are looking for.</p>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="category-page-wrapper">
      {/* Editorial Category Header */}
      <div className="page-header">
        <div className="container">
          <h1>{category.name}</h1>
          <p className="category-header-desc" style={{ maxWidth: '600px', margin: '15px auto 0', color: 'var(--color-neutral-muted)' }}>
            {category.description}
          </p>
          <div className="breadcrumbs" style={{ marginTop: '20px' }}>
            <Link to="/">Home</Link> <span>/</span> <Link to="/shop">Shop</Link> <span>/</span> <span className="active-breadcrumb">{category.name}</span>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Toolbar */}
        <div className="shop-toolbar" style={{ margin: '30px 0' }}>
          <div className="toolbar-left">
            <p className="product-count-text">
              Showing <strong>{sortedProducts.length}</strong> outfits in <em>{category.name}</em>
            </p>
          </div>
          
          <div className="toolbar-right">
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

        {/* Listing Grid */}
        {sortedProducts.length === 0 ? (
          <div className="shop-empty-state text-center" style={{ padding: '60px 20px' }}>
            <h3>Coming Soon!</h3>
            <p>We are currently uploading new designs for the {category.name} collection.</p>
            <Link to="/shop" className="btn btn-primary" style={{ marginTop: '20px' }}>
              Explore Other Outfits
            </Link>
          </div>
        ) : (
          <div className="products-grid grid-4" style={{ marginBottom: '80px' }}>
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
