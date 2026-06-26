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
    { name: 'Beaded Necklaces', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800', link: '/products?category=necklaces' },
    { name: 'Woven Bracelets', image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=800', link: '/products?category=bracelets' },
    { name: 'Pearl Earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800', link: '/products?category=earrings' },
    { name: 'Custom Designs', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=800', link: '/products?category=custom' }
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
