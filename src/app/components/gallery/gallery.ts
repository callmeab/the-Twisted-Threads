import { Component, inject, computed, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ProductModel } from '../../models/product.model';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss'
})
export class Gallery implements OnInit, OnDestroy {
  productService = inject(ProductService);
  products = this.productService.getProducts();

  // Target count of items in the 3D ring for a dense, immersive experience
  readonly ringItemCount = 36;

  carouselItems = computed(() => {
    const items = this.products();
    if (items.length === 0) return [];
    
    let result: ProductModel[] = [];
    while (result.length < this.ringItemCount) {
      result = result.concat(items);
    }
    return result.slice(0, this.ringItemCount);
  });
  
  radius = signal(1200); 

  private resizeListener = () => this.updateRadius();

  ngOnInit() {
    this.updateRadius();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.resizeListener);
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  updateRadius() {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth;
    if (w < 640) {
      this.radius.set(450); // Mobile radius
    } else if (w < 1024) {
      this.radius.set(750); // Tablet radius
    } else if (w < 1440) {
      this.radius.set(1000); // Desktop small
    } else {
      this.radius.set(1250); // Desktop large
    }
  }
}
