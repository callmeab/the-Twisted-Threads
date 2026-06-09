import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ProductModel } from '../models/product.model';
import { CartItem, CartModel } from '../models/cart.model';

interface CartOptions {
  selectedSize?: string;
  selectedColor?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly TAX_RATE = 0.08;
  private readonly SHIPPING_FEE = 250;
  private readonly FREE_SHIPPING_THRESHOLD = 5000;
  private readonly STORAGE_KEY = 'twistedThreadsCart';

  private readonly itemsSignal = signal<CartItem[]>(this.loadCartItems());
  public readonly items = this.itemsSignal.asReadonly();

  public readonly totalItems = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );

  public readonly subtotal = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

  public readonly tax = computed(() => parseFloat((this.subtotal() * this.TAX_RATE).toFixed(2)));

  public readonly shipping = computed(() => {
    const subtotal = this.subtotal();
    if (subtotal === 0) {
      return 0;
    }
    return subtotal >= this.FREE_SHIPPING_THRESHOLD ? 0 : this.SHIPPING_FEE;
  });

  public readonly total = computed(() =>
    parseFloat((this.subtotal() + this.tax() + this.shipping()).toFixed(2))
  );

  public readonly totalPrice = computed(() => this.total());

  private readonly cartSubject = new BehaviorSubject<CartModel>(this.buildCart());
  public readonly cart$: Observable<CartModel> = this.cartSubject.asObservable();

  constructor(private toastr: ToastrService) { }

  private loadCartItems(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as Array<Partial<CartItem>>;
      return parsed.map(item => ({
        id: item.id || this.createItemId(),
        product: item.product as ProductModel,
        quantity: item.quantity || 1,
        selectedSize: item.selectedSize || '',
        selectedColor: item.selectedColor || '',
        addedAt: item.addedAt ? new Date(item.addedAt) : new Date(),

        name: (item.product as ProductModel)?.name ?? '',
        price: (item.product as ProductModel)?.price ?? 0
      }));
    } catch {
      return [];
    }
  }

  private buildCart(): CartModel {
    const subtotal = this.subtotal();
    return {
      items: this.itemsSignal(),
      subtotal,
      tax: this.tax(),
      shipping: this.shipping(),
      total: this.total()
    };
  }

  private persistCart(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.itemsSignal()));
    } catch {
      // ignore storage failures
    }
    this.cartSubject.next(this.buildCart());
  }

  private createItemId(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? (crypto as any).randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  public addToCart(product: ProductModel, quantity = 1, options: CartOptions = {}): void {
    const selectedSize = options.selectedSize || '';
    const selectedColor = options.selectedColor || '';
    const currentItems = this.itemsSignal();

    const existingItem = currentItems.find(
      item =>
        item.product.id === product.id &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );

    if (existingItem) {
      const updatedItems = currentItems.map(item => {
        if (item.id !== existingItem.id) {
          return item;
        }

        return {
          ...item,
          quantity: Math.min(item.quantity + quantity, product.stockQuantity)
        };
      });
      this.itemsSignal.set(updatedItems);
      this.toastr.info(`Updated quantity for ${product.name} in cart.`, 'Cart Updated');
    } else {
      const item: CartItem = {
        id: this.createItemId(),
        product,
        quantity: Math.min(quantity, product.stockQuantity),
        selectedSize,
        selectedColor,
        addedAt: new Date(),
        name: '',
        price: 0
      };
      this.itemsSignal.set([...currentItems, item]);
      this.toastr.success(`${product.name} added to cart.`, 'Cart Updated');
    }

    this.persistCart();
  }

  public removeFromCart(itemId: string): void {
    const updatedItems = this.itemsSignal().filter(item => item.id !== itemId);
    this.itemsSignal.set(updatedItems);
    this.persistCart();
    this.toastr.warning('Item removed from cart.', 'Cart Updated');
  }

  public updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(itemId);
      return;
    }

    const updatedItems = this.itemsSignal().map(item => {
      if (item.id !== itemId) {
        return item;
      }

      return {
        ...item,
        quantity: Math.min(quantity, item.product.stockQuantity)
      };
    });

    this.itemsSignal.set(updatedItems);
    this.persistCart();
    this.toastr.info('Cart quantity updated.', 'Cart Updated');
  }

  public clearCart(): void {
    this.itemsSignal.set([]);
    this.persistCart();
    this.toastr.info('Cart has been cleared.', 'Cart Cleared');
  }

  public getCart(): CartModel {
    return this.cartSubject.getValue();
  }

  public getCartItemCount(): number {
    return this.totalItems();
  }

  public getCartTotal(): number {
    return this.total();
  }
}
