export const DEFAULT_FALLBACK_IMAGE = '/images/prod-kanjeevaram-saree.webp';

export interface ImageItem {
  image_url: string;
  is_primary?: boolean;
  display_order?: number;
}

const OPTIMIZED_IMAGE_MAP: Record<string, string> = {
  'https://i.ibb.co/7tQbhHpZ/Whats-App-Image-2026-08-13-at-12-31-11-PM-2.jpg': '/images/prod-kanjeevaram-saree.webp',
  'https://i.ibb.co/SDVwW6vy/Whats-App-Image-2026-08-13-at-12-31-11-PM.jpg': '/images/prod-cotton-kurti.webp',
  'https://i.ibb.co/ksFkWrhx/image.png': '/images/prod-kasavu-silk.webp',
  'https://i.ibb.co/chvqjqFZ/image.png': '/images/prod-coord-set.webp',
  'https://i.ibb.co/27MzMz7X/image.png': '/images/prod-anarkali-set.webp',
  'https://i.ibb.co/WLLgp05/image.png': '/images/prod-slub-kurti.webp',
  'https://i.ibb.co/xKv6CbTm/Whats-App-Image-2026-08-13-at-12-31-10-PM-2.jpg': '/images/prod-floral-kurti.webp',
  'https://i.ibb.co/1fFmfKNH/Whats-App-Image-2026-08-13-at-12-31-10-PM-1.jpg': '/images/prod-midi-dress.webp'
};

/**
 * Maps raw image URLs to high-performance optimized WebP static assets
 */
export function getOptimizedProductImageUrl(rawUrl: string | null | undefined): string {
  if (!rawUrl) return DEFAULT_FALLBACK_IMAGE;
  const clean = rawUrl.trim();
  if (OPTIMIZED_IMAGE_MAP[clean]) {
    return OPTIMIZED_IMAGE_MAP[clean];
  }
  return clean;
}

/**
 * Checks if a given string is an ImgBB webpage/share URL (e.g. https://ibb.co/XXXXXX)
 * rather than a direct image resource (e.g. https://i.ibb.co/XXXXXX/image.jpg).
 */
export function isIbbShareUrl(rawUrl: string | null | undefined): boolean {
  if (!rawUrl) return false;
  const str = rawUrl.trim();
  return /^https?:\/\/(www\.)?ibb\.co\//i.test(str);
}

/**
 * Sanitizes an image URL and returns the optimized high-performance asset
 */
export function sanitizeImageUrl(rawUrl: string | null | undefined): string {
  if (!rawUrl) return '';
  return getOptimizedProductImageUrl(rawUrl);
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
 * Generates an optimized responsive image URL.
 */
export function getResponsiveImageUrl(url: string | null | undefined, width: number): string {
  if (!url) return DEFAULT_FALLBACK_IMAGE;
  const cleanUrl = getOptimizedProductImageUrl(url);
  return cleanUrl;
}
