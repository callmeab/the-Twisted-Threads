import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from '../../../services/order.service';
import { OrderModel, OrderStatus, PaymentMethod } from '../../../models/order.model';
import { AdminAuditService } from '../../../services/admin-audit.service';

@Component({
  selector: 'app-admin-orders',
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
})
export class AdminOrders {
  private readonly orderService = inject(OrderService);
  private readonly toastr = inject(ToastrService);
  private readonly audit = inject(AdminAuditService);

  protected readonly orders = this.orderService.orders;
  protected readonly isLoading = this.orderService.isLoading;
  protected readonly error = this.orderService.error;

  protected searchQuery = signal('');
  protected filterStatus = signal<OrderStatus | ''>('');
  protected filterPayment = signal<PaymentMethod | ''>('');

  protected readonly statuses: OrderStatus[] = [
    'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED',
  ];
  protected readonly payments: PaymentMethod[] = ['COD', 'BANK_TRANSFER'];

  protected readonly filteredOrders = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const status = this.filterStatus();
    const payment = this.filterPayment();

    return this.orders().filter(order => {
      if (q) {
        const matches =
          order.orderNumber.toLowerCase().includes(q) ||
          order.customerInfo.fullName.toLowerCase().includes(q) ||
          order.shippingAddress.email?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (status && order.status !== status) return false;
      if (payment && order.paymentMethod !== payment) return false;
      return true;
    });
  });

  protected readonly summary = computed(() => {
    const all = this.orders();
    return {
      total: all.length,
      pending: all.filter(o => o.status === 'PENDING').length,
      processing: all.filter(o => o.status === 'PROCESSING' || o.status === 'CONFIRMED').length,
      shipped: all.filter(o => o.status === 'SHIPPED').length,
      delivered: all.filter(o => o.status === 'DELIVERED').length,
      revenue: all.reduce((sum, o) => sum + o.total, 0),
    };
  });

  protected statusClass(status: OrderStatus): string {
    return status.toLowerCase();
  }

  protected paymentLabel(method: PaymentMethod): string {
    return method === 'COD' ? 'COD' : 'Bank Transfer';
  }

  protected async changeStatus(order: OrderModel, status: OrderStatus): Promise<void> {
    const updated = await this.orderService.updateOrderStatus(order.orderId, status);
    if (updated) {
      this.toastr.success(`Order ${updated.orderNumber} marked as ${status}.`, 'Status Updated');
      this.audit.log('update_status', { orderNumber: updated.orderNumber, status });
    }
  }

  protected exportCsv(): void {
    const rows = this.filteredOrders();
    if (!rows.length) {
      this.toastr.info('No orders to export.', 'Export');
      return;
    }

    const data = rows.map(o => ({
      orderNumber: o.orderNumber,
      customer: o.customerInfo.fullName,
      email: o.customerInfo.email,
      date: o.createdAt.toISOString(),
      items: o.items.length,
      total: o.total,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status,
    }));

    const header = Object.keys(data[0]).join(',');
    const csv = [
      header,
      ...data.map(r =>
        Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    this.toastr.success('Orders exported successfully.', 'Export');
  }
}
