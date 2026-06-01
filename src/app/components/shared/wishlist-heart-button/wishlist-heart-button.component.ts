import { Component, computed, inject, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { ProductModel } from '../../../models/product.model';
import { WishlistService } from '../../../services/wishlist.service';

@Component({
  selector: 'app-wishlist-heart-button',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './wishlist-heart-button.component.html',
  styleUrl: './wishlist-heart-button.component.scss',
})
export class WishlistHeartButtonComponent {
  public readonly product = input.required<ProductModel>();
  /** Extra CSS classes for positioning (e.g. absolute top-4 right-4) */
  public readonly buttonClass = input('');
  public readonly variant = input<'floating' | 'inline'>('floating');
  public readonly ariaLabel = input('Toggle wishlist');

  private readonly wishlistService = inject(WishlistService);
  private readonly toastr = inject(ToastrService);

  protected readonly isAnimating = signal(false);

  protected readonly isInWishlist = computed(() =>
    this.wishlistService.isInWishlist(this.product().id)
  );

  protected toggle(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    const product = this.product();
    const nowInWishlist = this.wishlistService.toggle(product.id);

    this.isAnimating.set(true);
    setTimeout(() => this.isAnimating.set(false), 450);

    if (nowInWishlist) {
      this.toastr.success(`${product.name} added to your wishlist.`, 'Saved to wishlist');
    } else {
      this.toastr.info(`${product.name} removed from your wishlist.`, 'Removed');
    }
  }
}
