import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { register } from 'swiper/element/bundle';
import { FeaturedProductsComponent } from '../featured-products/featured-products.component';

// Register Swiper Custom Elements
register();

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FeaturedProductsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);

  protected readonly featuredProducts = this.productService.getProducts();

  // Scroll offset for parallax hero transition
  scrollY = signal<number>(0);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrollY.set(window.scrollY);
  }

  // Auto-scroll helper for the down-indicator arrow
  scrollToFeatured() {
    const nextSection = document.getElementById('featured-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  protected addToCart(product: any): void {
    this.cartService.addToCart(product);
  }
}
