import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Heart } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import Newsletter from '../components/Newsletter';
import { categories } from '../data/categories';
import { products } from '../data/products';

// Inline SVG Icon for stability
const InstagramIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function Home() {
  // Get active categories (limit to 6 for layout, or all if we have 6)
  const activeCategories = categories.filter(c => c.isActive);

  // Get featured products (limit to 4)
  const featuredProducts = products.filter(p => p.isFeatured && p.isActive).slice(0, 4);

  // Get new arrival products (limit to 4)
  const newArrivals = products.filter(p => p.isNewArrival && p.isActive).slice(0, 4);

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

      {/* 4. Featured Products Section */}
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

      {/* 5. Promotional Fashion Banner */}
      <section className="promo-banner-section">
        <div className="promo-banner-overlay"></div>
        <div className="container promo-banner-content text-center">
          <span className="promo-tag text-uppercase">Boutique Spotlight</span>
          <h2 className="promo-heading">Petals Ethnic Collection</h2>
          <p className="promo-desc">
            Experience the elegant grace of our premium handcrafted ethnic wear, designed to blend timeless tradition with contemporary comfort.
          </p>
          <Link to="/shop" className="btn btn-secondary">
            Explore Collection
          </Link>
        </div>
      </section>

      {/* 6. New Arrivals Section */}
      <section className="home-section new-arrivals-section bg-neutral">
        <div className="container">
          <SectionHeading 
            title="Fresh Off The Loom" 
            subtitle="New Arrivals" 
          />
          <div className="products-grid grid-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="section-cta-container">
            <Link to="/shop?filter=new" className="btn btn-outline">
              Shop New Additions
            </Link>
          </div>
        </div>
      </section>

      {/* 7. About Petals Ethnic Section */}
      <section className="home-section home-about-section">
        <div className="container grid-2 align-center">
          {/* Text content */}
          <div className="about-text-content">
            <span className="about-subtitle text-uppercase">Our Brand Story</span>
            <h2 className="about-heading">About Petals Ethnic</h2>
            <div className="about-heading-line"></div>
            <p className="about-desc">{brandStatement}</p>
            <div className="about-bullet-points">
              <div className="bullet-point">
                <strong>01.</strong>
                <span>Artisan-designed silhouettes</span>
              </div>
              <div className="bullet-point">
                <strong>02.</strong>
                <span>Comfortable & premium fabrics</span>
              </div>
              <div className="bullet-point">
                <strong>03.</strong>
                <span>Tailored sizes for the perfect fit</span>
              </div>
            </div>
            <Link to="/about" className="btn btn-primary">
              Read Our Story
            </Link>
          </div>

          {/* Graphical placeholder */}
          <div className="about-image-showcase">
            <div className="about-img-box img-1 bg-primary-light">
              <div className="about-box-content">
                <h3>Soft blush hues & traditional drapes.</h3>
                <span>Established 2026</span>
              </div>
            </div>
            <div className="about-img-box img-2">
              {/* Inner card representing premium fashion */}
              <div className="about-card-badge">PETALS ORIGINAL</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Instagram/Social Section */}
      <section className="home-section instagram-feed-section bg-neutral">
        <div className="container">
          <div className="insta-header text-center">
            <InstagramIcon size={28} className="insta-icon" />
            <h2 className="section-title">Follow Us on Instagram</h2>
            <p className="section-desc">
              Join our growing sisterhood! Share your outfits with us using <strong>#PetalsEthnic</strong>
            </p>
            <a 
              href="https://www.instagram.com/petalsethnic" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="insta-profile-link btn-text"
            >
              @petalsethnic
            </a>
          </div>

          <div className="insta-photo-grid">
            {instagramMockPhotos.map((photo) => (
              <div key={photo.id} className="insta-grid-item img-zoom-container">
                {/* Clean placeholder block with Instagram icon on hover */}
                <img 
                  src={photo.image} 
                  alt={photo.text} 
                  className="insta-img" 
                />
                <div className="insta-hover-overlay">
                  <div className="insta-overlay-icons">
                    <Heart size={20} fill="#fff" />
                    <span>Live Styling</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Newsletter Section */}
      <Newsletter />
    </div>
  );
}
