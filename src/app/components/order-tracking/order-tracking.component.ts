import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { OrderModel } from '../../models/order.model';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';

export interface TrackingTimelineStep {
  id: string;
  label: string;
  completed: boolean;
  active: boolean;
  timestamp?: Date;
  detail?: string;
}

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [FormsModule, RouterLink, CustomCurrencyPipe, DatePipe],
  templateUrl: './order-tracking.component.html',
  styleUrl: './order-tracking.component.scss',
})
export class OrderTrackingComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected orderNumber = '';
  protected email = '';
  protected isSearching = false;
  protected hasSearched = false;
  protected detailsExpanded = false;
  protected resultsVisible = signal(false);

  protected readonly supportEmail = 'concierge@thetwistedthreads.com';
  protected foundOrder: OrderModel | null = null;
  protected errorMessage = '';

  public ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const order = params.get('order');
      const email = params.get('email');
      if (order) {
        this.orderNumber = order;
      }
      if (email) {
        this.email = email;
      }
      if (order && email) {
        this.performSearch(false);
      }
    });
  }

  protected get timelineSteps(): TrackingTimelineStep[] {
    const order = this.foundOrder;
    if (!order) {
      return [];
    }

    if (order.status === 'CANCELLED') {
      return [
        {
          id: 'placed',
          label: 'Order placed',
          completed: true,
          active: false,
          timestamp: order.createdAt,
        },
        {
          id: 'cancelled',
          label: 'Order cancelled',
          completed: true,
          active: true,
          timestamp: order.createdAt,
          detail: 'This order was cancelled',
        },
      ];
    }

    const rank = this.statusRank(order.status);
    const paymentVerified =
      order.paymentMethod === 'COD' ||
      order.paymentStatus === 'VERIFIED' ||
      order.paymentStatus === 'PAID';

    const steps: TrackingTimelineStep[] = [
      {
        id: 'placed',
        label: 'Order placed',
        completed: true,
        active: rank === 0,
        timestamp: order.createdAt,
      },
    ];

    if (order.paymentMethod === 'BANK_TRANSFER') {
      steps.push({
        id: 'payment',
        label: 'Payment verified',
        completed: paymentVerified,
        active: !paymentVerified && rank <= 1,
        timestamp: paymentVerified ? this.estimatePaymentVerifiedAt(order) : undefined,
        detail: paymentVerified ? undefined : 'Awaiting verification (24–48 hrs)',
      });
    }

    steps.push(
      {
        id: 'processing',
        label: 'Processing',
        completed: rank >= 2,
        active: rank === 2,
        timestamp: rank >= 2 ? this.estimateProcessingAt(order) : undefined,
      },
      {
        id: 'shipped',
        label: 'Shipped',
        completed: rank >= 3,
        active: false,
        timestamp: rank >= 3 ? this.estimateShippedAt(order) : undefined,
        detail: rank >= 3 ? this.trackingNumberDisplay(order) : undefined,
      },
      {
        id: 'out-for-delivery',
        label: 'Out for delivery',
        completed: rank >= 4,
        active: rank === 3,
        timestamp: rank === 3 ? this.estimateOutForDeliveryAt(order) : undefined,
      },
      {
        id: 'delivered',
        label: 'Delivered',
        completed: rank >= 4,
        active: rank >= 4,
        timestamp: rank >= 4 ? order.estimatedDelivery : undefined,
      }
    );

    return steps;
  }

  protected get progressPercent(): number {
    const steps = this.timelineSteps;
    if (!steps.length) {
      return 0;
    }
    const completed = steps.filter(s => s.completed).length;
    const active = steps.some(s => s.active);
    const progress = active && completed < steps.length ? completed + 0.5 : completed;
    return Math.min(100, Math.round((progress / steps.length) * 100));
  }

  protected get currentStepLabel(): string {
    const active = this.timelineSteps.find(s => s.active);
    if (active) {
      return active.label;
    }
    const lastCompleted = [...this.timelineSteps].reverse().find(s => s.completed);
    return lastCompleted?.label ?? 'Order placed';
  }

  protected get isBankTransfer(): boolean {
    return this.foundOrder?.paymentMethod === 'BANK_TRANSFER';
  }

  protected get paymentVerificationMessage(): string {
    const order = this.foundOrder;
    if (!order || !this.isBankTransfer) {
      return '';
    }
    if (order.paymentStatus === 'VERIFIED' || order.paymentStatus === 'PAID') {
      return 'Your payment has been verified. We are preparing your order.';
    }
    if (order.paymentStatus === 'FAILED') {
      return 'Payment verification failed. Please contact support with your receipt.';
    }
    return 'We are reviewing your bank transfer receipt. Verification typically takes 24–48 business hours.';
  }

  protected get receiptIsImage(): boolean {
    const data = this.foundOrder?.paymentProof?.fileData ?? '';
    return data.startsWith('data:image');
  }

  protected get emailNotificationsUrl(): string {
    const order = this.foundOrder;
    if (!order) {
      return `mailto:${this.supportEmail}`;
    }
    const subject = encodeURIComponent(`Order updates for ${order.orderNumber}`);
    const body = encodeURIComponent(
      `Please send shipping updates for order ${order.orderNumber} to ${order.customerInfo.email}.`
    );
    return `mailto:${this.supportEmail}?subject=${subject}&body=${body}`;
  }

  protected onTrack(form: NgForm): void {
    if (!form.valid) {
      form.control.markAllAsTouched();
      return;
    }
    this.performSearch(true);
  }

  protected toggleDetails(): void {
    this.detailsExpanded = !this.detailsExpanded;
  }

  protected resetSearch(): void {
    this.foundOrder = null;
    this.hasSearched = false;
    this.errorMessage = '';
    this.resultsVisible.set(false);
    this.detailsExpanded = false;
    this.router.navigate(['/track-order']);
  }

  private performSearch(updateUrl: boolean): void {
    this.isSearching = true;
    this.hasSearched = true;
    this.errorMessage = '';
    this.foundOrder = null;
    this.resultsVisible.set(false);

    setTimeout(() => {
      const order = this.orderService.trackOrder(this.orderNumber, this.email);
      this.isSearching = false;

      if (!order) {
        this.errorMessage =
          'We could not find an order matching that number and email. Please check your details and try again.';
        return;
      }

      this.foundOrder = order;
      if (updateUrl) {
        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {
            order: order.orderNumber,
            email: this.email.trim(),
          },
          replaceUrl: true,
        });
      }

      requestAnimationFrame(() => this.resultsVisible.set(true));
    }, 400);
  }

  private statusRank(status: OrderModel['status']): number {
    const ranks: Record<OrderModel['status'], number> = {
      PENDING: 0,
      CONFIRMED: 1,
      PROCESSING: 2,
      SHIPPED: 3,
      DELIVERED: 4,
      CANCELLED: -1,
    };
    return ranks[status] ?? 0;
  }

  private trackingNumberDisplay(order: OrderModel): string {
    if (order.trackingNumber) {
      return `Tracking: ${order.trackingNumber}`;
    }
    if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
      return `Tracking: TTH-TRK-${order.orderNumber.replace(/[^A-Z0-9]/gi, '').slice(-8).toUpperCase()}`;
    }
    return 'Tracking number will be assigned when shipped';
  }

  private estimatePaymentVerifiedAt(order: OrderModel): Date {
    const d = new Date(order.createdAt);
    d.setDate(d.getDate() + 1);
    return d;
  }

  private estimateProcessingAt(order: OrderModel): Date {
    const d = new Date(order.createdAt);
    d.setDate(d.getDate() + 2);
    return d;
  }

  private estimateShippedAt(order: OrderModel): Date {
    const d = new Date(order.createdAt);
    d.setDate(d.getDate() + 4);
    return d;
  }

  private estimateOutForDeliveryAt(order: OrderModel): Date {
    const d = new Date(order.estimatedDelivery);
    d.setDate(d.getDate() - 1);
    return d;
  }
}
