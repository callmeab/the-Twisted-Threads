import { Injectable, signal } from '@angular/core';
import { Order, ShippingAddress } from '../models/order.model';
import { CartItem } from '../models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly currentOrderSignal = signal<Order | null>(null);
  private readonly ordersHistorySignal = signal<Order[]>([]);

  public readonly currentOrder = this.currentOrderSignal.asReadonly();
  public readonly ordersHistory = this.ordersHistorySignal.asReadonly();

  public createOrder(items: CartItem[], shippingAddress: ShippingAddress, totalAmount: number): Order {
    const newOrder: Order = {
      id: `ord-${Math.floor(100000 + Math.random() * 900000)}`,
      items: [...items],
      shippingAddress,
      totalAmount,
      status: 'pending',
      createdAt: new Date()
    };

    this.currentOrderSignal.set(newOrder);
    this.ordersHistorySignal.set([newOrder, ...this.ordersHistorySignal()]);
    return newOrder;
  }

  public clearCurrentOrder(): void {
    this.currentOrderSignal.set(null);
  }

  public getOrderById(id: string): Order | undefined {
    return this.ordersHistorySignal().find(o => o.id === id);
  }
}
