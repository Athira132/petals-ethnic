import { Injectable } from '@angular/core';

export type ImageStatus = 'not_loaded' | 'loading' | 'loaded' | 'failed';

@Injectable({
  providedIn: 'root'
})
export class ImageLoaderService {
  // Global application-level persistent image cache surviving SPA route transitions
  private cache = new Map<string, ImageStatus>();

  // Controlled 1-by-1 sequential loading queue
  private queue: string[] = [];
  private isProcessingQueue = false;
  private pendingCallbacks = new Map<string, Array<(success: boolean) => void>>();

  /**
   * Synchronously gets current cache status for an image URL
   */
  getStatus(url: string | null | undefined): ImageStatus {
    if (!url) return 'failed';
    const cleanUrl = url.trim();
    return this.cache.get(cleanUrl) || 'not_loaded';
  }

  isLoaded(url: string | null | undefined): boolean {
    return this.getStatus(url) === 'loaded';
  }

  markLoaded(url: string | null | undefined): void {
    if (!url) return;
    const cleanUrl = url.trim();
    this.cache.set(cleanUrl, 'loaded');
  }

  markFailed(url: string | null | undefined): void {
    if (!url) return;
    const cleanUrl = url.trim();
    this.cache.set(cleanUrl, 'failed');
  }

  /**
   * Enqueues an un-cached image URL for controlled sequential 1-by-1 loading.
   * Returns a promise that resolves when THIS SPECIFIC image has finished loading or failed.
   */
  loadSequentially(url: string | null | undefined): Promise<boolean> {
    if (!url) return Promise.resolve(false);
    const cleanUrl = url.trim();

    // 1. If ALREADY LOADED in persistent cache -> resolve immediately (0ms)!
    const currentStatus = this.getStatus(cleanUrl);
    if (currentStatus === 'loaded') {
      return Promise.resolve(true);
    }
    if (currentStatus === 'failed') {
      return Promise.resolve(false);
    }

    // 2. Otherwise enqueue for controlled 1-by-1 sequential processing
    return new Promise<boolean>((resolve) => {
      this.enqueue(cleanUrl, resolve);
    });
  }

  private enqueue(url: string, callback: (success: boolean) => void) {
    const currentStatus = this.cache.get(url);
    if (currentStatus === 'loaded') {
      callback(true);
      return;
    }
    if (currentStatus === 'failed') {
      callback(false);
      return;
    }

    if (!this.pendingCallbacks.has(url)) {
      this.pendingCallbacks.set(url, []);
      this.queue.push(url);
    }
    this.pendingCallbacks.get(url)!.push(callback);

    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    while (this.queue.length > 0) {
      const nextUrl = this.queue.shift()!;

      // Skip if already resolved
      if (this.cache.get(nextUrl) === 'loaded') {
        this.notifyCallbacks(nextUrl, true);
        continue;
      }
      if (this.cache.get(nextUrl) === 'failed') {
        this.notifyCallbacks(nextUrl, false);
        continue;
      }

      // Mark status as loading
      this.cache.set(nextUrl, 'loading');

      // Load ONE image at a time with safety timeout to ensure queue never stalls
      const success = await this.loadImageOneByOne(nextUrl);
      this.cache.set(nextUrl, success ? 'loaded' : 'failed');
      this.notifyCallbacks(nextUrl, success);
    }

    this.isProcessingQueue = false;
  }

  private notifyCallbacks(url: string, success: boolean) {
    const cbs = this.pendingCallbacks.get(url);
    if (cbs) {
      cbs.forEach(cb => cb(success));
      this.pendingCallbacks.delete(url);
    }
  }

  private loadImageOneByOne(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(true);
        return;
      }

      let done = false;
      const finish = (result: boolean) => {
        if (!done) {
          done = true;
          resolve(result);
        }
      };

      // 5-second max timeout fallback to guarantee queue NEVER stalls
      const timeoutTimer = setTimeout(() => {
        finish(false);
      }, 5000);

      const img = new Image();

      // ATTACH LISTENERS BEFORE SETTING SRC
      img.onload = () => {
        clearTimeout(timeoutTimer);
        finish(true);
      };
      img.onerror = () => {
        clearTimeout(timeoutTimer);
        finish(false);
      };

      // SET SRC AFTER LISTENERS ARE ATTACHED
      img.src = url;

      // Check if already completed synchronously by browser memory cache
      if (img.complete && img.naturalWidth > 0) {
        clearTimeout(timeoutTimer);
        finish(true);
      }
    });
  }
}
