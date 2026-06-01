import { Injectable, signal } from '@angular/core';
import {
  CreateOrderData,
  OrderModel,
  OrderStatus,
  PaymentStatus,
} from '../models/order.model';

const ORDERS_STORAGE_KEY = 'twistedThreadsOrders';
const CURRENT_ORDER_STORAGE_KEY = 'twistedThreadsCurrentOrderId';
const ORDER_NUMBER_SEQ_KEY = 'twistedThreadsOrderNumberSeq';
const ESTIMATED_DELIVERY_DAYS = 7;
const WHATSAPP_NUMBER = '923001234567';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly ordersSignal = signal<OrderModel[]>(this.loadOrders());
  private readonly currentOrderSignal = signal<OrderModel | null>(this.loadCurrentOrder());

  public readonly orders = this.ordersSignal.asReadonly();
  public readonly currentOrder = this.currentOrderSignal.asReadonly();

  /** @deprecated Use orders */
  public readonly ordersHistory = this.orders;

  public createOrder(orderData: CreateOrderData): OrderModel {
    const createdAt = new Date();
    const order: OrderModel = {
      orderId: this.generateOrderId(),
      orderNumber: this.generateOrderNumber(createdAt),
      customerInfo: { ...orderData.customerInfo },
      items: orderData.items.map(item => ({
        ...item,
        addedAt: item.addedAt instanceof Date ? item.addedAt : new Date(item.addedAt),
      })),
      shippingAddress: { ...orderData.shippingAddress },
      paymentMethod: orderData.paymentMethod,
      paymentProof: orderData.paymentProof
        ? {
            ...orderData.paymentProof,
            uploadedAt:
              orderData.paymentProof.uploadedAt instanceof Date
                ? orderData.paymentProof.uploadedAt
                : new Date(orderData.paymentProof.uploadedAt),
          }
        : undefined,
      orderNotes: orderData.orderNotes,
      subtotal: orderData.subtotal,
      shippingCost: orderData.shippingCost,
      total: orderData.total,
      status: 'PENDING',
      paymentStatus: orderData.paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
      createdAt,
      estimatedDelivery: this.calculateEstimatedDelivery(createdAt),
    };

    const updatedOrders = [order, ...this.ordersSignal()];
    this.persistOrders(updatedOrders);
    this.setCurrentOrder(order);

    this.sendOrderConfirmationEmail(order.orderId);
    this.sendWhatsAppNotification(order.orderId);

    return order;
  }

  public getOrderById(orderId: string): OrderModel | undefined {
    return this.ordersSignal().find(order => order.orderId === orderId);
  }

  public getOrderByOrderNumber(orderNumber: string): OrderModel | undefined {
    const normalized = orderNumber.trim().toUpperCase();
    return this.ordersSignal().find(order => order.orderNumber.toUpperCase() === normalized);
  }

  public trackOrder(orderNumber: string, email: string): OrderModel | null {
    const order = this.getOrderByOrderNumber(orderNumber);
    if (!order) {
      return null;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (order.customerInfo.email.trim().toLowerCase() !== normalizedEmail) {
      return null;
    }

    return order;
  }

  public getAllOrders(): OrderModel[] {
    return [...this.ordersSignal()];
  }

  public updateOrderStatus(orderId: string, status: OrderStatus): OrderModel | undefined {
    return this.updateOrder(orderId, order => {
      const updates: OrderModel = { ...order, status };
      if (status === 'SHIPPED' && !order.trackingNumber) {
        updates.trackingNumber = this.generateTrackingNumber(order.orderNumber);
      }
      return updates;
    });
  }

  private generateTrackingNumber(orderNumber: string): string {
    const suffix = orderNumber.replace(/[^A-Z0-9]/gi, '').slice(-8).toUpperCase();
    return `TTH-TRK-${suffix}`;
  }

  public verifyPayment(orderId: string): OrderModel | undefined {
    return this.updateOrder(orderId, order => ({
      ...order,
      paymentStatus: 'VERIFIED' as PaymentStatus,
      status: order.status === 'PENDING' ? 'CONFIRMED' : order.status,
    }));
  }

  public sendOrderConfirmationEmail(orderId: string): boolean {
    const order = this.getOrderById(orderId);
    if (!order) {
      return false;
    }

    console.info('[OrderService] Order confirmation email queued', {
      to: order.customerInfo.email,
      orderNumber: order.orderNumber,
      total: order.total,
    });
    return true;
  }

  public sendWhatsAppNotification(orderId: string): boolean {
    const order = this.getOrderById(orderId);
    if (!order) {
      return false;
    }

    const message = `New order ${order.orderNumber} from ${order.customerInfo.fullName}. Total: ${order.total} PKR. Payment: ${order.paymentMethod}.`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    console.info('[OrderService] WhatsApp notification prepared', { orderNumber: order.orderNumber, whatsappUrl });
    return true;
  }

  public clearCurrentOrder(): void {
    this.currentOrderSignal.set(null);
    localStorage.removeItem(CURRENT_ORDER_STORAGE_KEY);
  }

  private updateOrder(
    orderId: string,
    updater: (order: OrderModel) => OrderModel
  ): OrderModel | undefined {
    let updated: OrderModel | undefined;
    const orders = this.ordersSignal().map(order => {
      if (order.orderId !== orderId) {
        return order;
      }
      updated = updater(order);
      return updated;
    });

    if (!updated) {
      return undefined;
    }

    this.persistOrders(orders);
    if (this.currentOrderSignal()?.orderId === orderId) {
      this.setCurrentOrder(updated);
    }
    return updated;
  }

  private setCurrentOrder(order: OrderModel): void {
    this.currentOrderSignal.set(order);
    localStorage.setItem(CURRENT_ORDER_STORAGE_KEY, order.orderId);
  }

  private generateOrderId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `ord-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  }

  private generateOrderNumber(createdAt: Date): string {
    const year = createdAt.getFullYear();
    const prefix = `TTH-${year}-`;
    const seq = this.nextOrderSequence(year);
    return `${prefix}${String(seq).padStart(4, '0')}`;
  }

  private nextOrderSequence(year: number): number {
    const raw = localStorage.getItem(ORDER_NUMBER_SEQ_KEY);
    let seqByYear: Record<string, number> = {};

    if (raw) {
      try {
        seqByYear = JSON.parse(raw) as Record<string, number>;
      } catch {
        seqByYear = {};
      }
    }

    const existingOrdersThisYear = this.ordersSignal().filter(order =>
      order.orderNumber.startsWith(`TTH-${year}-`)
    ).length;

    const stored = seqByYear[String(year)] ?? 0;
    const next = Math.max(stored, existingOrdersThisYear) + 1;
    seqByYear[String(year)] = next;
    localStorage.setItem(ORDER_NUMBER_SEQ_KEY, JSON.stringify(seqByYear));
    return next;
  }

  private calculateEstimatedDelivery(createdAt: Date): Date {
    const delivery = new Date(createdAt);
    delivery.setDate(delivery.getDate() + ESTIMATED_DELIVERY_DAYS);
    return delivery;
  }

  private loadOrders(): OrderModel[] {
    try {
      const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as OrderModel[];
      return parsed.map(order => this.reviveOrder(order));
    } catch {
      return [];
    }
  }

  private loadCurrentOrder(): OrderModel | null {
    const orderId = localStorage.getItem(CURRENT_ORDER_STORAGE_KEY);
    if (!orderId) {
      return null;
    }
    return this.loadOrders().find(order => order.orderId === orderId) ?? null;
  }

  private persistOrders(orders: OrderModel[]): void {
    this.ordersSignal.set(orders);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }

  private reviveOrder(order: OrderModel): OrderModel {
    return {
      ...order,
      createdAt: new Date(order.createdAt),
      estimatedDelivery: new Date(order.estimatedDelivery),
      items: order.items.map(item => ({
        ...item,
        addedAt: new Date(item.addedAt),
      })),
      paymentProof: order.paymentProof
        ? { ...order.paymentProof, uploadedAt: new Date(order.paymentProof.uploadedAt) }
        : undefined,
    };
  }
}
