import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ReviewService } from '../../services/review.service';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../../models/product.model';
import { WishlistHeartButtonComponent } from '../shared/wishlist-heart-button/wishlist-heart-button.component';
import { StarRatingComponent } from '../shared/star-rating/star-rating.component';
import { ProductReviewsComponent } from '../product-reviews/product-reviews.component';
import { ProductDetailSkeletonComponent } from '../shared/skeletons/product-detail-skeleton.component';
import { ProductImageGalleryComponent } from '../shared/product-image-gallery/product-image-gallery.component';
import { OptimizedImageComponent } from '../shared/optimized-image/optimized-image.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    CustomCurrencyPipe,
    WishlistHeartButtonComponent,
    StarRatingComponent,
    ProductReviewsComponent,
    ProductDetailSkeletonComponent,
    ProductImageGalleryComponent,
    OptimizedImageComponent,
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  protected readonly tabOptions = ['description', 'specs', 'care', 'reviews'] as const;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly reviewService = inject(ReviewService);
  private readonly toastr = inject(ToastrService);

  protected readonly product = signal<Product | undefined>(undefined);
  protected readonly quantity = signal<number>(1);
  protected readonly selectedSize = signal<string>('');
  protected readonly selectedColor = signal<string>('');
  protected readonly selectedTab = signal<'description' | 'specs' | 'care' | 'reviews'>('description');
  protected readonly openAccordion = signal<'delivery' | 'returns' | null>('delivery');
  protected readonly openMobileSection = signal<string | null>('description');
  protected readonly relatedProducts = signal<Product[]>([]);
  protected readonly recentlyViewed = signal<Product[]>([]);
  protected readonly isPageLoading = signal(true);

  private loadTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly reviewStats = computed(() => {
    const id = this.product()?.id;
    if (!id) {
      return null;
    }
    return this.reviewService.getReviewStats(id);
  });

  protected readonly galleryBadges = computed(() => {
    const p = this.product();
    if (!p) {
      return {};
    }
    return { isNew: p.isNew, discount: p.discount, inStock: p.inStock };
  });

  protected get displayRating(): number {
    const stats = this.reviewStats();
    if (stats && stats.totalCount > 0) {
      return stats.averageRating;
    }
    return this.product()?.rating || 0;
  }

  protected get displayReviewCount(): number {
    const stats = this.reviewStats();
    if (stats && stats.totalCount > 0) {
      return stats.totalCount;
    }
    return this.product()?.reviewCount || 0;
  }

  protected get roundedRating(): number {
    return Math.round(this.displayRating);
  }

  protected get lineTotal(): number {
    return (this.product()?.price || 0) * this.quantity();
  }

  public ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this)).subscribe(params => {
      const id = params.get('id');
      if (!id) {
        void this.router.navigate(['/products']);
        return;
      }

      this.isPageLoading.set(true);
      if (this.loadTimer) {
        clearTimeout(this.loadTimer);
      }

      const prod = this.productService.getProductById(id);
      if (!prod) {
        this.product.set(undefined);
        this.isPageLoading.set(false);
        return;
      }

      this.product.set(prod);
      this.selectedSize.set(prod.sizes?.[0] || '');
      this.selectedColor.set(prod.colors?.[0] || '');

      this.relatedProducts.set(
        this.productService.getProductsByCategory(prod.category).filter(item => item.id !== prod.id).slice(0, 4)
      );

      const saved = this.getRecentlyViewed();
      const updated = [prod.id, ...saved.filter(item => item !== prod.id)].slice(0, 5);
      this.setRecentlyViewed(updated);
      this.recentlyViewed.set(
        updated
          .map(itemId => this.productService.getProductById(itemId))
          .filter((item): item is Product => !!item)
          .slice(0, 4)
      );

      this.loadTimer = setTimeout(() => this.isPageLoading.set(false), 450);
    });
  }

  public ngOnDestroy(): void {
    if (this.loadTimer) {
      clearTimeout(this.loadTimer);
    }
  }

  protected toggleAccordion(section: 'delivery' | 'returns'): void {
    this.openAccordion.update(current => (current === section ? null : section));
  }

  protected toggleMobileSection(section: string): void {
    this.openMobileSection.update(current => (current === section ? null : section));
  }

  protected isMobileSectionOpen(section: string): boolean {
    return this.openMobileSection() === section;
  }

  protected selectTab(tab: 'description' | 'specs' | 'care' | 'reviews'): void {
    this.selectedTab.set(tab);
    this.openMobileSection.set(tab);
  }

  protected mobileSectionLabel(tab: string): string {
    const labels: Record<string, string> = {
      description: 'Description',
      specs: 'Specifications',
      care: 'Care Instructions',
      reviews: 'Reviews',
    };
    return labels[tab] ?? tab;
  }

  protected updateSize(size: string): void {
    this.selectedSize.set(size);
  }

  protected updateColor(color: string): void {
    this.selectedColor.set(color);
  }

  protected increaseQty(): void {
    const limit = this.product()?.stockQuantity || 99;
    if (this.quantity() < limit) {
      this.quantity.update(q => q + 1);
    }
  }

  protected decreaseQty(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  protected addToCart(): void {
    const prod = this.product();
    if (prod) {
      this.cartService.addToCart(prod, this.quantity());
      this.toastr.success(`${this.quantity()}× ${prod.name} added to cart`, 'Item Added');
    }
  }

  protected get shareUrl(): string {
    return typeof window !== 'undefined' ? window.location.href : '';
  }

  protected get shareText(): string {
    return encodeURIComponent(this.product()?.name || 'The Twisted Threads');
  }

  protected getWhatsAppUrl(): string {
    return `https://api.whatsapp.com/send?text=${this.shareText}%20${encodeURIComponent(this.shareUrl)}`;
  }

  protected getFacebookUrl(): string {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.shareUrl)}`;
  }

  protected getPinterestUrl(): string {
    return `https://pinterest.com/pin/create/bookmarklet/?url=${encodeURIComponent(this.shareUrl)}&description=${this.shareText}`;
  }

  private getRecentlyViewed(): string[] {
    try {
      return JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    } catch {
      return [];
    }
  }

  private setRecentlyViewed(items: string[]): void {
    try {
      localStorage.setItem('recentlyViewed', JSON.stringify(items));
    } catch {
      // ignore
    }
  }
}
