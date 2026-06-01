import { ProductModel } from './product.model';

export interface CartItem {
  id: string;
  product: ProductModel;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  addedAt: Date;
}

export interface CartModel {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export type Cart = CartModel;
