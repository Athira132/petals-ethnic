import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  robots?: string; // default: 'index, follow'
  ogImage?: string;
  ogType?: string;
  jsonLd?: object | object[];
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly defaultBaseUrl = 'https://www.petalsethnic.com';
  private readonly brandName = 'Petals Ethnics and Jewellers';
  private readonly defaultOgImage = 'https://i.ibb.co/6JV46cXy/Chat-GPT-Image-Sep-28-2026-10-35-37-AM.png';
  private readonly defaultKeywords = 'Petals, Petals Ethnics, Petals Ethnics and Jewellers, ethnic wear, ethnic clothing, traditional wear, Indian ethnic wear, sarees, kurtis, Anarkali, ethnic dresses, jewellery, jewellery shop, traditional jewellery, Indian jewellery, fashion jewellery, ethnic jewellery';

  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  /**
   * Universal method to set page SEO metadata, canonical link, social tags, and structured data.
   */
  setSeo(config: SeoConfig): void {
    const fullTitle = config.title.includes(this.brandName) 
      ? config.title 
      : `${config.title} | ${this.brandName}`;
    
    // 1. Title Tag
    this.titleService.setTitle(fullTitle);

    // 2. Standard Meta Tags
    this.metaService.updateTag({ name: 'description', content: config.description });
    this.metaService.updateTag({ name: 'author', content: this.brandName });
    this.metaService.updateTag({ name: 'robots', content: config.robots || 'index, follow' });
    
    const keywords = config.keywords || this.defaultKeywords;
    this.metaService.updateTag({ name: 'keywords', content: keywords });

    // 3. Canonical URL
    const canonical = config.canonicalUrl || this.defaultBaseUrl;
    this.updateCanonicalLink(canonical);

    // 4. Open Graph Metadata
    const image = config.ogImage || this.defaultOgImage;
    this.metaService.updateTag({ property: 'og:site_name', content: this.brandName });
    this.metaService.updateTag({ property: 'og:title', content: fullTitle });
    this.metaService.updateTag({ property: 'og:description', content: config.description });
    this.metaService.updateTag({ property: 'og:image', content: image });
    this.metaService.updateTag({ property: 'og:url', content: canonical });
    this.metaService.updateTag({ property: 'og:type', content: config.ogType || 'website' });
    this.metaService.updateTag({ property: 'og:locale', content: 'en_IN' });

    // 5. Twitter / X Cards
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: fullTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: config.description });
    this.metaService.updateTag({ name: 'twitter:image', content: image });

    // 6. JSON-LD Structured Data
    if (config.jsonLd) {
      this.setJsonLd(config.jsonLd);
    } else {
      this.removeJsonLd();
    }
  }

  /**
   * Homepage SEO with Organization, WebSite, and OnlineStore Structured Data
   */
  setHomeSeo(): void {
    const jsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': this.brandName,
        'alternateName': ['Petals Ethnics', 'Petals Ethnic and Jewellers'],
        'url': this.defaultBaseUrl,
        'logo': 'https://i.ibb.co/KxVNd9hN/Untitled-design-7-removebg-preview-removebg-preview.png',
        'telephone': '+918113899319',
        'email': 'petalsethnic@gmail.com',
        'sameAs': [
          'https://www.instagram.com/petalsethnic',
          'https://www.facebook.com/share/1CZHBSGW22/'
        ],
        'address': {
          '@type': 'PostalAddress',
          'addressRegion': 'Kerala',
          'addressCountry': 'IN'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': this.brandName,
        'url': this.defaultBaseUrl,
        'potentialAction': {
          '@type': 'SearchAction',
          'target': `${this.defaultBaseUrl}/ethnics?search={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'OnlineStore',
        'name': this.brandName,
        'url': this.defaultBaseUrl,
        'image': this.defaultOgImage,
        'description': 'Online boutique for premium Indian ethnic wear, designer sarees, kurtis, Anarkalis, and handcrafted traditional jewellery.',
        'priceRange': '₹₹',
        'currenciesAccepted': 'INR',
        'paymentAccepted': 'Cash on Delivery, UPI, Credit Card, Debit Card, Net Banking',
        'telephone': '+918113899319',
        'email': 'petalsethnic@gmail.com'
      }
    ];

    this.setSeo({
      title: 'Petals Ethnics and Jewellers | Ethnic Wear & Jewellery',
      description: 'Discover exquisite Indian ethnic wear, designer sarees, kurtis, festive Anarkalis, and handcrafted traditional jewellery at Petals Ethnics and Jewellers. Shop online with nationwide delivery.',
      canonicalUrl: `${this.defaultBaseUrl}/`,
      robots: 'index, follow',
      ogType: 'website',
      jsonLd
    });
  }

  /**
   * Department Listing SEO (Ethnics or Jewellery)
   */
  setDepartmentSeo(department: 'ethnic' | 'jewellery'): void {
    if (department === 'jewellery') {
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${this.defaultBaseUrl}/` },
          { '@type': 'ListItem', 'position': 2, 'name': 'Jewellery', 'item': `${this.defaultBaseUrl}/jewellery` }
        ]
      };

      this.setSeo({
        title: 'Handcrafted Traditional Jewellery | Petals Ethnics and Jewellers',
        description: 'Explore curated Indian jewellery at Petals Ethnics and Jewellers. Discover statement necklaces, pearl jhumka earrings, festive bangles, and bridal fashion jewellery.',
        keywords: 'jewellery, jewellery shop, traditional jewellery, Indian jewellery, fashion jewellery, ethnic jewellery, earrings, necklaces, bangles, Petals jewellery',
        canonicalUrl: `${this.defaultBaseUrl}/jewellery`,
        robots: 'index, follow',
        jsonLd
      });
    } else {
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${this.defaultBaseUrl}/` },
          { '@type': 'ListItem', 'position': 2, 'name': 'Ethnics', 'item': `${this.defaultBaseUrl}/ethnics` }
        ]
      };

      this.setSeo({
        title: 'Ethnic Wear & Traditional Clothing | Petals Ethnics and Jewellers',
        description: 'Shop authentic Indian ethnic wear at Petals Ethnics and Jewellers. Handcrafted sarees, soft cotton kurtis, festive Anarkalis, midi dresses, and co-ord sets.',
        keywords: 'ethnic wear, ethnic clothing, traditional wear, Indian ethnic wear, sarees, kurtis, Anarkali, ethnic dresses, Petals ethnics',
        canonicalUrl: `${this.defaultBaseUrl}/ethnics`,
        robots: 'index, follow',
        jsonLd
      });
    }
  }

  /**
   * Category Page SEO with dynamic title, description, and BreadcrumbList
   */
  setCategorySeo(categoryOrName: Category | string, department: 'ethnic' | 'jewellery', slug?: string, desc?: string): void {
    let categoryName = '';
    let categorySlug = slug;
    let categoryDesc = desc;

    if (typeof categoryOrName === 'object' && categoryOrName !== null) {
      categoryName = categoryOrName.name;
      categorySlug = categoryOrName.slug || slug;
      categoryDesc = categoryOrName.description || desc;
    } else {
      categoryName = categoryOrName;
    }

    const deptPath = department === 'jewellery' ? 'jewellery' : 'ethnics';
    const deptLabel = department === 'jewellery' ? 'Jewellery' : 'Ethnics';
    const canonical = categorySlug 
      ? `${this.defaultBaseUrl}/${deptPath}/${categorySlug}`
      : `${this.defaultBaseUrl}/${deptPath}`;

    const cleanDesc = categoryDesc 
      ? categoryDesc.replace(/<[^>]*>?/gm, '').trim()
      : `Explore our handcrafted ${categoryName} collection at Petals Ethnics and Jewellers. High-quality fabrics and timeless designs tailored for every occasion.`;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${this.defaultBaseUrl}/` },
        { '@type': 'ListItem', 'position': 2, 'name': deptLabel, 'item': `${this.defaultBaseUrl}/${deptPath}` },
        { '@type': 'ListItem', 'position': 3, 'name': categoryName, 'item': canonical }
      ]
    };

    this.setSeo({
      title: `${categoryName} | Petals Ethnics and Jewellers`,
      description: cleanDesc.length > 160 ? cleanDesc.slice(0, 157) + '...' : cleanDesc,
      keywords: `${categoryName}, ${categoryName} online, ${deptLabel}, Petals Ethnics and Jewellers`,
      canonicalUrl: canonical,
      robots: 'index, follow',
      jsonLd
    });
  }

  /**
   * Product Detail SEO with schema.org Product, Offer, and Breadcrumbs
   */
  setProductSeo(product: Product): void {
    const price = product.sale_price || product.price;
    const deptPath = product.department === 'jewellery' ? 'jewellery' : 'ethnics';
    const deptLabel = product.department === 'jewellery' ? 'Jewellery' : 'Ethnics';
    const canonical = `${this.defaultBaseUrl}/product/${product.slug}`;
    const primaryImg = product.images && product.images.length > 0 
      ? product.images[0].image_url 
      : this.defaultOgImage;

    const rawDesc = product.description 
      ? product.description.replace(/<[^>]*>?/gm, '').trim()
      : `Shop ${product.name} at Petals Ethnics and Jewellers. Premium quality ethnic wear and curated jewellery.`;
    const cleanDesc = rawDesc.length > 160 ? rawDesc.slice(0, 157) + '...' : rawDesc;

    // BreadcrumbList JSON-LD
    const breadcrumbItems: any[] = [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${this.defaultBaseUrl}/` },
      { '@type': 'ListItem', 'position': 2, 'name': deptLabel, 'item': `${this.defaultBaseUrl}/${deptPath}` }
    ];

    if (product.category) {
      breadcrumbItems.push({
        '@type': 'ListItem',
        'position': 3,
        'name': product.category.name,
        'item': `${this.defaultBaseUrl}/${deptPath}/${product.category.slug}`
      });
      breadcrumbItems.push({
        '@type': 'ListItem',
        'position': 4,
        'name': product.name,
        'item': canonical
      });
    } else {
      breadcrumbItems.push({
        '@type': 'ListItem',
        'position': 3,
        'name': product.name,
        'item': canonical
      });
    }

    const allImages = (product.images || []).map(img => img.image_url);
    if (allImages.length === 0) {
      allImages.push(primaryImg);
    }

    const productSchema: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': product.name,
      'image': allImages,
      'description': rawDesc,
      'brand': {
        '@type': 'Brand',
        'name': this.brandName
      },
      'offers': {
        '@type': 'Offer',
        'url': canonical,
        'priceCurrency': 'INR',
        'price': price,
        'priceValidUntil': '2027-12-31',
        'itemCondition': 'https://schema.org/NewCondition',
        'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        'seller': {
          '@type': 'Organization',
          'name': this.brandName
        }
      }
    };

    if (product.sku) {
      productSchema['sku'] = product.sku;
      productSchema['mpn'] = product.sku;
    }

    const jsonLd = [
      productSchema,
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbItems
      }
    ];

    this.setSeo({
      title: `${product.name} | Petals Ethnics and Jewellers`,
      description: cleanDesc,
      keywords: `${product.name}, ${product.category?.name || ''}, ${deptLabel}, buy ${product.name} online, Petals Ethnics and Jewellers`,
      canonicalUrl: canonical,
      robots: 'index, follow',
      ogImage: primaryImg,
      ogType: 'product',
      jsonLd
    });
  }

  /**
   * Info Pages SEO (About, Contact, Categories Discovery)
   */
  setPageSeo(title: string, description: string, path: string): void {
    const canonical = `${this.defaultBaseUrl}${path.startsWith('/') ? path : '/' + path}`;
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${this.defaultBaseUrl}/` },
        { '@type': 'ListItem', 'position': 2, 'name': title, 'item': canonical }
      ]
    };

    this.setSeo({
      title,
      description,
      canonicalUrl: canonical,
      robots: 'index, follow',
      jsonLd
    });
  }

  /**
   * Private / Utility Pages SEO (noindex, nofollow)
   * Applied to /admin, /cart, /wishlist, /checkout, /login, /register, /account
   */
  setNoIndex(pageTitle: string): void {
    this.titleService.setTitle(`${pageTitle} | ${this.brandName}`);
    this.metaService.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    this.removeCanonicalLink();
    this.removeJsonLd();
  }

  // --- Private Helpers ---

  private updateCanonicalLink(url: string): void {
    if (typeof document === 'undefined') return;
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private removeCanonicalLink(): void {
    if (typeof document === 'undefined') return;
    const link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (link && link.parentNode) {
      link.parentNode.removeChild(link);
    }
  }

  private setJsonLd(schema: object | object[]): void {
    if (typeof document === 'undefined') return;
    let script: HTMLScriptElement | null = this.document.getElementById('app-jsonld') as HTMLScriptElement;
    if (!script) {
      script = this.document.createElement('script');
      script.id = 'app-jsonld';
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }
    script.text = JSON.stringify(schema, null, 2);
  }

  private removeJsonLd(): void {
    if (typeof document === 'undefined') return;
    const script = this.document.getElementById('app-jsonld');
    if (script && script.parentNode) {
      script.parentNode.removeChild(script);
    }
  }
}
