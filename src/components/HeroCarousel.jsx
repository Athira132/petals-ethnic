import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function HeroCarousel() {
  // Start from a different slide: index 2 (Tissue Silk Kasavu Saree banner)
  const [currentSlide, setCurrentSlide] = useState(2);
  const autoPlayRef = useRef();

  const slides = [
    {
      id: 1,
      image: "https://i.ibb.co/nTMWnkp/Gemini-Generated-Image-39gh9039gh9039gh.png",
      title: "Style That Defines You",
      subtitle: "The Signature Festive Collection",
      desc: "Experience the pure elegance of our premium drapes, designed to bring out your natural grace and modern confidence.",
      aspectRatio: 1.7917
    },
    {
      id: 2,
      image: "https://i.ibb.co/5WCD8XX8/Chat-GPT-Image-Aug-13-2026-01-28-00-PM.png",
      title: "Style That Defines You",
      subtitle: "Premium Daily Silhouettes",
      desc: "Delight in soft cotton A-line kurtis and coordinated sets crafted with meticulous attention to comfort and modern detail.",
      aspectRatio: 2.0000
    },
    {
      id: 3,
      image: "https://i.ibb.co/Xr8k8s2H/Chat-GPT-Image-Aug-13-2026-12-50-56-PM.png",
      title: "Style That Defines You",
      subtitle: "Timeless Traditional Weaves",
      desc: "Discover premium Tissue Silk Kasavu sarees shimmering with heritage zari details, perfect for celebration days.",
      aspectRatio: 1.7768
    },
    {
      id: 4,
      image: "https://i.ibb.co/tTz1RQFy/Chat-GPT-Image-Aug-13-2026-12-06-28-PM.png",
      title: "Style That Defines You",
      subtitle: "Anarkali Royal Drapes",
      desc: "Feel majestic in our heavy flared Anarkali suits embellished with classic borders and premium handwork.",
      aspectRatio: 1.8545
    },
    {
      id: 5,
      image: "https://i.ibb.co/KcPY5WLJ/Chat-GPT-Image-Aug-13-2026-11-59-23-AM.png",
      title: "Style That Defines You",
      subtitle: "Boutique Co-ord Sets",
      desc: "Elevate your style with contemporary modal ethnic co-ords that blend classic comfort with chic patterns.",
      aspectRatio: 1.8194
    },
    {
      id: 6,
      image: "https://i.ibb.co/jCTdCQW/379a42c6-1c91-404e-8fb6-d04a4689c4a2.png",
      title: "Style That Defines You",
      subtitle: "Aline Midi Collection",
      desc: "Elegantly tailored midi dresses flowing with clean lines, soft textures, and subtle watercolor details.",
      aspectRatio: 1.8745
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  // Autoplay functionality
  useEffect(() => {
    autoPlayRef.current = nextSlide;
  });

  useEffect(() => {
    const play = () => {
      autoPlayRef.current();
    };
    const interval = setInterval(play, 6000); // 6 seconds duration
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="hero-carousel-container"
      style={{
        aspectRatio: slides[currentSlide].aspectRatio,
        transition: 'aspect-ratio 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
    >
      {/* Slider Track for Horizontal Movement */}
      <div 
        className="hero-slider-track"
        style={{
          display: 'flex',
          width: `${slides.length * 100}%`,
          transform: `translateX(-${(currentSlide * 100) / slides.length}%)`,
          transition: 'transform 750ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          height: '100%'
        }}
      >
        {/* Slides mapping */}
        {slides.map((slide, idx) => (
          <div 
            key={slide.id} 
            className={`hero-slide ${idx === currentSlide ? 'active' : ''}`}
            style={{
              width: `${100 / slides.length}%`,
              height: '100%',
              position: 'relative'
            }}
          >
            {/* Main Slide Image */}
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="hero-slide-img" 
            />
            
            {/* Subtle overlay for text contrast without blocking fashion details */}
            <div className="hero-slide-overlay"></div>

            {/* Elegant Content Box - Removed container class to allow exact left margin alignment */}
            <div className="hero-slide-content">
              <div className="hero-text-block animate-slide-up">
                <span className="hero-subtitle">{slide.subtitle}</span>
                <h1 className="hero-title">{slide.title}</h1>
                <p className="hero-desc">{slide.desc}</p>
                
                <div className="hero-buttons">
                  <Link to="/shop" className="btn btn-secondary hero-btn">
                    SHOP NOW
                  </Link>
                  <Link to="/shop?filter=new" className="btn btn-outline hero-btn hero-btn-outline">
                    EXPLORE COLLECTION
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cinematic Linear Progress Indicator */}
      <div className="hero-progress-bar-container">
        <div key={currentSlide} className="hero-progress-bar-fill" />
      </div>
    </div>
  );
}
