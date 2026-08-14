import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, ShieldCheck } from 'lucide-react';

export default function About() {
  // Brand description requested
  const aboutText = "Welcome to Petals Ethnic! Step up your style with our latest fashion collection. We offer premium quality fabrics and trendy designs that fit every occasion. Let us know what you are looking for, and we'll be happy to help you find the best outfit!";

  return (
    <div className="about-page-wrapper">
      {/* 1. Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>Our Brand Story</h1>
          <div className="breadcrumbs">
            <Link to="/">Home</Link> <span>/</span> <span className="active-breadcrumb">About Us</span>
          </div>
        </div>
      </div>

      {/* 2. Brand Bio Grid */}
      <section className="about-story-section" style={{ padding: '60px 0' }}>
        <div className="container grid-2 align-center">
          {/* Visual Showcase: 2 stacked premium fashion photos */}
          <div className="about-visuals" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderRadius: 'var(--border-radius-md)', overflow: 'hidden', aspectRatio: '4 / 3', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <img 
                src="https://i.ibb.co/1fFmfKNH/Whats-App-Image-2026-08-13-at-12-31-10-PM-1.jpg" 
                alt="Petals Ethnic drape" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
              />
            </div>
            <div style={{ borderRadius: 'var(--border-radius-md)', overflow: 'hidden', aspectRatio: '4 / 3', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <img 
                src="https://i.ibb.co/27MzMz7X/image.png" 
                alt="Petals Ethnic Anarkali Suit" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="about-story-text animate-slide-up">
            <span className="about-subtitle" style={{ fontSize: '0.85rem', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600', display: 'block', marginBottom: '10px' }}>
              Elegant, Feminine, Premium
            </span>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', fontFamily: 'var(--font-serif)' }}>About Petals Ethnic</h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '20px', color: 'var(--color-neutral-muted)' }}>
              {aboutText}
            </p>
            <p style={{ color: 'var(--color-neutral-muted)', marginBottom: '30px' }}>
              At Petals Ethnic, we believe in celebrating the unique grace of Indian silhouettes. Every piece in our collection—from flowing Aline midi dresses to elegant ethnic outfits and coordinated sets—is curated with the utmost care, ensuring the perfect balance between heritage weaves and contemporary trends.
            </p>
            <Link to="/shop" className="btn btn-primary" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
              Explore Collection
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Boutique Core Pillars */}
      <section className="about-pillars bg-neutral" style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '50px' }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem', color: 'var(--color-gold)' }}>Boutique Standards</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', marginTop: '10px' }}>Why Petals Sisterhood?</h2>
          </div>

          <div className="grid-3">
            {/* Pillar 1 */}
            <div className="pillar-card text-center" style={{ background: '#fff', padding: '40px 30px', borderRadius: 'var(--border-radius-md)', boxShadow: '0 4px 20px var(--color-card-shadow)' }}>
              <div className="pillar-icon-box" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--color-primary-dark)' }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '15px' }}>Trendy Handcrafted Designs</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-neutral-muted)' }}>
                Silhouettes tailored specifically to flatter and drape elegantly. Our designs are continuously updated to incorporate modern fusion cuts.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="pillar-card text-center" style={{ background: '#fff', padding: '40px 30px', borderRadius: 'var(--border-radius-md)', boxShadow: '0 4px 20px var(--color-card-shadow)' }}>
              <div className="pillar-icon-box" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--color-primary-dark)' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '15px' }}>Premium Fabrics Only</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-neutral-muted)' }}>
                From rich cotton modal to premium silk blends, we make no compromises. We source breathable, durable fabrics that feel soft against the skin.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="pillar-card text-center" style={{ background: '#fff', padding: '40px 30px', borderRadius: 'var(--border-radius-md)', boxShadow: '0 4px 20px var(--color-card-shadow)' }}>
              <div className="pillar-icon-box" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--color-primary-dark)' }}>
                <Heart size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '15px' }}>Personalized Boutique Care</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-neutral-muted)' }}>
                Have questions about custom fittings or fabric drapes? Our dedicated support team is available on WhatsApp to guide you through your purchase.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Elegant CTA section */}
      <section className="about-cta-banner" style={{ padding: '100px 0', textTransform: 'center', textAlign: 'center', background: 'var(--color-primary-light)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '20px' }}>Drape Yourself in Elegance</h2>
          <p style={{ color: 'var(--color-neutral-muted)', marginBottom: '30px', fontSize: '1.1rem' }}>
            Find the perfect look for your next festival, brunch, or wedding celebration. Free shipping on all orders above ₹1499.
          </p>
          <Link to="/shop" className="btn btn-primary" style={{ padding: '1rem 3rem' }}>
            Shop The Collection
          </Link>
        </div>
      </section>
    </div>
  );
}
