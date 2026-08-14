import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import { categories } from '../data/categories';

// Custom inline SVG icons for brand stability
const InstagramIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

export default function Footer() {
  const logoUrl = "https://i.ibb.co/bgSp68jM/Whats-App-Image-2026-08-13-at-10-59-05-AM.jpg";

  return (
    <footer className="footer-wrapper">
      <div className="container footer-grid">
        {/* Brand Info */}
        <div className="footer-col brand-col">
          <div className="footer-logo-container">
            <img src={logoUrl} alt="Petals Ethnic Logo" className="footer-logo" />
            <span className="footer-brand-name">Petals Ethnic</span>
          </div>
          <p className="footer-desc">
            Indulge in premium quality fabrics, hand-crafted silhouettes, and elegant ethnic fashion designed for the modern woman. Perfect fits for every special occasion.
          </p>
          <div className="footer-socials">
            <a 
              href="https://www.instagram.com/petalsethnic" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Instagram"
              className="social-icon"
            >
              <InstagramIcon size={20} />
            </a>
            <a 
              href="https://www.facebook.com/share/1CZHBSGW22/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Facebook"
              className="social-icon"
            >
              <FacebookIcon size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col links-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links-list">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop All Collections</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/wishlist">My Wishlist</Link></li>
          </ul>
        </div>

        {/* Categories (Loaded dynamically!) */}
        <div className="footer-col categories-col">
          <h4 className="footer-heading">Collections</h4>
          <ul className="footer-links-list">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link to={`/category/${cat.slug}`}>{cat.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-col contact-col">
          <h4 className="footer-heading">Reach Us</h4>
          <ul className="footer-contact-list">
            <li>
              <a href="mailto:petalsethnic@gmail.com" className="contact-link">
                <Mail size={16} /> petalsethnic@gmail.com
              </a>
            </li>
            <li>
              <a href="tel:+918113899319" className="contact-link">
                <Phone size={16} /> +91 81138 99319
              </a>
            </li>
            <li className="footer-address">
              <span className="address-label">Petals Ethnic Boutique</span>
              <p>Kerala, India</p>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-flex">
          <p className="copyright-text">
            © {new Date().getFullYear()} Petals Ethnic. All Rights Reserved.
          </p>
          <p className="credit-text">
            Elegant Ethnic Fashion Crafted with Love.
          </p>
        </div>
      </div>
    </footer>
  );
}
