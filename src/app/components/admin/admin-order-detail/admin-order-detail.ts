import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from '../../../services/order.service';
import { OrderModel, OrderStatus } from '../../../models/order.model';
import { AdminAuditService } from '../../../services/admin-audit.service';

@Component({
  selector: 'app-admin-order-detail',
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `./admin-order-detail.html`,
  styleUrl: './admin-order-detail.css',
})
export class AdminOrderDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly toastr = inject(ToastrService);
  private readonly audit = inject(AdminAuditService);

  protected readonly orderId = signal('');
  protected readonly statuses: OrderStatus[] = [
    'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED',
  ];

  protected readonly order = computed(() => {
    const id = this.orderId();
    return this.orderService.orders().find(o => o.orderId === id);
  });

  protected readonly receiptSrc = computed(() => {
    const proof = this.order()?.paymentProof;
    return proof?.fileUrl ?? proof?.fileData ?? '';
  });

  protected readonly receiptIsImage = computed(() => {
    const src = this.receiptSrc();
    return src.startsWith('data:image') || /\.(jpe?g|png|webp|gif)(\?|$)/i.test(src);
  });

  public ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.orderId.set(params.get('id') ?? '');
    });
  }

  protected paymentLabel(method: string): string {
    return method === 'COD' ? 'Cash on Delivery' : 'Bank Transfer';
  }

  protected async updateStatus(status: OrderStatus): Promise<void> {
    const current = this.order();
    if (!current) return;

    const updated = await this.orderService.updateOrderStatus(current.orderId, status);
    if (updated) {
      this.toastr.success(`Status updated to ${status}.`, 'Order Updated');
      this.audit.log('update_status', { orderNumber: updated.orderNumber, status });
    }
  }

  protected async approvePayment(): Promise<void> {
    const current = this.order();
    if (!current) return;

    const updated = await this.orderService.verifyPayment(current.orderId);
    if (updated) {
      this.toastr.success('Payment verified.', 'Payment');
      this.audit.log('approve_payment', { orderNumber: updated.orderNumber });
    }
  }

  protected async rejectPayment(): Promise<void> {
    const current = this.order();
    if (!current) return;

    const updated = await this.orderService.setPaymentStatus(current.orderId, 'FAILED');
    if (updated) {
      this.toastr.warning('Payment marked as failed.', 'Payment');
      this.audit.log('reject_payment', { orderNumber: updated.orderNumber });
    }
  }

  protected printInvoice(): void {
    window.print();
  }
}
