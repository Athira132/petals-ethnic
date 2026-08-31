import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageLoaderService {
  private loadedUrls = new Set<string>();

  /**
   * Checks if an image URL is registered as fully loaded in our global runtime cache
   */
  isLoaded(url: string | null | undefined): boolean {
    if (!url) return false;
    return this.loadedUrls.has(url.trim());
  }

  /**
   * Registers an image URL as fully loaded
   */
  markLoaded(url: string | null | undefined): void {
    if (!url) return;
    this.loadedUrls.add(url.trim());
  }

  /**
   * Synchronously checks if the browser already has the image fully downloaded in memory/disk cache
   */
  checkImageLoadedInBrowser(url: string | null | undefined): boolean {
    if (!url || typeof window === 'undefined') return false;
    const cleanUrl = url.trim();
    if (this.loadedUrls.has(cleanUrl)) return true;

    try {
      const img = new Image();
      img.src = cleanUrl;
      if (img.complete && img.naturalWidth > 0) {
        this.loadedUrls.add(cleanUrl);
        return true;
      }
    } catch {
      // Ignore checks in non-browser environments
    }

    return false;
  }
}
