import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { OrderModel } from '../../models/order.model';
import { ToastrService } from 'ngx-toastr';
import { AdminAuditService } from '../../services/admin-audit.service';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="admin-order-detail container-premium" *ngIf="order">
    <h1>Order {{ order.orderNumber }}</h1>
    <div class="order-meta">
      <p><strong>Date:</strong> {{ order.createdAt | date:'medium' }}</p>
      <p><strong>Status:</strong>
        <select [(ngModel)]="order.status" (change)="updateStatus(order.status)">
          <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
        </select>
      </p>
      <p><strong>Payment:</strong> {{ order.paymentMethod }} — {{ order.paymentStatus }}</p>
      <p><strong>Total:</strong> {{ order.total | currency:'PKR' }}</p>
    </div>

    <section class="customer-info">
      <h2>Customer Details</h2>
      <p>{{ order.customerInfo.fullName }}</p>
      // <p>{{ order.shippingAddress.email }}</p>
      <p>{{ order.customerInfo.phone }}</p>
      <p>{{ order.shippingAddress.addressLine1 }}, {{ order.shippingAddress.city }}</p>
    </section>

    <section class="items">
      <h2>Items</h2>
      <ul>
        <li *ngFor="let it of order.items">
          {{ it.name }} × {{ it.quantity }} — {{ it.price | currency:'PKR' }}
        </li>
      </ul>
    </section>

    <section class="payment-proof" *ngIf="order.paymentProof">
      <h2>Payment Proof</h2>
      <img [src]="order.paymentProof.fileData" [alt]="order.paymentProof.fileName" style="max-width:320px;display:block" />
      <a [href]="order.paymentProof.fileData" download="{{ order.paymentProof.fileName }}">Download receipt</a>
    </section>

    <div class="actions">
      <button (click)="approvePayment()">Approve Payment</button>
      <button (click)="rejectPayment()">Reject Payment</button>
      <button (click)="printInvoice()">Print Invoice</button>
    </div>
  </div>

  <div *ngIf="!order">Order not found.</div>
  `
})
export class AdminOrderDetailComponent implements OnInit {
  order: OrderModel | undefined;
  statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  constructor(private route: ActivatedRoute, private orderService: OrderService, private toastr: ToastrService, private audit: AdminAuditService) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.order = this.orderService.getOrderById(id);
  }

  async updateStatus(status: string) {
    if (!this.order) return;
    await this.orderService.updateOrderStatus(this.order.orderId, status as any);
    this.order = this.orderService.getOrderById(this.order.orderId);
    this.toastr.success('Status updated', 'Order');
    this.audit.log('update_status', { orderNumber: this.order!.orderNumber, status });
  }

  async approvePayment() {
    if (!this.order) return;
    await this.orderService.verifyPayment(this.order.orderId);
    this.order = this.orderService.getOrderById(this.order.orderId);
    this.toastr.success('Payment approved', 'Payment');
    this.audit.log('approve_payment', { orderNumber: this.order!.orderNumber });
  }

  async rejectPayment() {
    if (!this.order) return;
    await this.orderService.setPaymentStatus(this.order.orderId, 'FAILED');
    this.order = this.orderService.getOrderById(this.order.orderId);
    this.toastr.warning('Payment rejected', 'Payment');
    this.audit.log('reject_payment', { orderNumber: this.order!.orderNumber });
  }

  printInvoice() {
    if (!this.order) return;
    const win = window.open('', '_blank');
    if (!win) return;
    const html = `<html><head><title>Invoice ${this.order.orderNumber}</title></head><body><h1>Invoice: ${this.order.orderNumber}</h1><p>Customer: ${this.order.customerInfo.fullName}</p><p>Total: ${this.order.total}</p><pre>${JSON.stringify(this.order, null, 2)}</pre></body></html>`;
    win.document.write(html);
    win.document.close();
    win.print();
  }
}
