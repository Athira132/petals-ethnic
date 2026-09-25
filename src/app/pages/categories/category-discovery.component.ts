import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Category, DepartmentType } from '../../core/models/category.model';
import { handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../core/utils/image.utils';

@Component({
  selector: 'app-category-discovery',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="category-discovery-page">
      <!-- Hero Banner -->
      <div class="discovery-hero">
        <div class="container hero-container">
          <span class="hero-subtitle">PETAL ETHNICS & JEWELLERS</span>
          <h1 class="hero-title">Explore Collections</h1>
          <p class="hero-desc">Discover our curated collections of artisanal ethnic couture and timeless handcrafted jewellery.</p>
        </div>
      </div>

      <!-- Department Filter Switcher -->
      <div class="filter-tabs-wrapper">
        <div class="container">
          <div class="filter-tabs">
            <button 
              class="tab-btn" 
              [class.active]="selectedDept === 'all'" 
              (click)="setDepartment('all')"
            >
              All Collections ({{ allCategories.length }})
            </button>
            <button 
              class="tab-btn" 
              [class.active]="selectedDept === 'ethnic'" 
              (click)="setDepartment('ethnic')"
            >
              🌸 Ethnic Wear ({{ ethnicCategories.length }})
            </button>
            <button 
              class="tab-btn" 
              [class.active]="selectedDept === 'jewellery'" 
              (click)="setDepartment('jewellery')"
            >
              ✨ Jewellery ({{ jewelleryCategories.length }})
            </button>
          </div>
        </div>
      </div>

      <div class="container discovery-container">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="cards-grid">
          <div class="skeleton-category-card" *ngFor="let s of [1,2,3,4,5,6]">
            <div class="skeleton-img"></div>
            <div class="skeleton-body">
              <div class="skeleton-line title"></div>
              <div class="skeleton-line desc"></div>
            </div>
          </div>
        </div>

        <!-- Category Discovery Cards Grid -->
        <div *ngIf="!isLoading">
          <!-- Ethnics Section if Selected or All -->
          <section *ngIf="(selectedDept === 'all' || selectedDept === 'ethnic') && ethnicCategories.length > 0" class="collection-section">
            <div class="section-header" *ngIf="selectedDept === 'all'">
              <div>
                <h2 class="section-title">🌸 Ethnic Wear Collections</h2>
                <p class="section-subtitle">Kurtis, Anarkalis, Sarees, Co-ord Sets, and Midi Dresses</p>
              </div>
              <a [routerLink]="['/shop/ethnics']" class="view-all-link">Browse All Ethnics &rarr;</a>
            </div>

            <div class="cards-grid">
              <a 
                *ngFor="let cat of ethnicCategories" 
                [routerLink]="['/shop/ethnics']" 
                [queryParams]="{ category: cat.slug }"
                class="category-card"
              >
                <div class="card-image-wrap">
                  <img 
                    [src]="cat.image_url || defaultEthnicImage" 
                    [alt]="cat.name" 
                    class="card-img" 
                    loading="lazy"
                    (error)="onImageError($event)" 
                  />
                  <div class="card-overlay"></div>
                  <span class="dept-badge ethnic-badge">Ethnics</span>
                </div>
                <div class="card-info">
                  <h3 class="card-name">{{ cat.name }}</h3>
                  <p class="card-desc">{{ cat.description || 'Explore our exclusive handcrafted ' + cat.name + ' collection.' }}</p>
                  <span class="card-cta">Explore Collection &rarr;</span>
                </div>
              </a>
            </div>
          </section>

          <!-- Jewellery Section if Selected or All -->
          <section *ngIf="(selectedDept === 'all' || selectedDept === 'jewellery') && jewelleryCategories.length > 0" class="collection-section">
            <div class="section-header" *ngIf="selectedDept === 'all'">
              <div>
                <h2 class="section-title">✨ Jewellery Collections</h2>
                <p class="section-subtitle">Chokers, Necklaces, Earrings, Bangles, Rings & Temple Jewellery</p>
              </div>
              <a [routerLink]="['/shop/jewellery']" class="view-all-link">Browse All Jewellery &rarr;</a>
            </div>

            <div class="cards-grid">
              <a 
                *ngFor="let cat of jewelleryCategories" 
                [routerLink]="['/shop/jewellery']" 
                [queryParams]="{ category: cat.slug }"
                class="category-card"
              >
                <div class="card-image-wrap">
                  <img 
                    [src]="cat.image_url || defaultJewelleryImage" 
                    [alt]="cat.name" 
                    class="card-img" 
                    loading="lazy"
                    (error)="onImageError($event)" 
                  />
                  <div class="card-overlay"></div>
                  <span class="dept-badge jewellery-badge">Jewellery</span>
                </div>
                <div class="card-info">
                  <h3 class="card-name">{{ cat.name }}</h3>
                  <p class="card-desc">{{ cat.description || 'Discover exquisite ' + cat.name + ' handcrafted to perfection.' }}</p>
                  <span class="card-cta">Explore Collection &rarr;</span>
                </div>
              </a>
            </div>
          </section>

          <!-- Empty State -->
          <div *ngIf="displayedCategories.length === 0" class="empty-box">
            <p>No categories found in this section.</p>
            <a routerLink="/shop" class="btn-primary">Browse All Products</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .category-discovery-page {
      background-color: #FAFAFA;
      min-height: 100vh;
      padding-bottom: 60px;
    }

    .discovery-hero {
      position: relative;
      background: linear-gradient(rgba(24, 18, 20, 0.65), rgba(24, 18, 20, 0.75)),
                  url('https://i.ibb.co/0yhmLfnt/Chat-GPT-Image-Aug-13-2026-11-59-23-AM.png') center/cover no-repeat;
      padding: 60px 20px;
      text-align: center;
      color: #FFFFFF;
    }
    .hero-container {
      max-width: 700px;
      margin: 0 auto;
    }
    .hero-subtitle {
      font-size: 12px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #E8B4C0;
      font-weight: 700;
      display: block;
      margin-bottom: 8px;
    }
    .hero-title {
      font-family: var(--font-serif);
      font-size: 38px;
      font-weight: 600;
      color: #FFFFFF;
      margin-bottom: 12px;
    }
    .hero-desc {
      font-size: 15px;
      color: rgba(255,255,255,0.9);
      line-height: 1.6;
    }

    /* Filter Tabs */
    .filter-tabs-wrapper {
      background: #FFFFFF;
      border-bottom: 1px solid var(--color-border-light);
      position: sticky;
      top: 70px;
      z-index: 10;
    }
    .filter-tabs {
      display: flex;
      justify-content: center;
      gap: 12px;
      padding: 14px 0;
      overflow-x: auto;
    }
    .tab-btn {
      padding: 10px 22px;
      border-radius: 30px;
      background: #F3F4F6;
      border: 1px solid transparent;
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-main);
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .tab-btn:hover {
      background: #E5E7EB;
    }
    .tab-btn.active {
      background: var(--color-pink-dark);
      color: #FFFFFF;
      border-color: var(--color-pink-dark);
      box-shadow: 0 4px 12px rgba(192, 86, 118, 0.25);
    }

    .discovery-container {
      margin-top: 40px;
    }

    .collection-section {
      margin-bottom: 50px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--color-border-light);
    }
    .section-title {
      font-family: var(--font-serif);
      font-size: 26px;
      color: var(--color-text-heading);
      margin-bottom: 4px;
    }
    .section-subtitle {
      font-size: 13px;
      color: var(--color-muted);
    }
    .view-all-link {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-pink-dark);
      text-decoration: none;
      transition: var(--transition);
    }
    .view-all-link:hover {
      color: var(--color-pink);
      text-decoration: underline;
    }

    /* Cards Grid */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
    @media (max-width: 1200px) {
      .cards-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; }
    }
    @media (max-width: 850px) {
      .cards-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
    }
    @media (max-width: 500px) {
      .cards-grid { grid-template-columns: 1fr; gap: 16px; }
    }

    /* Category Card */
    .category-card {
      background: #FFFFFF;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--color-border-light);
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .category-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 28px rgba(0,0,0,0.12);
      border-color: rgba(192, 86, 118, 0.4);
    }

    .card-image-wrap {
      position: relative;
      width: 100%;
      padding-top: 100%; /* 1:1 Aspect Ratio */
      overflow: hidden;
      background: #f4ede8;
    }
    .card-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .category-card:hover .card-img {
      transform: scale(1.08);
    }
    .card-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%);
      opacity: 0.6;
      transition: opacity 0.3s ease;
    }
    .category-card:hover .card-overlay {
      opacity: 0.8;
    }

    .dept-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 20px;
      letter-spacing: 0.5px;
      z-index: 2;
    }
    .ethnic-badge {
      background: rgba(192, 86, 118, 0.9);
      color: #FFFFFF;
      backdrop-filter: blur(4px);
    }
    .jewellery-badge {
      background: rgba(20, 20, 20, 0.85);
      color: #E8B4C0;
      border: 1px solid rgba(232, 180, 192, 0.4);
      backdrop-filter: blur(4px);
    }

    .card-info {
      padding: 20px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .card-name {
      font-family: var(--font-serif);
      font-size: 19px;
      font-weight: 600;
      color: var(--color-text-heading);
      margin-bottom: 6px;
      line-height: 1.3;
    }
    .card-desc {
      font-size: 13px;
      color: var(--color-muted);
      line-height: 1.5;
      margin-bottom: 16px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex: 1;
    }
    .card-cta {
      font-size: 13px;
      font-weight: 700;
      color: var(--color-pink-dark);
      display: inline-flex;
      align-items: center;
      transition: transform 0.2s ease;
    }
    .category-card:hover .card-cta {
      transform: translateX(4px);
      color: var(--color-pink);
    }

    /* Skeleton Loading */
    .skeleton-category-card {
      background: #FFFFFF;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--color-border-light);
    }
    .skeleton-img {
      width: 100%;
      padding-top: 100%;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .skeleton-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .skeleton-line {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }
    .skeleton-line.title { height: 18px; width: 60%; }
    .skeleton-line.desc { height: 12px; width: 85%; }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .empty-box {
      text-align: center;
      padding: 60px 20px;
      background: #FFFFFF;
      border-radius: var(--radius-md);
    }
    .btn-primary {
      display: inline-block;
      margin-top: 14px;
      background: var(--color-pink-dark);
      color: #FFFFFF;
      padding: 10px 20px;
      border-radius: var(--radius-sm);
      text-decoration: none;
      font-weight: 600;
    }
  `]
})
export class CategoryDiscoveryComponent implements OnInit {
  allCategories: Category[] = [];
  ethnicCategories: Category[] = [];
  jewelleryCategories: Category[] = [];
  selectedDept: 'all' | 'ethnic' | 'jewellery' = 'all';
  isLoading = true;

  readonly defaultEthnicImage = 'https://i.ibb.co/TD42QpNd/Chat-GPT-Image-Aug-13-2026-12-50-56-PM.png';
  readonly defaultJewelleryImage = 'https://i.ibb.co/0yhmLfnt/Chat-GPT-Image-Aug-13-2026-11-59-23-AM.png';

  constructor(private productService: ProductService) {}

  async ngOnInit() {
    await this.loadCategories();
  }

  async loadCategories() {
    this.isLoading = true;
    try {
      const cats = await this.productService.getCategories(true);
      this.allCategories = cats;
      this.ethnicCategories = cats.filter(c => (c.department || 'ethnic') === 'ethnic');
      this.jewelleryCategories = cats.filter(c => c.department === 'jewellery');
    } catch (e) {
      console.error('Error loading category discovery:', e);
    } finally {
      this.isLoading = false;
    }
  }

  setDepartment(dept: 'all' | 'ethnic' | 'jewellery') {
    this.selectedDept = dept;
  }

  get displayedCategories(): Category[] {
    if (this.selectedDept === 'ethnic') return this.ethnicCategories;
    if (this.selectedDept === 'jewellery') return this.jewelleryCategories;
    return this.allCategories;
  }

  onImageError(event: Event) {
    handleImageError(event);
  }
}
