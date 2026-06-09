import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../../services/product.service';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);

  products = this.productService.allProductsSignal;
  orders = this.orderService.orders;

  productStats = computed(() => {
    const all = this.products();
    return {
      totalProducts: all.length,
      activeProducts: all.filter(p => p.isActive).length,
      inStock: all.filter(p => p.inStock).length,
      outOfStock: all.filter(p => !p.inStock).length,
      newArrivals: all.filter(p => p.isNew).length,
      featured: all.filter(p => p.isFeatured).length,
    };
  });

  orderStats = computed(() => {
    const all = this.orders();
    const now = new Date();
    const thisMonth = all.filter(o => {
      const d = o.createdAt;
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return {
      total: all.length,
      pending: all.filter(o => o.status === 'PENDING').length,
      revenue: all.reduce((sum, o) => sum + o.total, 0),
      monthRevenue: thisMonth.reduce((sum, o) => sum + o.total, 0),
      monthOrders: thisMonth.length,
    };
  });

  cards = computed(() => [
    { label: 'Total Orders', value: this.orderStats().total, icon: 'receipt_long', color: 'indigo', link: '/admin/orders' },
    { label: 'Pending Orders', value: this.orderStats().pending, icon: 'hourglass_empty', color: 'amber', link: '/admin/orders' },
    { label: 'Revenue (All)', value: 'PKR ' + this.orderStats().revenue.toLocaleString(), icon: 'payments', color: 'gold', link: '/admin/orders' },
    { label: 'This Month', value: this.orderStats().monthOrders + ' orders', icon: 'calendar_month', color: 'teal', link: '/admin/orders' },
    { label: 'Products Live', value: this.productStats().activeProducts, icon: 'visibility', color: 'green', link: '/admin/products' },
    { label: 'In Stock', value: this.productStats().inStock, icon: 'check_circle', color: 'green', link: '/admin/products' },
    { label: 'Out of Stock', value: this.productStats().outOfStock, icon: 'cancel', color: 'red', link: '/admin/products' },
    { label: 'New Arrivals', value: this.productStats().newArrivals, icon: 'new_releases', color: 'rose', link: '/admin/products' },
  ]);

  recentOrders = computed(() =>
    [...this.orders()]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
  );

  recentProducts = computed(() =>
    [...this.products()]
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 5)
  );
}
