import { Injectable, inject, signal } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from '@angular/fire/firestore';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
} from '@angular/fire/storage';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  CreateOrderData,
  OrderModel,
  OrderStatus,
  PaymentProof,
  PaymentStatus,
} from '../models/order.model';

const CURRENT_ORDER_STORAGE_KEY = 'twistedThreadsCurrentOrderId';
const CURRENT_ORDER_DATA_KEY = 'twistedThreadsCurrentOrder';
const ESTIMATED_DELIVERY_DAYS = 7;
const WHATSAPP_NUMBER = '923316903634';

interface FirestoreOrderDoc extends Omit<OrderModel, 'createdAt' | 'estimatedDelivery' | 'paymentProof'> {
  createdAt: Timestamp | Date;
  estimatedDelivery: Timestamp | Date;
  paymentProof?: PaymentProof & { uploadedAt: Timestamp | Date };
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly firestore = inject(Firestore);
  private readonly storage = inject(Storage);
  private readonly functions = inject(Functions);
  private readonly ordersCol = collection(this.firestore, 'orders');

  private readonly currentOrderSignal = signal<OrderModel | null>(this.loadCurrentOrder());

  public readonly isLoading = signal(true);
  public readonly error = signal<string | null>(null);

  private readonly _ordersQuery = query(this.ordersCol, orderBy('createdAt', 'desc'));

  private readonly _orders$ = (
    collectionData(this._ordersQuery, { idField: 'orderId' }) as Observable<FirestoreOrderDoc[]>
  ).pipe(
    map(docs => {
      this.isLoading.set(false);
      return docs.map(d => this.fromFirestore(d));
    }),
    catchError(err => {
      this.isLoading.set(false);
      if (err?.code === 'permission-denied') {
        this.error.set(null);
      } else {
        this.error.set('Failed to load orders.');
        console.error('[OrderService] Firestore read error:', err);
      }
      return of([] as OrderModel[]);
    }),
  );

  private readonly ordersSignal = toSignal(this._orders$, { initialValue: [] as OrderModel[] });

  public readonly orders = this.ordersSignal;
  /** @deprecated Use orders */
  public readonly ordersHistory = this.orders;
  public readonly currentOrder = this.currentOrderSignal.asReadonly();

  public async createOrder(orderData: CreateOrderData): Promise<OrderModel> {
    const orderId = this.generateOrderId();
    const createdAt = new Date();

    let paymentProof = orderData.paymentProof;
    if (paymentProof?.fileData && !paymentProof.fileUrl) {
      paymentProof = await this.uploadPaymentProof(orderId, paymentProof);
    }

    const orderNumber = await this.generateOrderNumber(createdAt);
    const estimatedDelivery = this.calculateEstimatedDelivery(createdAt);

    const order: OrderModel = {
      orderId,
      orderNumber,
      customerInfo: { ...orderData.customerInfo },
      items: orderData.items.map(item => ({
        ...item,
        addedAt: item.addedAt instanceof Date ? item.addedAt : new Date(item.addedAt),
      })),
      shippingAddress: { ...orderData.shippingAddress },
      paymentMethod: orderData.paymentMethod,
      paymentProof: paymentProof
        ? {
          ...paymentProof,
          uploadedAt:
            paymentProof.uploadedAt instanceof Date
              ? paymentProof.uploadedAt
              : new Date(paymentProof.uploadedAt),
        }
        : undefined,
      orderNotes: orderData.orderNotes,
      subtotal: orderData.subtotal,
      shippingCost: orderData.shippingCost,
      total: orderData.total,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      createdAt,
      estimatedDelivery,
    };

    await setDoc(doc(this.firestore, 'orders', orderId), this.toFirestore(order));
    this.setCurrentOrder(order);
    this.sendWhatsAppNotification(order);

    return order;
  }

  public getOrderById(orderId: string): OrderModel | undefined {
    return this.ordersSignal().find(order => order.orderId === orderId);
  }

  public getOrderByOrderNumber(orderNumber: string): OrderModel | undefined {
    const normalized = orderNumber.trim().toUpperCase();
    return this.ordersSignal().find(order => order.orderNumber.toUpperCase() === normalized);
  }

  public async trackOrder(orderNumber: string, email: string): Promise<OrderModel | null> {
    const trackFn = httpsCallable<
      { orderNumber: string; email: string },
      Record<string, unknown>
    >(this.functions, 'trackOrder');

    try {
      const result = await trackFn({
        orderNumber: orderNumber.trim(),
        email: email.trim(),
      });
      return this.fromFirestore(result.data as unknown as FirestoreOrderDoc);
    } catch (err) {
      console.warn('[OrderService] trackOrder failed:', err);
      return null;
    }
  }

  public getAllOrders(): OrderModel[] {
    return [...this.ordersSignal()];
  }

  public async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderModel | undefined> {
    const order = this.getOrderById(orderId);
    if (!order) {
      return undefined;
    }

    const updates: Partial<OrderModel> = { status };
    if (status === 'SHIPPED' && !order.trackingNumber) {
      updates.trackingNumber = this.generateTrackingNumber(order.orderNumber);
    }

    await updateDoc(doc(this.firestore, 'orders', orderId), updates);
    const updated = { ...order, ...updates };
    this.syncCurrentOrder(updated);
    return updated;
  }

  public async verifyPayment(orderId: string): Promise<OrderModel | undefined> {
    const order = this.getOrderById(orderId);
    if (!order) {
      return undefined;
    }

    const updates = {
      paymentStatus: 'VERIFIED' as PaymentStatus,
      status: order.status === 'PENDING' ? ('CONFIRMED' as OrderStatus) : order.status,
    };

    await updateDoc(doc(this.firestore, 'orders', orderId), updates);
    const updated = { ...order, ...updates };
    this.syncCurrentOrder(updated);
    return updated;
  }

  public async setPaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus
  ): Promise<OrderModel | undefined> {
    const order = this.getOrderById(orderId);
    if (!order) {
      return undefined;
    }

    await updateDoc(doc(this.firestore, 'orders', orderId), { paymentStatus });
    const updated = { ...order, paymentStatus };
    this.syncCurrentOrder(updated);
    return updated;
  }

  public sendWhatsAppNotification(order: OrderModel): boolean {
    const message = `New order ${order.orderNumber} from ${order.customerInfo.fullName}. Total: ${order.total} PKR. Payment: ${order.paymentMethod}.`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    console.info('[OrderService] WhatsApp notification prepared', {
      orderNumber: order.orderNumber,
      whatsappUrl,
    });
    return true;
  }

  public clearCurrentOrder(): void {
    this.currentOrderSignal.set(null);
    localStorage.removeItem(CURRENT_ORDER_STORAGE_KEY);
    localStorage.removeItem(CURRENT_ORDER_DATA_KEY);
  }

  private async uploadPaymentProof(orderId: string, proof: PaymentProof): Promise<PaymentProof> {
    if (!proof.fileData) {
      return proof;
    }

    const dataUrlMatch = proof.fileData.match(/^data:([^;]+);base64,(.+)$/);
    if (!dataUrlMatch) {
      throw new Error('Invalid payment proof file data.');
    }

    const contentType = dataUrlMatch[1];
    const base64 = dataUrlMatch[2];
    const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
    const safeName = proof.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `orders/${orderId}/payment-proof/${Date.now()}_${safeName}`;
    const storageRef = ref(this.storage, storagePath);

    await uploadBytes(storageRef, bytes, { contentType });
    const fileUrl = await getDownloadURL(storageRef);

    return {
      fileName: proof.fileName,
      fileUrl,
      storagePath,
      uploadedAt: proof.uploadedAt,
      uploadMethod: proof.uploadMethod,
    };
  }

  private async generateOrderNumber(createdAt: Date): Promise<string> {
    const year = createdAt.getFullYear();
    const counterRef = doc(this.firestore, 'counters', `orders_${year}`);

    const seq = await runTransaction(this.firestore, async transaction => {
      const snap = await transaction.get(counterRef);
      const current = snap.exists() ? (snap.data()['seq'] as number) : 0;
      const next = current + 1;
      transaction.set(counterRef, { seq: next }, { merge: true });
      return next;
    });

    return `TTH-${year}-${String(seq).padStart(4, '0')}`;
  }

  private generateTrackingNumber(orderNumber: string): string {
    const suffix = orderNumber.replace(/[^A-Z0-9]/gi, '').slice(-8).toUpperCase();
    return `TTH-TRK-${suffix}`;
  }

  private generateOrderId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `ord-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  }

  private calculateEstimatedDelivery(createdAt: Date): Date {
    const delivery = new Date(createdAt);
    delivery.setDate(delivery.getDate() + ESTIMATED_DELIVERY_DAYS);
    return delivery;
  }

  private setCurrentOrder(order: OrderModel): void {
    this.currentOrderSignal.set(order);
    localStorage.setItem(CURRENT_ORDER_STORAGE_KEY, order.orderId);
    localStorage.setItem(CURRENT_ORDER_DATA_KEY, JSON.stringify(order));
  }

  private syncCurrentOrder(order: OrderModel): void {
    if (this.currentOrderSignal()?.orderId === order.orderId) {
      this.setCurrentOrder(order);
    }
  }

  private loadCurrentOrder(): OrderModel | null {
    const raw = localStorage.getItem(CURRENT_ORDER_DATA_KEY);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as OrderModel;
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        estimatedDelivery: new Date(parsed.estimatedDelivery),
        items: parsed.items.map(item => ({
          ...item,
          addedAt: new Date(item.addedAt),
        })),
        paymentProof: parsed.paymentProof
          ? { ...parsed.paymentProof, uploadedAt: new Date(parsed.paymentProof.uploadedAt) }
          : undefined,
      };
    } catch {
      return null;
    }
  }

  private toFirestore(order: OrderModel): Record<string, unknown> {
    const base: Record<string, unknown> = {
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      customerInfo: order.customerInfo,
      items: order.items.map(item => ({
        id: item.id,
        name: item.name,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          images: item.product.images?.slice(0, 1) ?? [],
          category: item.product.category,
        },
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        price: item.price,
        addedAt: item.addedAt,
      })),
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      orderNotes: order.orderNotes ?? '',
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber ?? null,
      createdAt: serverTimestamp(),
      estimatedDelivery: Timestamp.fromDate(order.estimatedDelivery),
    };

    // ✅ Sirf tab add karo jab paymentProof exist kare
    if (order.paymentProof) {
      base['paymentProof'] = {
        fileName: order.paymentProof.fileName,
        fileUrl: order.paymentProof.fileUrl ?? null,
        storagePath: order.paymentProof.storagePath ?? null,
        uploadedAt: order.paymentProof.uploadedAt,
        uploadMethod: order.paymentProof.uploadMethod,
      };
    }

    return base;
  }

  private fromFirestore(data: FirestoreOrderDoc): OrderModel {
    return {
      ...data,
      createdAt: this.toDate(data.createdAt),
      estimatedDelivery: this.toDate(data.estimatedDelivery),
      items: (data.items ?? []).map(item => ({
        ...item,
        addedAt: this.toDate(item.addedAt as Date | Timestamp),
      })),
      paymentProof: data.paymentProof
        ? {
          ...data.paymentProof,
          uploadedAt: this.toDate(data.paymentProof.uploadedAt),
        }
        : undefined,
    };
  }

  private toDate(value: Date | Timestamp | string | number | undefined): Date {
    if (!value) {
      return new Date();
    }
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
      return (value as Timestamp).toDate();
    }
    if (typeof value === 'string' || typeof value === 'number') {
      return new Date(value);
    }
    return new Date();
  }
}
