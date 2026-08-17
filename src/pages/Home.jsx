import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Heart } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import Newsletter from '../components/Newsletter';
import { supabase, mapProduct } from '../lib/supabase';

// Inline SVG Icon for stability
const InstagramIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function Home() {
  const [activeCategories, setActiveCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch categories
        const { data: catData, error: catErr } = await supabase
          .from('categories')
          .select('*')
          .eq('active', true)
          .order('display_order', { ascending: true });

        if (catErr) throw catErr;
        // Supabase schema has image_url, map it to category.image for frontend CategoryCard compatibility
        const mappedCats = (catData || []).map(c => ({
          ...c,
          image: c.image_url
        }));
        setActiveCategories(mappedCats);

        // 2. Fetch featured products
        const { data: featData, error: featErr } = await supabase
          .from('products')
          .select('*, categories(slug, name), product_images(*)')
          .eq('featured', true)
          .neq('availability', 'unavailable')
          .limit(4);

        if (featErr) throw featErr;
        setFeaturedProducts((featData || []).map(mapProduct));

        // 3. Fetch new arrivals
        const { data: newData, error: newErr } = await supabase
          .from('products')
          .select('*, categories(slug, name), product_images(*)')
          .eq('new_arrival', true)
          .neq('availability', 'unavailable')
          .limit(4);

        if (newErr) throw newErr;
        setNewArrivals((newData || []).map(mapProduct));

      } catch (err) {
        console.error('Error fetching storefront home data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Static brand statement
  const brandStatement = "Welcome to Petals Ethnic! Step up your style with our latest fashion collection. We offer premium quality fabrics and trendy designs that fit every occasion. Let us know what you are looking for, and we'll be happy to help you find the best outfit!";

  // 6 Instagram mock feeds using real fashion images
  const instagramMockPhotos = [
    { id: 1, text: "Festive Vibes", image: "https://i.ibb.co/1fFmfKNH/Whats-App-Image-2026-08-13-at-12-31-10-PM-1.jpg" },
    { id: 2, text: "Linen Comforts", image: "https://i.ibb.co/v4qWB2YQ/IMG-20260805-WA0017.jpg" },
    { id: 3, text: "Tissue Silk Zari", image: "https://i.ibb.co/RkKyZV0d/IMG-20260805-WA0011.jpg" },
    { id: 4, text: "Aline Midi Elegance", image: "https://i.ibb.co/XZF0w4jR/Whats-App-Image-2026-08-13-at-12-31-10-PM-2.jpg" },
    { id: 5, text: "Co-ord Sets Daily", image: "https://i.ibb.co/HpfR01b2/Whats-App-Image-2026-08-13-at-12-31-11-PM-1.jpg" },
    { id: 6, text: "Summer Drapes", image: "https://i.ibb.co/xt96ws2F/Whats-App-Image-2026-08-13-at-12-30-50-PM.jpg" }
  ];

  if (loading) {
    return (
      <div className="container text-center" style={{ padding: '120px 20px' }}>
        <div className="loading-spinner" style={{ border: '3px solid var(--color-primary-light)', borderTop: '3px solid var(--color-rose)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
        <p style={{ color: 'var(--color-neutral-muted)', fontSize: '0.9rem' }}>Curating Collections...</p>
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
    <div className="homepage-wrapper">
      {/* 1. Hero Carousel */}
      <HeroCarousel />

      {/* 2. Small Promotional/Trust Strip */}
      <section className="trust-strip-section">
        <div className="container trust-strip-grid">
          <div className="trust-item">
            <Truck size={20} className="trust-icon" />
            <div className="trust-text">
              <h4>Free Shipping</h4>
              <p>Across India on orders above ₹1499</p>
            </div>
          </div>
          <div className="trust-item">
            <ShieldCheck size={20} className="trust-icon" />
            <div className="trust-text">
              <h4>Premium Quality</h4>
              <p>Hand-picked boutique-grade fabrics</p>
            </div>
          </div>
          <div className="trust-item">
            <RotateCcw size={20} className="trust-icon" />
            <div className="trust-text">
              <h4>Easy Exchanges</h4>
              <p>Hassle-free sizing exchanges in 7 days</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Shop by Category Section */}
      {activeCategories.length > 0 && (
        <section className="home-section category-section bg-neutral">
          <div className="container">
            <SectionHeading 
              title="Shop by Category" 
              subtitle="Curated Collections" 
            />
            <div className="category-grid grid-3">
              {activeCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="home-section featured-products-section">
          <div className="container">
            <SectionHeading 
              title="Boutique Favorites" 
              subtitle="Featured Outfits" 
            />
            <div className="products-grid grid-4 animate-slide-up">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="section-cta-container">
              <Link to="/shop" className="btn btn-outline">
                View All Products
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 5. Brand Statement Spotlight */}
      <section className="home-section brand-spotlight-section bg-neutral">
        <div className="container brand-spotlight-grid">
          <div className="spotlight-img-frame">
            <img 
              src="https://i.ibb.co/27MzMz7X/image.png" 
              alt="Petals Ethnic Boutique Highlight" 
              className="spotlight-img"
            />
          </div>
          <div className="spotlight-text-content">
            <span className="spotlight-label">Since 2026</span>
            <h2 className="spotlight-title">Our Heritage Story</h2>
            <p className="spotlight-desc">{brandStatement}</p>
            <Link to="/about" className="btn btn-primary">
              Read Our Full Story
            </Link>
          </div>
        </div>
      </section>

      {/* 6. New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section className="home-section new-arrivals-section">
          <div className="container">
            <SectionHeading 
              title="Just Landed" 
              subtitle="New Arrivals" 
            />
            <div className="products-grid grid-4 animate-slide-up">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="section-cta-container">
              <Link to="/shop" className="btn btn-outline">
                Discover More
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 7. Instagram Editorial Gallery */}
      <section className="home-section instagram-gallery-section bg-neutral">
        <div className="container">
          <div className="insta-header text-center">
            <span className="insta-sub">Follow Us On Instagram</span>
            <h3>@PetalsEthnic</h3>
          </div>
          
          <div className="insta-grid">
            {instagramMockPhotos.map((photo) => (
              <div key={photo.id} className="insta-card">
                <img src={photo.image} alt={photo.text} className="insta-img" />
                <div className="insta-overlay">
                  <InstagramIcon size={24} className="insta-icon-svg" />
                  <span>{photo.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Newsletter Subscription */}
      <Newsletter />
    </div>
  );
}
