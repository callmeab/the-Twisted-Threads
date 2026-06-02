import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../../services/product.service';
import { ProductModel } from '../../../models/product.model';

@Component({
  selector: 'app-admin-products',
  imports: [CommonModule, MatIconModule],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css',
})
export class AdminProducts {
  private productService = inject(ProductService);

  search = signal('');
  filterCategory = signal('All');

  products = computed(() => this.productService.getAllProducts());

  categories = computed(() => ['All', ...new Set(this.products().map(p => p.category))]);

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    const cat = this.filterCategory();
    return this.products().filter(p => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchCat = cat === 'All' || p.category === cat;
      return matchSearch && matchCat;
    });
  });

  onSearch(e: Event) {
    this.search.set((e.target as HTMLInputElement).value);
  }
}
