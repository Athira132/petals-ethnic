import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';

const WISHLIST_STORAGE_KEY = 'petal_wishlist_items';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistSubject = new BehaviorSubject<Product[]>([]);
  public wishlist$: Observable<Product[]> = this.wishlistSubject.asObservable();

  constructor() {
    this.loadWishlist();
  }

  private loadWishlist() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            this.wishlistSubject.next(parsed);
          }
        }
      } catch (e) {
        console.warn('Failed to load wishlist from storage:', e);
      }
    }
  }

  private saveWishlist(items: Product[]) {
    this.wishlistSubject.next(items);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn('Failed to save wishlist to storage:', e);
      }
    }
  }

  public isInWishlist(productId: string): boolean {
    if (!productId) return false;
    return this.wishlistSubject.value.some(p => p.id === productId);
  }

  public toggleWishlist(product: Product): boolean {
    if (!product || !product.id) return false;
    const current = this.wishlistSubject.value;
    const exists = current.some(p => p.id === product.id);

    if (exists) {
      this.saveWishlist(current.filter(p => p.id !== product.id));
      return false; // Removed
    } else {
      this.saveWishlist([product, ...current]);
      return true; // Added
    }
  }

  public removeFromWishlist(productId: string) {
    if (!productId) return;
    const current = this.wishlistSubject.value;
    this.saveWishlist(current.filter(p => p.id !== productId));
  }

  public getItems(): Product[] {
    return this.wishlistSubject.value;
  }
}
