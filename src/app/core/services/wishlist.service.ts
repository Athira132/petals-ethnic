import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { AuthService, purgeLegacyStorage } from './auth.service';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistSubject = new BehaviorSubject<Product[]>([]);
  public wishlist$: Observable<Product[]> = this.wishlistSubject.asObservable();

  private currentUserId: string | null = null;
  private isSyncingBackend = false;

  constructor(
    private authService: AuthService,
    private supabaseService: SupabaseService
  ) {
    // Purge legacy storage keys
    purgeLegacyStorage();

    // Subscribe to authentication state for strict user isolation
    this.authService.currentUser$.subscribe(async (user) => {
      if (user) {
        const newUserId = user.id;
        if (this.currentUserId !== newUserId) {
          this.currentUserId = newUserId;
          await this.loadWishlistForUser(newUserId);
        }
      } else {
        // User logged out / guest
        const prevUserId = this.currentUserId;
        this.currentUserId = null;
        if (prevUserId && typeof window !== 'undefined' && window.localStorage) {
          try {
            localStorage.removeItem(`wishlist_${prevUserId}`);
          } catch (_) {}
        }
        // Wishlist must start completely empty for unauthenticated visitors
        this.wishlistSubject.next([]);
      }
    });
  }

  private getUserStorageKey(userId: string): string {
    return `wishlist_${userId}`;
  }

  private async loadWishlistForUser(userId: string): Promise<void> {
    // 1. Check user-specific storage for instant UI response
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(this.getUserStorageKey(userId));
        if (stored) {
          const items: Product[] = JSON.parse(stored);
          if (Array.isArray(items)) {
            this.wishlistSubject.next(items);
          }
        }
      } catch (e) {
        console.warn('Error reading user wishlist cache:', e);
      }
    }

    // 2. Fetch authoritative wishlist from database backend
    try {
      const token = await this.authService.getAccessToken();
      if (!token) return;

      const res = await fetch(`/api/wishlist?userId=${encodeURIComponent(userId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          this.wishlistSubject.next(data.items);
          this.saveWishlistToUserStorage(userId, data.items);
        }
      }
    } catch (err) {
      console.warn('Error fetching user wishlist from backend:', err);
    }
  }

  private saveWishlistToUserStorage(userId: string, items: Product[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(this.getUserStorageKey(userId), JSON.stringify(items));
      } catch (e) {
        console.warn('Error saving user wishlist cache:', e);
      }
    }
  }

  private async persistWishlistToBackend(userId: string, productId: string, action: 'add' | 'remove'): Promise<void> {
    if (!userId || this.isSyncingBackend) return;
    this.isSyncingBackend = true;

    try {
      const token = await this.authService.getAccessToken();
      if (!token) return;

      // 1. Sync through secure API endpoint with server verification
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, productId, action })
      });

      // 2. Also sync to database public.wishlist table directly via Supabase client if possible
      try {
        if (action === 'add') {
          await this.supabaseService.supabase
            .from('wishlist')
            .upsert({ user_id: userId, product_id: productId }, { onConflict: 'user_id,product_id' });
        } else {
          await this.supabaseService.supabase
            .from('wishlist')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId);
        }
      } catch (dbErr) {
        // Table sync note (handled via serverless API)
      }
    } catch (e) {
      console.warn('Backend wishlist persistence note:', e);
    } finally {
      this.isSyncingBackend = false;
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

    let updated: Product[];
    let added: boolean;

    if (exists) {
      updated = current.filter(p => p.id !== product.id);
      added = false;
    } else {
      updated = [product, ...current];
      added = true;
    }

    this.wishlistSubject.next(updated);

    if (this.currentUserId) {
      this.saveWishlistToUserStorage(this.currentUserId, updated);
      this.persistWishlistToBackend(this.currentUserId, product.id, added ? 'add' : 'remove');
    }

    return added;
  }

  public removeFromWishlist(productId: string): void {
    if (!productId) return;
    const current = this.wishlistSubject.value;
    const updated = current.filter(p => p.id !== productId);
    this.wishlistSubject.next(updated);

    if (this.currentUserId) {
      this.saveWishlistToUserStorage(this.currentUserId, updated);
      this.persistWishlistToBackend(this.currentUserId, productId, 'remove');
    }
  }

  public getItems(): Product[] {
    return this.wishlistSubject.value;
  }

  public clearStateOnLogout(): void {
    if (this.currentUserId && typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(this.getUserStorageKey(this.currentUserId));
      } catch (_) {}
    }
    this.currentUserId = null;
    this.wishlistSubject.next([]);
  }
}
