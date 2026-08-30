export const DEFAULT_FALLBACK_IMAGE = 'https://i.ibb.co/7tQbhHpZ/Whats-App-Image-2026-08-13-at-12-31-11-PM-2.jpg';

export interface ImageItem {
  image_url: string;
  is_primary?: boolean;
  display_order?: number;
}

/**
 * Checks if a given string is an ImgBB webpage/share URL (e.g. https://ibb.co/XXXXXX)
 * rather than a direct image resource (e.g. https://i.ibb.co/XXXXXX/image.jpg).
 */
export function isIbbShareUrl(rawUrl: string | null | undefined): boolean {
  if (!rawUrl) return false;
  const str = rawUrl.trim();
  // Matches ibb.co/ or www.ibb.co/ BUT NOT i.ibb.co/
  return /^https?:\/\/(www\.)?ibb\.co\//i.test(str);
}

/**
 * Sanitizes an image URL:
 * 1. Trims whitespace.
 * 2. Keeps valid direct image URLs (e.g. https://i.ibb.co/...) exactly as provided.
 * 3. Does NOT invent or transform ibb.co share URLs automatically.
 */
export function sanitizeImageUrl(rawUrl: string | null | undefined): string {
  if (!rawUrl) return '';
  return rawUrl.trim();
}

/**
 * Parses multiline string or array input into clean individual image URLs.
 */
export function parseImageUrlsInput(input: any): string[] {
  if (!input) return [];
  const urls: string[] = [];

  if (Array.isArray(input)) {
    for (const item of input) {
      urls.push(...parseImageUrlsInput(item));
    }
  } else if (typeof input === 'string') {
    // Split by newlines or commas in case multiline or CSV string is stored
    const lines = input.split(/[\r\n,]+/);
    for (const line of lines) {
      const clean = sanitizeImageUrl(line);
      if (clean && !urls.includes(clean)) {
        urls.push(clean);
      }
    }
  }

  return urls;
}

/**
 * Extract ALL valid product image URLs in order of preference:
 * 1. product.images table array
 * 2. product.image_url (main image)
 * 3. product.additional_image_urls (array or multiline string)
 */
export function extractProductImages(product: any): ImageItem[] {
  if (!product) return [{ image_url: DEFAULT_FALLBACK_IMAGE, is_primary: true }];

  const list: ImageItem[] = [];
  const addedUrls = new Set<string>();

  // 1. From joined product.images array
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const sorted = [...product.images].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    for (const img of sorted) {
      const clean = sanitizeImageUrl(img.image_url);
      if (clean && !addedUrls.has(clean)) {
        addedUrls.add(clean);
        list.push({
          image_url: clean,
          is_primary: img.is_primary || list.length === 0,
          display_order: img.display_order || list.length + 1
        });
      }
    }
  }

  // 2. From product.image_url
  if (product.image_url) {
    const mainUrls = parseImageUrlsInput(product.image_url);
    for (const u of mainUrls) {
      if (!addedUrls.has(u)) {
        addedUrls.add(u);
        list.push({
          image_url: u,
          is_primary: list.length === 0,
          display_order: list.length + 1
        });
      }
    }
  }

  // 3. From product.additional_image_urls
  if (product.additional_image_urls) {
    const addUrls = parseImageUrlsInput(product.additional_image_urls);
    for (const u of addUrls) {
      if (!addedUrls.has(u)) {
        addedUrls.add(u);
        list.push({
          image_url: u,
          is_primary: list.length === 0,
          display_order: list.length + 1
        });
      }
    }
  }

  if (list.length === 0) {
    return [{ image_url: DEFAULT_FALLBACK_IMAGE, is_primary: true, display_order: 1 }];
  }

  return list;
}

/**
 * Helper to handle (error) events on <img> elements cleanly without layout shift.
 */
export function handleImageError(event: Event, fallbackUrl: string = DEFAULT_FALLBACK_IMAGE) {
  const imgElement = event.target as HTMLImageElement;
  if (imgElement) {
    if (imgElement.src !== fallbackUrl) {
      imgElement.src = fallbackUrl;
    }
  }
}

/**
 * Generates an optimized responsive image URL using wsrv.nl image proxy.
 * This does not modify or replace the original image on ImgBB.
 * It dynamically resizes, converts to WebP, and serves from Cloudflare CDN cache.
 */
export function getResponsiveImageUrl(url: string | null | undefined, width: number): string {
  if (!url) return DEFAULT_FALLBACK_IMAGE;
  const cleanUrl = url.trim();
  if (!cleanUrl || cleanUrl.includes('localhost') || cleanUrl.startsWith('data:')) {
    return cleanUrl;
  }
  
  // For relative local assets (like /images/hero1.png), serve them directly (they benefit from Vercel's caching)
  if (cleanUrl.startsWith('/')) {
    return cleanUrl;
  }
  
  // Proxy external images through wsrv.nl for WebP formatting and specific width constraints
  const encodedUrl = encodeURIComponent(cleanUrl);
  return `https://images.weserv.nl/?url=${encodedUrl}&w=${width}&output=webp&q=85`;
}
