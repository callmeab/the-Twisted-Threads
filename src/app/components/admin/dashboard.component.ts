import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { OrderModel } from '../../models/order.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="admin-dashboard container-premium">
    <h1>Admin Dashboard</h1>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Orders</h3>
        <p class="stat-value">{{ totalOrders }}</p>
      </div>
      <div class="stat-card">
        <h3>Pending Orders</h3>
        <p class="stat-value">{{ pendingOrders }}</p>
      </div>
      <div class="stat-card">
        <h3>Revenue</h3>
        <p class="stat-value">{{ revenue | currency:'PKR' }}</p>
      </div>
    </div>

    <div class="recent-orders">
      <h2>Recent Orders</h2>
      <ul>
        <li *ngFor="let o of recentOrders">
          <a [routerLink]="['/admin/orders', o.orderId]">{{ o.orderNumber }}</a>
          — {{ o.customerInfo.fullName }} — {{ o.total | currency:'PKR' }}
        </li>
      </ul>
      <a routerLink="/admin/orders">View all orders</a>
    </div>
  </div>
  `,
  styles: [
    `.stats-grid{display:flex;gap:1rem;margin:1rem 0}`,
    `.stat-card{background:var(--color-pearl);padding:1rem;border-radius:.5rem;flex:1}`,
    `.stat-value{font-size:1.35rem;font-weight:700}`
  ]
})
export class AdminDashboardComponent implements OnInit {
  totalOrders = 0;
  pendingOrders = 0;
  revenue = 0;
  recentOrders: OrderModel[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    const all = this.orderService.getAllOrders();
    this.totalOrders = all.length;
    this.pendingOrders = all.filter(o => o.status === 'PENDING').length;
    this.revenue = all.reduce((s, o) => s + (o.total || 0), 0);
    this.recentOrders = all.slice(0, 8);
  }
}
