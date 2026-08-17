import { Product, SizeOption } from './product.model';

export interface CartItem {
  id: string; // Unique combination key (e.g. productId_size)
  product: Product;
  selectedSize: SizeOption;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  grandTotal: number;
  totalQuantity: number;
}
