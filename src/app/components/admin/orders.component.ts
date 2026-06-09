import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { RouterLink } from '@angular/router';
import { OrderModel, OrderStatus, PaymentMethod, PaymentStatus } from '../../models/order.model';
import { ToastrService } from 'ngx-toastr';
import { AdminAuditService } from '../../services/admin-audit.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="admin-orders container-premium">
    <h1>Orders</h1>
    <div class="filters">
      <input placeholder="Search by order # or customer" [(ngModel)]="q" />
      <select [(ngModel)]="filterStatus">
        <option value="">All statuses</option>
        <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
      </select>
      <select [(ngModel)]="filterPayment">
        <option value="">All payments</option>
        <option *ngFor="let p of payments" [value]="p">{{ p }}</option>
      </select>
      <input type="date" [(ngModel)]="from" />
      <input type="date" [(ngModel)]="to" />
      <button (click)="exportCsv()">Export CSV</button>
    </div>

    <table class="orders-table">
      <thead>
        <tr>
          <th>Order #</th>
          <th>Customer</th>
          <th>Date</th>
          <th>Total</th>
          <th>Payment</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let o of filteredOrders()">
          <td><a [routerLink]="['/admin/orders', o.orderId]">{{ o.orderNumber }}</a></td>
          <td>{{ o.customerInfo.fullName }}</td>
          <td>{{ o.createdAt | date:'short' }}</td>
          <td>{{ o.total | currency:'PKR' }}</td>
          <td>{{ o.paymentMethod }}</td>
          <td>
            <select [ngModel]="o.status" (ngModelChange)="changeStatus(o, $event)">
              <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
            </select>
          </td>
          <td>
            <button (click)="approvePayment(o)">Approve</button>
            <button (click)="rejectPayment(o)">Reject</button>
            <button (click)="requestClarify(o)">Request Clarification</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `,
  styles: [
    `.filters{display:flex;gap:.5rem;align-items:center;margin-bottom:1rem}`,
    `.orders-table{width:100%;border-collapse:collapse}`,
    `.orders-table th,.orders-table td{padding:.5rem;border:1px solid #eee}`
  ]
})
export class AdminOrdersComponent implements OnInit {
  orders: OrderModel[] = [];
  q = '';
  filterStatus: OrderStatus | '' = '';
  filterPayment: PaymentMethod | '' = '';
  from: string | null = null;
  to: string | null = null;
  statuses: OrderStatus[] = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];
  payments: PaymentMethod[] = ['COD','BANK_TRANSFER'];

  constructor(private orderService: OrderService, private toastr: ToastrService, private audit: AdminAuditService) {}

  ngOnInit(): void {
    this.orders = this.orderService.getAllOrders();
  }

  filteredOrders(): OrderModel[] {
    return this.orders.filter(o => {
      if (this.q) {
        const norm = this.q.toLowerCase();
        if (!o.orderNumber.toLowerCase().includes(norm) && !o.customerInfo.fullName.toLowerCase().includes(norm)) return false;
      }
      if (this.filterStatus && o.status !== this.filterStatus) return false;
      if (this.filterPayment && o.paymentMethod !== this.filterPayment) return false;
      if (this.from) {
        const fromD = new Date(this.from);
        if (o.createdAt < fromD) return false;
      }
      if (this.to) {
        const toD = new Date(this.to);
        toD.setHours(23,59,59,999);
        if (o.createdAt > toD) return false;
      }
      return true;
    });
  }

  async changeStatus(o: OrderModel, status: OrderStatus) {
    const updated = await this.orderService.updateOrderStatus(o.orderId, status);
    if (updated) {
      this.toastr.success('Order status updated', 'Updated');
      this.orders = this.orderService.getAllOrders();
      this.audit.log('update_status', { orderNumber: updated.orderNumber, status });
    }
  }

  async approvePayment(o: OrderModel) {
    const updated = await this.orderService.verifyPayment(o.orderId);
    if (updated) {
      this.toastr.success('Payment verified', 'Payment');
      this.orders = this.orderService.getAllOrders();
      this.audit.log('approve_payment', { orderNumber: updated.orderNumber });
    }
  }

  async rejectPayment(o: OrderModel) {
    const updated = await this.orderService.setPaymentStatus(o.orderId, 'FAILED');
    if (updated) {
      this.toastr.warning('Payment rejected', 'Payment');
      this.orders = this.orderService.getAllOrders();
      this.audit.log('reject_payment', { orderNumber: updated.orderNumber });
    }
  }

  requestClarify(o: OrderModel) {
    this.toastr.info('Clarification request noted for customer follow-up.', 'Requested');
    this.audit.log('request_clarification', { orderNumber: o.orderNumber });
  }

  exportCsv() {
    const rows = this.filteredOrders().map(o => ({
      orderNumber: o.orderNumber,
      customer: o.customerInfo.fullName,
      email: o.customerInfo.email,
      date: o.createdAt.toISOString(),
      total: o.total,
      paymentMethod: o.paymentMethod,
      status: o.status,
    }));
    const header = Object.keys(rows[0] || {}).join(',');
    const csv = [header, ...rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    // Use a simple download method
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
