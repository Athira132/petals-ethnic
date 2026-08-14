import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoPlayRef = useRef();

  const slides = [
    {
      id: 1,
      image: "https://i.ibb.co/rRmP6F3v/e91f0610-216c-48ca-beea-0978643cb1f4.png",
      title: "Style That Defines You",
      subtitle: "Unveiling Our New Festive Collection",
      desc: "Handcrafted silhouettes featuring premium fabrics and traditional elegance, reimagined for the modern Indian woman."
    },
    {
      id: 2,
      image: "https://i.ibb.co/FL302jG8/379a42c6-1c91-404e-8fb6-d04a4689c4a2.png",
      title: "Grace in Every Thread",
      subtitle: "Traditional Meets Contemporary",
      desc: "Step into effortless beauty with our latest line of designer Kurtis, Anarkalis, and signature midi dresses."
    },
    {
      id: 3,
      image: "https://i.ibb.co/d45MpPN7/Chat-GPT-Image-Aug-13-2026-11-59-23-AM.png",
      title: "Timeless Heritage",
      subtitle: "Tissue Silk Kasavu Saree Collection",
      desc: "Woven in shimmering tissue silk with pure golden zari work, paying homage to Kerala's rich weaving legacy."
    },
    {
      id: 4,
      image: "https://i.ibb.co/LdXYKVZh/Chat-GPT-Image-Aug-13-2026-01-28-00-PM.png",
      title: "Chic & Coordinated",
      subtitle: "Premium Modal Codesets",
      desc: "Indulge in matched luxury sets combining soft breathability, designer details, and custom daily comfort."
    },
    {
      id: 5,
      image: "https://i.ibb.co/PzZTfH9W/Gemini-Generated-Image-39gh9039gh9039gh.png",
      title: "Effortless Midi Silhouettes",
      subtitle: "The Perfect Daily Silhouette",
      desc: "Lightweight, comfortable A-line midi dresses featuring modern drapes and soft pastel branding hues."
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Autoplay function
  useEffect(() => {
    autoPlayRef.current = nextSlide;
  });

  useEffect(() => {
    const play = () => {
      autoPlayRef.current();
    };
    const interval = setInterval(play, 6000); // 6s duration
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-carousel-container">
      {/* Slides mapping */}
      {slides.map((slide, idx) => (
        <div 
          key={slide.id} 
          className={`hero-slide ${idx === currentSlide ? 'active' : ''}`}
        >
          {/* Main Slide Image */}
          <img 
            src={slide.image} 
            alt={slide.title} 
            className="hero-slide-img" 
          />
          
          {/* Subtle overlay for text contrast without blocking fashion details */}
          <div className="hero-slide-overlay"></div>

          {/* Elegant Content Box */}
          <div className="hero-slide-content container">
            <div className="hero-text-block animate-slide-up">
              <span className="hero-subtitle">{slide.subtitle}</span>
              <h1 className="hero-title">{slide.title}</h1>
              <p className="hero-desc">{slide.desc}</p>
              
              <div className="hero-buttons">
                <Link to="/shop" className="btn btn-secondary hero-btn">
                  Shop Now
                </Link>
                <Link to="/shop?filter=new" className="btn btn-outline hero-btn hero-btn-outline">
                  Explore Collection
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button className="carousel-arrow arrow-left" onClick={prevSlide} aria-label="Previous banner">
        <ChevronLeft size={24} />
      </button>
      <button className="carousel-arrow arrow-right" onClick={nextSlide} aria-label="Next banner">
        <ChevronRight size={24} />
      </button>

      {/* Indicator Dots */}
      <div className="carousel-indicators">
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`indicator-dot ${idx === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
}
