import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  signal,
} from '@angular/core';
import { isPlatformBrowser, DatePipe, DOCUMENT, LowerCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from '../../services/order.service';
import { WhatsAppService } from '../../services/whatsapp.service';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';
import { OrderModel } from '../../models/order.model';

interface TimelineStep {
  label: string;
  description: string;
  completed: boolean;
  active: boolean;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink, CustomCurrencyPipe, DatePipe, LowerCasePipe],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.scss',
})
export class OrderConfirmationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('confettiCanvas') private confettiCanvas?: ElementRef<HTMLCanvasElement>;

  protected readonly orderService = inject(OrderService);
  private readonly toastr = inject(ToastrService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly whatsappService = inject(WhatsAppService);

  protected pageReady = signal(false);
  protected showOrderDetails = false;
  protected orderCopied = false;

  protected readonly supportEmail = 'twistedthread45@gmail.com';
  protected readonly supportPhone = '03316903634';
  protected readonly whatsappNumber = '923316903634';

  private confettiFrameId = 0;
  private confettiTimeoutId = 0;

  public ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    setTimeout(() => {
      this.pageReady.set(true);
    }, 50);
  }

  public ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId) || !this.orderService.currentOrder()) {
      return;
    }
    this.launchConfetti();
  }

  public ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      cancelAnimationFrame(this.confettiFrameId);
      clearTimeout(this.confettiTimeoutId);
    }
  }

  protected get order(): OrderModel | null {
    return this.orderService.currentOrder();
  }

  protected get isBankTransfer(): boolean {
    return this.order?.paymentMethod === 'BANK_TRANSFER';
  }

  protected get firstName(): string {
    const name = this.order?.customerInfo.fullName?.trim() ?? '';
    if (!name) {
      return 'there';
    }
    return name.split(/\s+/)[0];
  }

  protected get paymentMethodLabel(): string {
    if (!this.order) {
      return '';
    }
    return this.order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Bank Transfer';
  }

  protected get estimatedDeliveryDays(): number {
    const order = this.order;
    if (!order) {
      return 7;
    }
    const ms = order.estimatedDelivery.getTime() - order.createdAt.getTime();
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }

  protected get timelineSteps(): TimelineStep[] {
    const order = this.order;
    if (!order) {
      return [];
    }

    const status = order.status;
    const statusRank: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 1,
      PROCESSING: 2,
      SHIPPED: 3,
      DELIVERED: 4,
      CANCELLED: -1,
    };
    const rank = statusRank[status] ?? 0;

    const steps: TimelineStep[] = [
      {
        label: 'Order placed',
        description: order.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed: true,
        active: rank === 0,
      },
    ];

    if (this.isBankTransfer) {
      const paymentDone = order.paymentStatus === 'VERIFIED' || order.paymentStatus === 'PAID';
      steps.push({
        label: 'Payment verified',
        description: paymentDone ? 'Receipt confirmed' : 'Within 24–48 hours',
        completed: paymentDone,
        active: !paymentDone && rank <= 1,
      });
    }

    steps.push(
      {
        label: 'Processing',
        description: 'Preparing your items',
        completed: rank >= 2,
        active: rank === 2 || (rank === 1 && !this.isBankTransfer),
      },
      {
        label: 'Shipped',
        description: 'On the way to you',
        completed: rank >= 3,
        active: rank === 3,
      },
      {
        label: 'Delivered',
        description: order.estimatedDelivery.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        completed: rank >= 4,
        active: rank === 4,
      }
    );

    return steps;
  }

  protected get whatsAppSupportUrl(): string {
    const order = this.order;
    const text = order
      ? `Hi, I need help with my order ${order.orderNumber}.`
      : 'Hi, I need help with my order.';
    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(text)}`;
  }

  protected get whatsAppReceiptUrl(): string {
    const order = this.order;
    if (!order) {
      return '#';
    }
    return this.whatsappService.getOrderWhatsAppUrl(order);
  }

  protected copyOrderNumber(): void {
    const orderNumber = this.order?.orderNumber;
    if (!orderNumber || !isPlatformBrowser(this.platformId)) {
      return;
    }

    navigator.clipboard.writeText(orderNumber).then(() => {
      this.orderCopied = true;
      this.toastr.success('Order number copied to clipboard.', 'Copied');
      setTimeout(() => {
        this.orderCopied = false;
      }, 2500);
    }).catch(() => {
      this.toastr.error('Could not copy order number.', 'Copy failed');
    });
  }

  protected scrollToOrderDetails(): void {
    this.showOrderDetails = true;
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    requestAnimationFrame(() => {
      this.document.getElementById('order-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  protected downloadInvoice(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.document.body.classList.add('printing-invoice');
    window.print();
    this.document.body.classList.remove('printing-invoice');
  }

  protected clearOrderState(): void {
    this.orderService.clearCurrentOrder();
  }

  private launchConfetti(): void {
    const canvas = this.confettiCanvas?.nativeElement;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const resize = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#B76E79', '#D4AF37', '#4A2C3E', '#6B4260', '#C98A93', '#E2C65A'];
    const particles: ConfettiParticle[] = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * -0.5 - 20,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      opacity: 1,
    }));

    const duration = 4500;
    const start = performance.now();

    const animate = (now: number): void => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.rotation += p.rotationSpeed;
        if (elapsed > duration * 0.6) {
          p.opacity = Math.max(0, 1 - (elapsed - duration * 0.6) / (duration * 0.4));
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });

      if (elapsed < duration) {
        this.confettiFrameId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        window.removeEventListener('resize', resize);
      }
    };

    this.confettiFrameId = requestAnimationFrame(animate);
  }
}
