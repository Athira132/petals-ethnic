import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, CartSummary } from '../models/cart.model';
import { Product, SizeOption } from '../models/product.model';

const CART_STORAGE_KEY = 'petals_ethnic_cart_v1';
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
    shipping: STANDARD_SHIPPING_FEE,
    discount: 0,
    grandTotal: STANDARD_SHIPPING_FEE,
    totalQuantity: 0
  });
  public cartSummary$: Observable<CartSummary> = this.cartSummarySubject.asObservable();

  constructor() {
    this.loadCartFromStorage();
  }

  private loadCartFromStorage(): void {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const items: CartItem[] = JSON.parse(stored);
        this.cartItemsSubject.next(items);
        this.calculateSummary(items);
      }
    } catch (e) {
      console.error('Error loading cart from storage:', e);
      this.cartItemsSubject.next([]);
    }
  }

  private saveCartToStorage(items: CartItem[]): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart to storage:', e);
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
    const grandTotal = subtotal + shipping - discount;

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

  public addToCart(product: Product, size: SizeOption, quantity = 1): void {
    const items = [...this.currentItems];
    const itemId = `${product.id}_${size}`;
    const existingIndex = items.findIndex(i => i.id === itemId);

    const price = product.sale_price && product.sale_price > 0 ? product.sale_price : product.price;

    // Check size stock
    const sizeConfig = product.sizes?.find(s => s.size === size);
    const maxAvailable = sizeConfig ? sizeConfig.stock : product.stock;

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
        throw new Error(`Size ${size} is currently out of stock.`);
      }
      items.push({
        id: itemId,
        product,
        selectedSize: size,
        quantity: initialQty,
        unitPrice: price,
        totalPrice: price * initialQty
      });
    }

    this.cartItemsSubject.next(items);
    this.saveCartToStorage(items);
    this.calculateSummary(items);
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
    this.saveCartToStorage(items);
    this.calculateSummary(items);
  }

  public removeFromCart(itemId: string): void {
    const items = this.currentItems.filter(i => i.id !== itemId);
    this.cartItemsSubject.next(items);
    this.saveCartToStorage(items);
    this.calculateSummary(items);
  }

  public clearCart(): void {
    this.cartItemsSubject.next([]);
    localStorage.removeItem(CART_STORAGE_KEY);
    this.calculateSummary([]);
  }
}
