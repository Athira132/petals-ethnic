export const DEFAULT_FALLBACK_IMAGE = 'https://i.ibb.co/7tQbhHpZ/Whats-App-Image-2026-08-13-at-12-31-11-PM-2.jpg';

export interface ImageItem {
  image_url: string;
  is_primary?: boolean;
  display_order?: number;
}

/**
 * Sanitizes an image URL:
 * 1. Trims whitespace.
 * 2. Converts ImgBB webpage/share URLs (e.g. https://ibb.co/xyz) to direct image URLs.
 * 3. Ensures valid HTTP/HTTPS protocol.
 */
export function sanitizeImageUrl(rawUrl: string | null | undefined): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  if (!url) return '';

  // Handle ImgBB webpage share URLs (https://ibb.co/XXXXXX -> https://i.ibb.co/XXXXXX/image.jpg)
  const ibbShareRegex = /^https?:\/\/(www\.)?ibb\.co\/([a-zA-Z0-9]+)\/?$/i;
  const match = url.match(ibbShareRegex);
  if (match) {
    const code = match[2];
    url = `https://i.ibb.co/${code}/image.jpg`;
  }

  return url;
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
