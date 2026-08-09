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
    {
      name: 'Beaded Necklaces',
      description: 'Intricate thread & bead necklaces, handcrafted to perfection',
      image: 'images/Beaded%20Necklaces.png',
      link: '/products',
      queryParams: { category: 'Necklaces' },
      icon: 'M12 2C9.5 2 7.2 3.2 5.8 5.1L4 4 2 6l2 2C3.4 9.2 3 10.6 3 12c0 5 4 9 9 9s9-4 9-9-4-9-9-9zm0 16c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7z',
      itemCount: 12,
      badge: 'Bestseller',
      gradient: 'linear-gradient(135deg, #B76E79 0%, #8B4A55 100%)'
    },
    {
      name: 'Woven Bracelets',
      description: 'Silk thread & charm bracelets with vibrant handwoven patterns',
      image: 'images/Woven%20Bracelets.png',
      link: '/products',
      queryParams: { category: 'Bracelets' },
      icon: 'M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z',
      itemCount: 18,
      badge: 'New Arrivals',
      gradient: 'linear-gradient(135deg, #D4AF37 0%, #B8960C 100%)'
    },
    {
      name: 'Pearl Earrings',
      description: 'Elegant drop & stud earrings with natural pearls & gems',
      image: 'images/Pearl%20Earrings.png',
      link: '/products',
      queryParams: { category: 'Earrings' },
      icon: 'M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z',
      itemCount: 9,
      badge: 'Trending',
      gradient: 'linear-gradient(135deg, #6B4E8A 0%, #4A2C6E 100%)'
    },
    {
      name: 'Custom Sets',
      description: 'Bespoke matching sets — designed uniquely for you',
      image: 'images/Custom%20Designs.png',
      link: '/products',
      queryParams: { category: 'Sets' },
      icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z',
      itemCount: 6,
      badge: 'Made to Order',
      gradient: 'linear-gradient(135deg, #2E7D52 0%, #1A5C38 100%)'
    }
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
