import { Product, SizeOption } from './product.model';

export interface CartItem {
  id: string; // Unique combination key (e.g. productId_size_color)
  product: Product;
  selectedSize?: string | null;
  selectedColor?: string | null;
  selectedImage?: string | null;
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
