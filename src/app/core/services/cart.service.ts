import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, CartSummary } from '../models/cart.model';
import { Product, SizeOption } from '../models/product.model';
import { AuthService, purgeLegacyStorage } from './auth.service';
import { SupabaseService } from './supabase.service';

const FREE_SHIPPING_THRESHOLD = 1499;
const STANDARD_SHIPPING_FEE = 99;

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$: Observable<CartItem[]> = this.cartItemsSubject.asObservable();

  private cartSummarySubject = new BehaviorSubject<CartSummary>({
    items: [],
    subtotal: 0,
    shipping: 0,
    discount: 0,
    grandTotal: 0,
    totalQuantity: 0
  });
  public cartSummary$: Observable<CartSummary> = this.cartSummarySubject.asObservable();

  private currentUserId: string | null = null;
  private isSyncingBackend = false;

  constructor(
    private authService: AuthService,
    private supabaseService: SupabaseService
  ) {
    // Purge any stale legacy global storage keys from previous implementations
    purgeLegacyStorage();

    // Subscribe to authentication state to enforce strict user isolation
    this.authService.currentUser$.subscribe(async (user) => {
      if (user) {
        const newUserId = user.id;
        if (this.currentUserId !== newUserId) {
          this.currentUserId = newUserId;
          await this.loadCartForUser(newUserId);
        }
      } else {
        // User is logged out / guest
        const prevUserId = this.currentUserId;
        this.currentUserId = null;
        if (prevUserId && typeof window !== 'undefined' && window.localStorage) {
          try {
            localStorage.removeItem(`cart_${prevUserId}`);
          } catch (_) {}
        }
        // Cart must start completely empty for unauthenticated users
        this.cartItemsSubject.next([]);
        this.calculateSummary([]);
      }
    });
  }

  private getUserStorageKey(userId: string): string {
    return `cart_${userId}`;
  }

  private async loadCartForUser(userId: string): Promise<void> {
    // 1. First, check user-specific storage for fast initial display
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(this.getUserStorageKey(userId));
        if (stored) {
          const items: CartItem[] = JSON.parse(stored);
          if (Array.isArray(items)) {
            this.cartItemsSubject.next(items);
            this.calculateSummary(items);
          }
        }
      } catch (e) {
        console.warn('Error reading user-specific cart storage:', e);
      }
    }

    // 2. Fetch authoritative database cart from backend
    try {
      const token = await this.authService.getAccessToken();
      if (!token) return;

      const res = await fetch(`/api/cart?userId=${encodeURIComponent(userId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          // If remote database has items, or if local was empty, use backend state
          this.cartItemsSubject.next(data.items);
          this.calculateSummary(data.items);
          this.saveCartToUserStorage(userId, data.items);
        }
      }
    } catch (err) {
      console.warn('Error fetching user cart from backend:', err);
    }
  }

  private saveCartToUserStorage(userId: string, items: CartItem[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(this.getUserStorageKey(userId), JSON.stringify(items));
      } catch (e) {
        console.warn('Error saving user cart to storage:', e);
      }
    }
  }

  private async persistCartToBackend(userId: string, items: CartItem[]): Promise<void> {
    if (!userId || this.isSyncingBackend) return;
    this.isSyncingBackend = true;

    try {
      const token = await this.authService.getAccessToken();
      if (!token) return;

      // 1. Sync through secure API with server-side authentication check
      await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, items })
      });

      // 2. Also sync to Supabase Auth metadata for instant client-side persistence
      await this.supabaseService.supabase.auth.updateUser({
        data: { cart: items }
      });
    } catch (e) {
      console.warn('Backend cart persistence note:', e);
    } finally {
      this.isSyncingBackend = false;
    }
  }

  private calculateSummary(items: CartItem[]): void {
    const subtotal = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

    let shipping = 0;
    if (items.length > 0) {
      shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    }
    const discount = 0;
    const grandTotal = items.length > 0 ? (subtotal + shipping - discount) : 0;

    const summary: CartSummary = {
      items,
      subtotal,
      shipping,
      discount,
      grandTotal,
      totalQuantity
    };

    this.cartSummarySubject.next(summary);
  }

  get currentItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  get currentSummary(): CartSummary {
    return this.cartSummarySubject.value;
  }

  public addToCart(product: Product, size?: SizeOption | string, quantity = 1, color?: string, customImage?: string): void {
    const items = [...this.currentItems];
    const resolvedSize = size || (product.has_size === false ? 'One Size' : 'Standard');
    const colorKey = color ? `_${color}` : '';
    const itemId = `${product.id}_${resolvedSize}${colorKey}`;
    const existingIndex = items.findIndex(i => i.id === itemId);

    const price = product.sale_price && product.sale_price > 0 ? product.sale_price : product.price;

    // Check stock
    let maxAvailable = product.stock;
    if (product.has_size !== false && size) {
      const sizeConfig = product.sizes?.find(s => s.size === size);
      if (sizeConfig) {
        maxAvailable = sizeConfig.stock;
      }
    }

    if (existingIndex > -1) {
      const newQty = items[existingIndex].quantity + quantity;
      if (newQty > maxAvailable) {
        items[existingIndex].quantity = maxAvailable;
      } else {
        items[existingIndex].quantity = newQty;
      }
      items[existingIndex].totalPrice = items[existingIndex].unitPrice * items[existingIndex].quantity;
    } else {
      const initialQty = Math.min(quantity, maxAvailable);
      if (initialQty <= 0) {
        throw new Error(`${product.name}${size ? ' (' + size + ')' : ''} is currently out of stock.`);
      }
      items.push({
        id: itemId,
        product,
        selectedSize: (product.has_size === false && (!size || size === 'One Size')) ? undefined : resolvedSize,
        selectedColor: color || undefined,
        selectedImage: customImage || undefined,
        quantity: initialQty,
        unitPrice: price,
        totalPrice: price * initialQty
      });
    }

    this.cartItemsSubject.next(items);
    this.calculateSummary(items);

    if (this.currentUserId) {
      this.saveCartToUserStorage(this.currentUserId, items);
      this.persistCartToBackend(this.currentUserId, items);
    }
  }

  public updateQuantity(itemId: string, newQuantity: number): void {
    let items = [...this.currentItems];
    const target = items.find(i => i.id === itemId);
    if (!target) return;

    if (newQuantity <= 0) {
      this.removeFromCart(itemId);
      return;
    }

    // Check max stock
    const sizeConfig = target.product.sizes?.find(s => s.size === target.selectedSize);
    const maxAvailable = sizeConfig ? sizeConfig.stock : target.product.stock;

    target.quantity = Math.min(newQuantity, maxAvailable);
    target.totalPrice = target.unitPrice * target.quantity;

    this.cartItemsSubject.next(items);
    this.calculateSummary(items);

    if (this.currentUserId) {
      this.saveCartToUserStorage(this.currentUserId, items);
      this.persistCartToBackend(this.currentUserId, items);
    }
  }

  public removeFromCart(itemId: string): void {
    const items = this.currentItems.filter(i => i.id !== itemId);
    this.cartItemsSubject.next(items);
    this.calculateSummary(items);

    if (this.currentUserId) {
      this.saveCartToUserStorage(this.currentUserId, items);
      this.persistCartToBackend(this.currentUserId, items);
    }
  }

  public clearCart(): void {
    this.cartItemsSubject.next([]);
    this.calculateSummary([]);

    if (this.currentUserId) {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.removeItem(this.getUserStorageKey(this.currentUserId));
        } catch (_) {}
      }
      this.persistCartToBackend(this.currentUserId, []);
    }
  }

  public clearStateOnLogout(): void {
    if (this.currentUserId && typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(this.getUserStorageKey(this.currentUserId));
      } catch (_) {}
    }
    this.currentUserId = null;
    this.cartItemsSubject.next([]);
    this.calculateSummary([]);
  }
}
