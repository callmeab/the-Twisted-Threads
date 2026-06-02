import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private productService = inject(ProductService);

  products = computed(() => this.productService.getAllProducts());

  stats = computed(() => {
    const all = this.products();
    const totalProducts  = all.length;
    const inStock        = all.filter(p => p.inStock).length;
    const outOfStock     = all.filter(p => !p.inStock).length;
    const totalStock     = all.reduce((sum, p) => sum + (p.stockQuantity ?? 0), 0);
    const newArrivals    = all.filter(p => p.isNew).length;
    const featured       = all.filter(p => p.isFeatured).length;
    const avgRating      = all.length
      ? (all.reduce((s, p) => s + (p.rating ?? 0), 0) / all.length).toFixed(1)
      : '0.0';
    return { totalProducts, inStock, outOfStock, totalStock, newArrivals, featured, avgRating };
  });

  cards = computed(() => [
    { label: 'Total Products',   value: this.stats().totalProducts,   icon: 'inventory_2',    color: 'indigo' },
    { label: 'Total Stock Units',value: this.stats().totalStock,       icon: 'warehouse',      color: 'teal'   },
    { label: 'In Stock',         value: this.stats().inStock,          icon: 'check_circle',   color: 'green'  },
    { label: 'Out of Stock',     value: this.stats().outOfStock,       icon: 'cancel',         color: 'red'    },
    { label: 'New Arrivals',     value: this.stats().newArrivals,      icon: 'new_releases',   color: 'rose'   },
    { label: 'Featured',         value: this.stats().featured,         icon: 'star',           color: 'amber'  },
    { label: 'Avg Rating',       value: this.stats().avgRating + ' ★', icon: 'grade',          color: 'gold'   },
  ]);

  recentProducts = computed(() =>
    [...this.products()]
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 5)
  );
}
