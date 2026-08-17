import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeroCarouselComponent } from '../../shared/components/hero-carousel/hero-carousel.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product, SizeOption } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeroCarouselComponent, ProductCardComponent],
  template: `
    <main class="home-page">
      <!-- 1. Hero Carousel (Ping-Pong 3-second loop) -->
      <app-hero-carousel></app-hero-carousel>

      <!-- 2. Featured Categories -->
      <section class="section categories-section">
        <div class="container">
          <div class="section-header">
            <span class="section-subtitle">CURATED COLLECTIONS</span>
            <h2 class="section-title">Shop By Category</h2>
            <p class="section-desc">Discover our handpicked silhouettes designed for every celebration.</p>
          </div>

          <div class="category-grid">
            <div 
              *ngFor="let cat of categories" 
              class="category-card"
            >
              <a [routerLink]="['/shop']" [queryParams]="{category: cat.slug}" class="category-link">
                <div class="category-img-wrapper">
                  <img [src]="cat.image_url" [alt]="cat.name" class="category-img" loading="lazy" />
                  <div class="category-overlay"></div>
                </div>
                <div class="category-info">
                  <h3 class="category-name">{{ cat.name }}</h3>
                  <span class="category-cta">Explore Collection →</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. New Arrivals -->
      <section class="section new-arrivals-section">
        <div class="container">
          <div class="section-header-flex">
            <div>
              <span class="section-subtitle">JUST DROPPED</span>
              <h2 class="section-title">New Arrivals</h2>
            </div>
            <a routerLink="/shop" [queryParams]="{filter: 'new'}" class="btn-outline">View All New Arrivals →</a>
          </div>

          <div class="product-grid" *ngIf="newArrivals.length > 0; else loadingState">
            <app-product-card 
              *ngFor="let prod of newArrivals" 
              [product]="prod"
              (quickAdd)="onQuickAdd($event)"
            ></app-product-card>
          </div>
        </div>
      </section>

      <!-- 6. Fashion Promotion Banner -->
      <section class="section promo-banner-section">
        <div class="container">
          <div class="promo-card">
            <div class="promo-content">
              <span class="promo-badge">FESTIVE EXCLUSIVE</span>
              <h2 class="promo-title">Tissue Silk Kasavu & Royal Anarkalis</h2>
              <p class="promo-text">
                Immerse yourself in traditional South Indian Kasavu gold weaves and handcrafted royal Anarkali sets. Crafted with love, tailored to perfection.
              </p>
              <a routerLink="/shop" class="btn-primary">Shop Festive Couture</a>
            </div>
            <div class="promo-image-group">
              <img src="https://i.ibb.co/7tQbhHpZ/Whats-App-Image-2026-08-13-at-12-31-11-PM-2.jpg" alt="Festive Couture 1" class="promo-img promo-img-1" />
              <img src="https://i.ibb.co/7N2bJC2X/Whats-App-Image-2026-08-13-at-12-31-10-PM-1.jpg" alt="Festive Couture 2" class="promo-img promo-img-2" />
            </div>
          </div>
        </div>
      </section>

      <!-- 4 & 5. Featured Products / Best Sellers Tabs -->
      <section class="section featured-section">
        <div class="container">
          <div class="section-header">
            <span class="section-subtitle">MOST LOVED</span>
            <h2 class="section-title">Featured & Best Sellers</h2>
            <p class="section-desc">Our customers' absolute favorite ethnic styles of the season.</p>
          </div>

          <div class="product-grid" *ngIf="featuredProducts.length > 0; else loadingState">
            <app-product-card 
              *ngFor="let prod of featuredProducts" 
              [product]="prod"
              (quickAdd)="onQuickAdd($event)"
            ></app-product-card>
          </div>
        </div>
      </section>

      <!-- 7. About Petals Ethnic -->
      <section class="section about-preview-section">
        <div class="container about-grid">
          <div class="about-img-box">
            <img src="https://i.ibb.co/7d3T6dxp/Whats-App-Image-2026-08-13-at-12-31-11-PM-1.jpg" alt="Petals Ethnic Boutique" class="about-img" />
            <div class="about-accent-badge">
              <span class="badge-number">100%</span>
              <span class="badge-text">Premium Quality Fabrics</span>
            </div>
          </div>
          <div class="about-content">
            <span class="section-subtitle">OUR BRAND STORY</span>
            <h2 class="section-title">Welcome to Petals Ethnic</h2>
            <p class="brand-quote-text">
              "Step up your style with our latest fashion collection. We offer premium quality fabrics and trendy designs that fit every occasion. Let us know what you are looking for, and we'll be happy to help you find the best outfit!"
            </p>
            <div class="about-features">
              <div class="feature-item">
                <span class="feature-icon">✨</span>
                <div>
                  <h4>Handpicked Fabrics</h4>
                  <p>Breathable cottons, shimmering tissue silks, and soft georgette drapes.</p>
                </div>
              </div>
              <div class="feature-item">
                <span class="feature-icon">👗</span>
                <div>
                  <h4>Inclusive Sizing</h4>
                  <p>Tailored fits ranging from XS to XXL for every silhouette.</p>
                </div>
              </div>
            </div>
            <a routerLink="/about" class="btn-secondary">Learn More About Us</a>
          </div>
        </div>
      </section>

      <!-- 8. Why Choose Us -->
      <section class="section why-us-section">
        <div class="container">
          <div class="why-us-grid">
            <div class="why-card">
              <div class="why-icon">🚚</div>
              <h3>Free Shipping</h3>
              <p>On all orders above ₹1499 delivered across India.</p>
            </div>
            <div class="why-card">
              <div class="why-icon">🧵</div>
              <h3>Craftsmanship</h3>
              <p>Finest hand-stitching, intricate prints, and luxury fabrics.</p>
            </div>
            <div class="why-card">
              <div class="why-icon">💳</div>
              <h3>Secure Payments</h3>
              <p>Razorpay Gateway, Credit Cards, NetBanking & UPI QR.</p>
            </div>
            <div class="why-card">
              <div class="why-icon">💬</div>
              <h3>Instant Assistance</h3>
              <p>Personalized shopping assistance via WhatsApp helpline.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 9. Customer Reviews -->
      <section class="section reviews-section">
        <div class="container">
          <div class="section-header">
            <span class="section-subtitle">TESTIMONIALS</span>
            <h2 class="section-title">Loved By Fashion Lovers</h2>
          </div>

          <div class="reviews-grid">
            <div class="review-card">
              <div class="stars">⭐⭐⭐⭐⭐</div>
              <p class="review-text">"The A-line floral kurti I ordered fit like a dream! The tissue silk quality exceeded my expectations. Delivered super fast too!"</p>
              <span class="reviewer-name">— Ananya R., Kochi</span>
            </div>
            <div class="review-card">
              <div class="stars">⭐⭐⭐⭐⭐</div>
              <p class="review-text">"Petals Ethnic has become my go-to for festive wear. Beautiful color combinations, elegant packaging, and great customer service on WhatsApp."</p>
              <span class="reviewer-name">— Divya Nair, Trivandrum</span>
            </div>
            <div class="review-card">
              <div class="stars">⭐⭐⭐⭐⭐</div>
              <p class="review-text">"The Anarkali set was so comfortable for my family function. Received so many compliments! Will definitely shop again."</p>
              <span class="reviewer-name">— Meera V., Bengaluru</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 10. Instagram Section -->
      <section class="section instagram-section">
        <div class="container">
          <div class="section-header">
            <span class="section-subtitle">FOLLOW OUR JOURNEY</span>
            <h2 class="section-title">&#64;petalsethnic on Instagram</h2>
            <p class="section-desc">Tag us in your Petals Ethnic outfits to be featured!</p>
          </div>

          <div class="insta-grid">
            <a href="https://www.instagram.com/petalsethnic" target="_blank" rel="noopener" class="insta-item">
              <img src="https://i.ibb.co/G4bg5wKQ/379a42c6-1c91-404e-8fb6-d04a4689c4a2.png" alt="Insta 1" />
              <div class="insta-overlay">📸 View on Instagram</div>
            </a>
            <a href="https://www.instagram.com/petalsethnic" target="_blank" rel="noopener" class="insta-item">
              <img src="https://i.ibb.co/TD42QpNd/Chat-GPT-Image-Aug-13-2026-12-50-56-PM.png" alt="Insta 2" />
              <div class="insta-overlay">📸 View on Instagram</div>
            </a>
            <a href="https://www.instagram.com/petalsethnic" target="_blank" rel="noopener" class="insta-item">
              <img src="https://i.ibb.co/5ZcYbZx/Chat-GPT-Image-Aug-13-2026-12-15-54-PM.png" alt="Insta 3" />
              <div class="insta-overlay">📸 View on Instagram</div>
            </a>
            <a href="https://www.instagram.com/petalsethnic" target="_blank" rel="noopener" class="insta-item">
              <img src="https://i.ibb.co/0yhmLfnt/Chat-GPT-Image-Aug-13-2026-11-59-23-AM.png" alt="Insta 4" />
              <div class="insta-overlay">📸 View on Instagram</div>
            </a>
          </div>
        </div>
      </section>

      <!-- 11. WhatsApp CTA Section -->
      <section class="section wa-cta-section">
        <div class="container wa-cta-box">
          <h2>Need Help Finding Your Perfect Outfit?</h2>
          <p>Connect directly with our fashion stylists on WhatsApp for sizing advice, customized recommendations, or order inquiries.</p>
          <a href="https://wa.me/918113899319?text=Hello%20Petals%20Ethnic,%20I%20would%20like%20to%20know%20more%20about%20your%20products." target="_blank" rel="noopener" class="btn-wa">
            💬 Chat with Us on WhatsApp (+91 81138 99319)
          </a>
        </div>
      </section>
    </main>

    <ng-template #loadingState>
      <div class="loading-spinner-box">
        <div class="spinner"></div>
        <p>Loading stunning fashion collections...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .section {
      padding: 72px 0;
    }
    @media (max-width: 768px) {
      .section { padding: 48px 0; }
    }

    /* Categories Grid */
    .category-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
    @media (max-width: 992px) {
      .category-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 576px) {
      .category-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    }

    .category-card {
      position: relative;
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }
    .category-img-wrapper {
      position: relative;
      padding-top: 130%;
      background-color: var(--color-bg-alt);
    }
    .category-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .category-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%);
    }
    .category-card:hover .category-img {
      transform: scale(1.08);
    }
    .category-info {
      position: absolute;
      bottom: 20px;
      left: 20px;
      right: 20px;
      color: #FFFFFF;
      z-index: 2;
    }
    .category-name {
      font-size: 20px;
      color: #FFFFFF;
      margin-bottom: 4px;
    }
    @media (max-width: 576px) {
      .category-name { font-size: 15px; }
    }
    .category-cta {
      font-size: 12px;
      font-weight: 500;
      color: var(--color-pink);
      letter-spacing: 0.5px;
    }

    /* Product Grids */
    .section-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 40px;
    }
    @media (max-width: 576px) {
      .section-header-flex { flex-direction: column; align-items: flex-start; gap: 16px; }
    }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
    @media (max-width: 992px) {
      .product-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 576px) {
      .product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    }

    /* Promo Banner */
    .promo-banner-section {
      background-color: var(--color-bg-alt);
    }
    .promo-card {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      align-items: center;
      background: #FFFFFF;
      padding: 48px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-pink-light);
      box-shadow: var(--shadow-md);
    }
    @media (max-width: 992px) {
      .promo-card { grid-template-columns: 1fr; padding: 24px; }
    }
    .promo-badge {
      display: inline-block;
      background: var(--color-gold-light);
      color: var(--color-gold);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      padding: 6px 14px;
      border-radius: var(--radius-full);
      margin-bottom: 16px;
    }
    .promo-title {
      font-size: 38px;
      line-height: 1.2;
      margin-bottom: 16px;
    }
    @media (max-width: 576px) {
      .promo-title { font-size: 26px; }
    }
    .promo-text {
      font-size: 15px;
      color: var(--color-muted);
      margin-bottom: 28px;
    }
    .promo-image-group {
      display: flex;
      gap: 16px;
    }
    .promo-img {
      width: 50%;
      height: 320px;
      object-fit: cover;
      border-radius: var(--radius-md);
    }

    /* About Section */
    .about-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
    }
    @media (max-width: 992px) {
      .about-grid { grid-template-columns: 1fr; gap: 32px; }
    }
    .about-img-box {
      position: relative;
    }
    .about-img {
      width: 100%;
      height: 480px;
      object-fit: cover;
      border-radius: var(--radius-lg);
    }
    .about-accent-badge {
      position: absolute;
      bottom: -20px;
      right: -20px;
      background-color: var(--color-text-heading);
      color: #FFFFFF;
      padding: 24px;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .badge-number {
      font-size: 28px;
      font-family: var(--font-heading);
      font-weight: 700;
      color: var(--color-pink);
    }
    .badge-text {
      font-size: 11px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .brand-quote-text {
      font-style: italic;
      font-size: 16px;
      line-height: 1.6;
      color: var(--color-muted);
      margin-bottom: 24px;
      border-left: 3px solid var(--color-pink);
      padding-left: 16px;
    }
    .about-features {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 32px;
    }
    .feature-item {
      display: flex;
      gap: 16px;
    }
    .feature-icon {
      font-size: 24px;
    }

    /* Why Us */
    .why-us-section {
      background-color: var(--color-bg-alt);
    }
    .why-us-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
    @media (max-width: 992px) {
      .why-us-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 576px) {
      .why-us-grid { grid-template-columns: 1fr; }
    }
    .why-card {
      background: #FFFFFF;
      padding: 32px 24px;
      border-radius: var(--radius-md);
      text-align: center;
      border: 1px solid var(--color-border-light);
      transition: var(--transition);
    }
    .why-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-sm);
      border-color: var(--color-pink);
    }
    .why-icon {
      font-size: 36px;
      margin-bottom: 16px;
    }
    .why-card h3 {
      font-size: 18px;
      margin-bottom: 8px;
    }
    .why-card p {
      font-size: 13px;
      color: var(--color-muted);
    }

    /* Reviews */
    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    @media (max-width: 768px) {
      .reviews-grid { grid-template-columns: 1fr; }
    }
    .review-card {
      background: #FFFFFF;
      padding: 32px;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border-light);
      box-shadow: var(--shadow-sm);
    }
    .stars {
      margin-bottom: 12px;
    }
    .review-text {
      font-size: 14px;
      color: var(--color-text);
      font-style: italic;
      margin-bottom: 16px;
      line-height: 1.6;
    }
    .reviewer-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-gold);
    }

    /* Instagram */
    .insta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    @media (max-width: 576px) {
      .insta-grid { grid-template-columns: repeat(2, 1fr); }
    }
    .insta-item {
      position: relative;
      padding-top: 100%;
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .insta-item img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .insta-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.6);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 600;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .insta-item:hover img {
      transform: scale(1.08);
    }
    .insta-item:hover .insta-overlay {
      opacity: 1;
    }

    /* WhatsApp CTA */
    .wa-cta-box {
      background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%);
      color: #FFFFFF;
      padding: 60px 32px;
      border-radius: var(--radius-lg);
      text-align: center;
    }
    .wa-cta-box h2 {
      font-size: 32px;
      color: #FFFFFF;
      margin-bottom: 12px;
    }
    .wa-cta-box p {
      font-size: 16px;
      color: #CCCCCC;
      max-width: 600px;
      margin: 0 auto 28px auto;
    }
    .btn-wa {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background-color: #25D366;
      color: #FFFFFF;
      padding: 16px 36px;
      border-radius: var(--radius-full);
      font-weight: 600;
      font-size: 15px;
      transition: var(--transition);
    }
    .btn-wa:hover {
      background-color: #1EBE57;
      transform: scale(1.03);
    }

    /* Loading Spinner */
    .loading-spinner-box {
      padding: 80px 0;
      text-align: center;
      color: var(--color-muted);
    }
    .spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto 16px auto;
      border: 3px solid var(--color-pink-light);
      border-top-color: var(--color-pink-dark);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  newArrivals: Product[] = [];
  featuredProducts: Product[] = [];

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  async ngOnInit() {
    try {
      this.categories = await this.productService.getCategories();
      this.newArrivals = await this.productService.getProducts({ newArrivalOnly: true });
      this.featuredProducts = await this.productService.getProducts({ featuredOnly: true });
      
      // Fallback sample data if database is empty initially
      if (this.newArrivals.length === 0) {
        this.newArrivals = this.getFallbackProducts();
      }
      if (this.featuredProducts.length === 0) {
        this.featuredProducts = this.getFallbackProducts();
      }
    } catch (e) {
      console.error('Error loading home data:', e);
      this.newArrivals = this.getFallbackProducts();
      this.featuredProducts = this.getFallbackProducts();
    }
  }

  onQuickAdd(event: { product: Product; size: SizeOption }) {
    try {
      this.cartService.addToCart(event.product, event.size, 1);
      alert(`Added ${event.product.name} (Size: ${event.size}) to your cart!`);
    } catch (err: any) {
      alert(err.message || 'Could not add item to cart');
    }
  }

  private getFallbackProducts(): Product[] {
    return [
      {
        id: 'p1',
        name: 'Royal Floral Anarkali Set',
        slug: 'royal-floral-anarkali-set',
        description: 'Handworked flared Anarkali kurta with floral print dupattas.',
        price: 2499,
        sale_price: 1999,
        stock: 12,
        availability: 'in_stock',
        featured: true,
        new_arrival: true,
        active: true,
        category: { id: 'c4', name: 'Anarkali', slug: 'anarkali', active: true },
        images: [{ image_url: 'https://i.ibb.co/7tQbhHpZ/Whats-App-Image-2026-08-13-at-12-31-11-PM-2.jpg', is_primary: true }]
      },
      {
        id: 'p2',
        name: 'Tissue Silk Kasavu Festive Kurta',
        slug: 'tissue-silk-kasavu-festive-kurta',
        description: 'Shimmering golden Kasavu woven tissue silk kurta set.',
        price: 2999,
        sale_price: 2499,
        stock: 8,
        availability: 'few_left',
        featured: true,
        new_arrival: true,
        active: true,
        category: { id: 'c6', name: 'Tissue Silk Kasavu', slug: 'tissue-silk-kasavu-kurta', active: true },
        images: [{ image_url: 'https://i.ibb.co/7N2bJC2X/Whats-App-Image-2026-08-13-at-12-31-10-PM-1.jpg', is_primary: true }]
      },
      {
        id: 'p3',
        name: 'A-Line Watercolor Floral Midi Dress',
        slug: 'aline-watercolor-floral-midi-dress',
        description: 'Elegant A-line silhouette with soft watercolor botanical drapes.',
        price: 1899,
        sale_price: null,
        stock: 15,
        availability: 'in_stock',
        featured: true,
        new_arrival: false,
        active: true,
        category: { id: 'c1', name: 'A Line Midi Dress', slug: 'aline-midi-dress', active: true },
        images: [{ image_url: 'https://i.ibb.co/7d3T6dxp/Whats-App-Image-2026-08-13-at-12-31-11-PM-1.jpg', is_primary: true }]
      },
      {
        id: 'p4',
        name: 'Modern Chic Co-ord Codeset',
        slug: 'modern-chic-coord-codeset',
        description: 'Tailored 2-piece ethnic coordinated set with soft cotton lining.',
        price: 2199,
        sale_price: 1799,
        stock: 5,
        availability: 'few_left',
        featured: true,
        new_arrival: true,
        active: true,
        category: { id: 'c5', name: 'Codeset', slug: 'codeset', active: true },
        images: [{ image_url: 'https://i.ibb.co/G4bg5wKQ/379a42c6-1c91-404e-8fb6-d04a4689c4a2.png', is_primary: true }]
      }
    ];
  }
}
