import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ToastrService } from 'ngx-toastr';
import { trigger, transition, style, animate } from '@angular/animations';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { ProductModel } from '../../models/product.model';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';
import { WishlistHeartButtonComponent } from '../shared/wishlist-heart-button/wishlist-heart-button.component';
import { listStaggerAnimation } from '../../animations/animations';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    MatCardModule,
    CustomCurrencyPipe,
    WishlistHeartButtonComponent,
  ],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss',
  animations: [
    listStaggerAnimation,
    trigger('itemLeave', [
      transition(':leave', [
        animate(
          '280ms ease-in',
          style({ opacity: 0, transform: 'scale(0.95)', height: 0, margin: 0, padding: 0 })
        ),
      ]),
    ]),
  ],
})
export class WishlistComponent implements OnInit {
  private readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);
  private readonly toastr = inject(ToastrService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly items = this.wishlistService.items;
  protected readonly isSharing = signal(false);
  protected readonly removingId = signal<string | null>(null);

  public ngOnInit(): void {
    const share = this.route.snapshot.queryParamMap.get('share');
    if (!share) {
      return;
    }

    let added = 0;
    share.split(',').forEach(id => {
      const trimmed = id.trim();
      if (trimmed && this.wishlistService.add(trimmed)) {
        added++;
      }
    });

    if (added > 0) {
      this.toastr.success(`${added} item(s) from the shared link were added.`, 'Wishlist updated');
    }

    void this.router.navigate(['/wishlist'], { replaceUrl: true });
  }

  protected moveToCart(product: ProductModel): void {
    this.cartService.addToCart(product);
    this.toastr.success(`${product.name} moved to your cart.`, 'Added to cart');
  }

  protected removeItem(product: ProductModel): void {
    this.removingId.set(product.id);
    setTimeout(() => {
      this.wishlistService.remove(product.id);
      this.removingId.set(null);
    }, 200);
  }

  protected clearWishlist(): void {
    if (this.items().length === 0) {
      return;
    }
    this.wishlistService.clear();
    this.toastr.info('Your wishlist has been cleared.', 'Wishlist cleared');
  }

  protected async shareWishlist(): Promise<void> {
    const products = this.items();
    if (products.length === 0) {
      return;
    }

    this.isSharing.set(true);
    const ids = products.map(p => p.id).join(',');
    const origin = isPlatformBrowser(this.platformId) ? window.location.origin : '';
    const url = `${origin}/wishlist?share=${ids}`;
    const names = products.map(p => p.name).join(', ');
    const shareText = `My wishlist from The Twisted Threads: ${names}`;

    try {
      if (isPlatformBrowser(this.platformId) && navigator.share) {
        await navigator.share({
          title: 'My Twisted Threads Wishlist',
          text: shareText,
          url,
        });
      } else if (isPlatformBrowser(this.platformId)) {
        await navigator.clipboard.writeText(`${shareText}\n${url}`);
        this.toastr.success('Wishlist link copied to clipboard.', 'Link copied');
      }
    } catch {
      if (isPlatformBrowser(this.platformId)) {
        await navigator.clipboard.writeText(url);
        this.toastr.success('Wishlist link copied to clipboard.', 'Link copied');
      }
    } finally {
      this.isSharing.set(false);
    }
  }
}
