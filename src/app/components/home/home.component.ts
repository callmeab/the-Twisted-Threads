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

  // Mock data for new sections
  categories = [
    { name: 'Beaded Necklaces', image: 'images/Beaded%20Necklaces.png', link: '/products?category=necklaces' },
    { name: 'Woven Bracelets', image: 'images/Woven%20Bracelets.png', link: '/products?category=bracelets' },
    { name: 'Pearl Earrings', image: 'images/Pearl%20Earrings.png', link: '/products?category=earrings' },
    { name: 'Custom Designs', image: 'images/Custom%20Designs.png', link: '/products?category=custom' }
  ];

  testimonials = [
    {
      name: 'Elena R.',
      text: 'The craftsmanship is simply stunning. Every bead feels intentionally placed, and the custom necklace I received is my absolute favorite piece.',
      role: 'Verified Buyer'
    },
    {
      name: 'Sarah M.',
      text: 'I ordered a woven thread bracelet as a gift. The packaging was beautiful, and the quality of the thread and pearls is unmatched. Highly recommend!',
      role: 'Verified Buyer'
    },
    {
      name: 'Jessica T.',
      text: 'Beautiful handmade jewelry that truly stands out. You can feel the love and dedication poured into every piece.',
      role: 'Verified Buyer'
    }
  ];

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
