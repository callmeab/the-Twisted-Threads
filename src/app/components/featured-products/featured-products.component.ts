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
import { listStaggerAnimation, skeletonShimmerAnimation } from '../../animations/animations';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-featured-products',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    CustomCurrencyPipe
  ],
  animations: [listStaggerAnimation, skeletonShimmerAnimation],
  templateUrl: './featured-products.component.html',
  styleUrl: './featured-products.component.scss'
})
export class FeaturedProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly toastr = inject(ToastrService);

  // States
  isLoading = signal<boolean>(true);
  products = signal<Product[]>([]);
  wishlistedIds = signal<Set<string>>(new Set());

  // Mock loading skeletons array
  skeletons = Array(4).fill(0);

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

  toggleWishlist(product: Product, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    
    this.wishlistedIds.update(set => {
      const newSet = new Set(set);
      if (newSet.has(product.id)) {
        newSet.delete(product.id);
        this.toastr.info(`${product.name} removed from wishlist.`);
      } else {
        newSet.add(product.id);
        this.toastr.success(`${product.name} added to wishlist.`);
      }
      return newSet;
    });
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
