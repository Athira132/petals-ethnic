import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Send, MessageSquare, Check } from 'lucide-react';

// Custom Instagram SVG for stability
const InstagramIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function Contact() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      setFormSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }
  };

  const whatsappUrl = "https://wa.me/918113899319?text=Hello%20Petals%20Ethnic!%20I'd%20like%20to%20inquire%20about%20your%20collections.";

  return (
    <div className="contact-page-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>Contact Us</h1>
          <div className="breadcrumbs">
            <Link to="/">Home</Link> <span>/</span> <span className="active-breadcrumb">Contact</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="container contact-grid" style={{ paddingBottom: '80px', display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '50px' }}>
        {/* Left: Contact Info Channels */}
        <div className="contact-info-column animate-slide-up">
          <span className="contact-pre" style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem', color: 'var(--color-gold)', display: 'block', marginBottom: '10px' }}>
            Get in touch
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '20px' }}>We'd love to help you</h2>
          <p style={{ color: 'var(--color-neutral-muted)', marginBottom: '40px' }}>
            Have questions about custom sizing, shipping times, or fabric details? Let us know what you are looking for, and we'll be happy to help you find the best outfit!
          </p>

          {/* Contact Details List */}
          <div className="contact-channels-list" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* WhatsApp CTA */}
            <div className="contact-channel-item" style={{ display: 'flex', gap: '20px' }}>
              <div className="contact-icon-box" style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-dark)' }}>
                <MessageSquare size={20} />
              </div>
              <div>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginBottom: '5px' }}>WhatsApp & Chat</h4>
                <p style={{ color: 'var(--color-neutral-muted)', fontSize: '0.95rem', marginBottom: '8px' }}>Chat with our stylists directly for instant outfit assistance.</p>
                <a 
                  href={whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem', textTransform: 'none', letterSpacing: '0.5px' }}
                >
                  Message +91 81138 99319
                </a>
              </div>
            </div>

            {/* Email Channel */}
            <div className="contact-channel-item" style={{ display: 'flex', gap: '20px' }}>
              <div className="contact-icon-box" style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-dark)' }}>
                <Mail size={20} />
              </div>
              <div>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginBottom: '5px' }}>Email Support</h4>
                <p style={{ color: 'var(--color-neutral-muted)', fontSize: '0.95rem', marginBottom: '5px' }}>Drop us a line and we'll reply within 24 hours.</p>
                <a href="mailto:petalsethnic@gmail.com" style={{ fontWeight: '500', color: 'var(--color-neutral-dark)', borderBottom: '1px solid var(--color-neutral-dark)' }}>
                  petalsethnic@gmail.com
                </a>
              </div>
            </div>

            {/* Social Medias */}
            <div className="contact-channel-item" style={{ display: 'flex', gap: '20px' }}>
              <div className="contact-icon-box" style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-dark)' }}>
                <InstagramIcon size={20} />
              </div>
              <div>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginBottom: '5px' }}>Follow Our Journey</h4>
                <p style={{ color: 'var(--color-neutral-muted)', fontSize: '0.95rem', marginBottom: '8px' }}>Follow us on Facebook and Instagram for styling reels and giveaways.</p>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <a href="https://www.instagram.com/petalsethnic" target="_blank" rel="noopener noreferrer" className="btn-text" style={{ fontSize: '0.9rem', textTransform: 'none' }}>
                    Instagram
                  </a>
                  <a href="https://www.facebook.com/share/1CZHBSGW22/" target="_blank" rel="noopener noreferrer" className="btn-text" style={{ fontSize: '0.9rem', textTransform: 'none' }}>
                    Facebook
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form Panel */}
        <div className="contact-form-column animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div style={{ background: '#fff', padding: '40px', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', boxShadow: '0 8px 30px var(--color-card-shadow)' }}>
            {formSubmitted ? (
              <div className="form-success text-center" style={{ padding: '30px 10px' }}>
                <div className="success-icon-circle" style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Check size={28} />
                </div>
                <h3>Message Sent Successfully!</h3>
                <p style={{ color: 'var(--color-neutral-muted)', marginTop: '10px' }}>
                  Thank you for writing to Petals Ethnic. Our customer assistant will review your query and get in touch with you shortly.
                </p>
                <button onClick={() => setFormSubmitted(false)} className="btn btn-outline" style={{ marginTop: '20px' }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '20px' }}>Send Us A Message</h3>
                
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g. Sizing query, shipping help"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message / Inquiry</label>
                  <textarea
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="form-input"
                    style={{ resize: 'vertical', minHeight: '120px' }}
                    placeholder="Describe what you are looking for..."
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  Submit Inquiry <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      
      {/* Responsive adjustments (handled in index.css, adding fallbacks for direct columns) */}
      <style>{`
        @media (max-width: 900px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </div>
  );
}
