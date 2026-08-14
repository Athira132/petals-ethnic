import React, { useState } from 'react';
import { Mail, Check } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="newsletter-section">
      <div className="container newsletter-card animate-slide-up">
        {subscribed ? (
          <div className="newsletter-success">
            <div className="success-icon-circle">
              <Check size={28} />
            </div>
            <h3>You're on the list!</h3>
            <p>Thank you for subscribing. We will keep you updated with our latest designer collections and exclusive boutique offers.</p>
          </div>
        ) : (
          <div className="newsletter-form-container">
            <span className="newsletter-pre">Boutique Updates</span>
            <h2>Join the Petals Sisterhood</h2>
            <p>Subscribe to receive early access to new arrivals, styling guides, and exclusive collection launches.</p>
            
            <form onSubmit={handleSubmit} className="newsletter-form">
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary newsletter-btn">
                Subscribe
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
