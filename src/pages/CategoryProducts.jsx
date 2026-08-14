import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { categories } from '../data/categories';
import { products } from '../data/products';

export default function CategoryProducts() {
  const { slug } = useParams();
  const [sortOption, setSortOption] = useState('default');

  // Find current category
  const category = categories.find((cat) => cat.slug === slug && cat.isActive);

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

  // Filter products by category
  const categoryProducts = products.filter(
    (product) => product.categorySlug === slug && product.isActive
  );

  // Sort products
  const sortedProducts = [...categoryProducts].sort((a, b) => {
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
    return 0;
  });

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
