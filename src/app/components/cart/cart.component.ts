import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';
import { ToastrService } from 'ngx-toastr';
import { ProductModel } from '../../models/product.model';
import { CartSkeletonComponent } from '../shared/skeletons/cart-skeleton.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CustomCurrencyPipe, CartSkeletonComponent, MatIconModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  protected readonly cartService = inject(CartService);
  protected readonly productService = inject(ProductService);
  private readonly toastr = inject(ToastrService);

  protected readonly removingItem = signal<string | null>(null);
  protected readonly promoCode = signal('');
  protected readonly recentlyUpdated = signal(false);
  protected readonly isPageLoading = signal(true);
  protected readonly swipeOffsets = signal<Record<string, number>>({});

  private swipeStartX = 0;
  private activeSwipeId: string | null = null;

  protected readonly skeletonRowCount = computed(() =>
    Math.max(this.cartService.items().length, 2)
  );

  public ngOnInit(): void {
    setTimeout(() => this.isPageLoading.set(false), 400);
  }

  protected readonly recommendedProducts = computed(() =>
    this.productService
      .getFeaturedProducts()
      .filter(
        (product: ProductModel) =>
          !this.cartService.items().some(item => item.product.id === product.id)
      )
      .slice(0, 4)
  );

  protected get hasItems(): boolean {
    return this.cartService.items().length > 0;
  }

  protected get hasRecommendations(): boolean {
    return this.recommendedProducts().length > 0;
  }

  protected swipeTransform(itemId: string): string {
    const offset = this.swipeOffsets()[itemId] ?? 0;
    return `translateX(${offset}px)`;
  }

  protected onSwipeStart(itemId: string, event: TouchEvent): void {
    this.activeSwipeId = itemId;
    this.swipeStartX = event.touches[0].clientX;
  }

  protected onSwipeMove(itemId: string, event: TouchEvent): void {
    if (this.activeSwipeId !== itemId) {
      return;
    }
    const dx = event.touches[0].clientX - this.swipeStartX;
    const offset = Math.max(-88, Math.min(0, dx));
    this.swipeOffsets.update(map => ({ ...map, [itemId]: offset }));
  }

  protected onSwipeEnd(itemId: string, event: TouchEvent): void {
    if (this.activeSwipeId !== itemId) {
      return;
    }
    const offset = this.swipeOffsets()[itemId] ?? 0;
    const dx = event.changedTouches[0].clientX - this.swipeStartX;
    if (offset < -50 || dx < -50) {
      const item = this.cartService.items().find(i => i.id === itemId);
      if (item) {
        this.removeItem(itemId, item.product.name);
      }
    }
    this.swipeOffsets.update(map => {
      const next = { ...map };
      delete next[itemId];
      return next;
    });
    this.activeSwipeId = null;
  }

  protected refreshCart(): void {
    this.toastr.info('Cart totals refreshed.', 'Cart Updated');
    this.animateSummary();
  }

  protected removeItem(itemId: string, productName: string): void {
    if (this.removingItem() === itemId) {
      return;
    }

    this.removingItem.set(itemId);
    setTimeout(() => {
      this.cartService.removeFromCart(itemId);
      this.removingItem.set(null);
      this.toastr.warning(`${productName} removed from your cart.`, 'Item Removed');
      this.animateSummary();
    }, 250);
  }

  protected increaseQty(itemId: string, currentQty: number, stockLimit: number): void {
    if (currentQty < stockLimit) {
      this.cartService.updateQuantity(itemId, currentQty + 1);
      this.animateSummary();
    }
  }

  protected decreaseQty(itemId: string, currentQty: number): void {
    if (currentQty > 1) {
      this.cartService.updateQuantity(itemId, currentQty - 1);
      this.animateSummary();
    }
  }

  protected clearCart(): void {
    this.cartService.clearCart();
    this.toastr.info('All items removed from your shopping bag.', 'Bag Cleared');
    this.animateSummary();
  }

  protected applyPromo(): void {
    if (!this.promoCode().trim()) {
      this.toastr.warning('Enter a promo code to apply.', 'Promo Code');
      return;
    }

    this.toastr.success(`Promo code "${this.promoCode()}" applied.`, 'Promo Applied');
  }

  private animateSummary(): void {
    this.recentlyUpdated.set(true);
    setTimeout(() => this.recentlyUpdated.set(false), 300);
  }
}
