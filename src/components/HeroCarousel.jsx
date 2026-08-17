import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

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
      subtitle: "Timeless Traditional Styles",
      desc: "Discover premium traditional ensembles shimmering with heritage gold details, perfect for celebration days.",
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

  // Append clone of first slide for continuous horizontal rotation without visual jumps
  const extendedSlides = [...slides, slides[0]];

  // Autoplay: 3 seconds visible duration per slide
  useEffect(() => {
    const play = () => {
      setIsTransitioning(true);
      setCurrentSlide((prev) => prev + 1);
    };

    const interval = setInterval(play, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle seamless silent reset back to first slide on transition end
  const handleTransitionEnd = () => {
    if (currentSlide === extendedSlides.length - 1) {
      setIsTransitioning(false);
      setCurrentSlide(0);
    }
  };

  // Touch and drag swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev + 1) % extendedSlides.length);
    } else if (isRightSwipe) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const visualIndex = currentSlide === extendedSlides.length - 1 ? 0 : currentSlide;

  return (
    <div 
      className="hero-carousel-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      style={{
        aspectRatio: extendedSlides[visualIndex].aspectRatio,
        transition: 'aspect-ratio 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
    >
      {/* Slider Track for Horizontal Movement */}
      <div 
        className="hero-slider-track"
        onTransitionEnd={handleTransitionEnd}
        style={{
          display: 'flex',
          width: `${extendedSlides.length * 100}%`,
          transform: `translateX(-${(currentSlide * 100) / extendedSlides.length}%)`,
          transition: isTransitioning ? 'transform 750ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
          height: '100%'
        }}
      >
        {extendedSlides.map((slide, idx) => (
          <div 
            key={`${slide.id}-${idx}`} 
            className="hero-slide"
            style={{
              width: `${100 / extendedSlides.length}%`,
              height: '100%',
              position: 'relative'
            }}
          >
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="hero-slide-img" 
              draggable="false"
              loading={idx === 0 ? "eager" : "lazy"}
            />
            
            <div className="hero-slide-overlay"></div>

            <div className="hero-slide-content">
              <div className="hero-text-block animate-slide-up">
                <span className="hero-subtitle">{slide.subtitle}</span>
                <h1 className="hero-title">{slide.title}</h1>
                <p className="hero-desc">{slide.desc}</p>
                
                <div className="hero-buttons">
                  <Link to="/shop" className="btn btn-secondary hero-btn">
                    SHOP NOW
                  </Link>
                  <Link to="/shop" className="btn btn-outline hero-btn hero-btn-outline">
                    EXPLORE COLLECTION
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Clean Linear Progress Bar */}
      <div className="hero-progress-bar-container">
        <div key={visualIndex} className="hero-progress-bar-fill" style={{ animationDuration: '3000ms' }} />
      </div>
    </div>
  );
}
