import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';
import { CartItem } from '../models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly itemsSignal = signal<CartItem[]>([]);

  // Exposed read-only state
  public readonly items = this.itemsSignal.asReadonly();

  // Computed totals
  public readonly totalItems = computed(() => {
    return this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0);
  });

  public readonly totalPrice = computed(() => {
    return this.itemsSignal().reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  });

  public addToCart(product: Product, quantity = 1): void {
    const currentItems = this.itemsSignal();
    const existingIndex = currentItems.findIndex(item => item.product.id === product.id);

    if (existingIndex > -1) {
      const updated = currentItems.map((item, idx) => {
        if (idx === existingIndex) {
          const newQty = item.quantity + quantity;
          return {
            ...item,
            quantity: Math.min(newQty, product.stockQuantity)
          };
        }
        return item;
      });
      this.itemsSignal.set(updated);
    } else {
      this.itemsSignal.set([...currentItems, { product, quantity: Math.min(quantity, product.stockQuantity) }]);
    }
  }

  public removeFromCart(productId: string): void {
    this.itemsSignal.set(this.itemsSignal().filter(item => item.product.id !== productId));
  }

  public updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const updated = this.itemsSignal().map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          quantity: Math.min(quantity, item.product.stockQuantity)
        };
      }
      return item;
    });
    this.itemsSignal.set(updated);
  }

  public clearCart(): void {
    this.itemsSignal.set([]);
  }
}
