import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';
import { Product } from '../../models/product.model';
import { listStaggerAnimation } from '../../animations/animations';
import { ProductCardSkeletonComponent } from '../shared/skeletons/product-card-skeleton.component';
import { ProductQuickViewService } from '../../services/product-quick-view.service';
import { WishlistHeartButtonComponent } from '../shared/wishlist-heart-button/wishlist-heart-button.component';

@Component({
  selector: 'app-featured-products',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    CustomCurrencyPipe,
    WishlistHeartButtonComponent,
    ProductCardSkeletonComponent,
  ],
  animations: [listStaggerAnimation],
  templateUrl: './featured-products.component.html',
  styleUrl: './featured-products.component.scss'
})
export class FeaturedProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly quickViewService = inject(ProductQuickViewService);

  // States
  isLoading = signal<boolean>(true);
  products = signal<Product[]>([]);

  ngOnInit(): void {
    // Fetch products and simulate network loading shimmer for 1.2s
    const allProducts = this.productService.getProducts()();
    // Select first 4 products for the featured row
    this.products.set(allProducts.slice(0, 4));

    setTimeout(() => {
      this.isLoading.set(false);
    }, 1200);
  }

  addToCart(product: Product, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.cartService.addToCart(product);
  }

  openQuickView(product: Product, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.quickViewService.open(product);
  }

  // Resolve dynamic badges for product mockups
  getProductBadge(index: number): { text: string; type: 'new' | 'sale' } | null {
    if (index === 0 || index === 3) {
      return { text: 'New', type: 'new' };
    }
    if (index === 1) {
      return { text: 'Sale', type: 'sale' };
    }
    return null;
  }
}
