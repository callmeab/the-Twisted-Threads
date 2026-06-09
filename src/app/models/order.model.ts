import { CartItem } from './cart.model';

export interface Address {
  fullName: string;
  email: string;
  phone: string;
  alternativePhone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
}

/** @deprecated Use Address */
export type ShippingAddress = Address;

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  alternativePhone?: string;
}

export interface PaymentProof {
  fileName: string;
  /** Base64 data URL — used during checkout before upload to Storage */
  fileData?: string;
  /** Public download URL after upload to Firebase Storage */
  fileUrl?: string;
  storagePath?: string;
  uploadedAt: Date;
  uploadMethod: 'WEBSITE' | 'WHATSAPP';
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'PAID' | 'FAILED';

export type PaymentMethod = 'COD' | 'BANK_TRANSFER';

export interface OrderModel {
  orderId: string;
  orderNumber: string;
  customerInfo: CustomerInfo;
  items: CartItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  paymentProof?: PaymentProof;
  orderNotes: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  trackingNumber?: string;
  createdAt: Date;
  estimatedDelivery: Date;
}

export interface CreateOrderData {
  customerInfo: CustomerInfo;
  items: CartItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  paymentProof?: PaymentProof;
  orderNotes: string;
  subtotal: number;
  shippingCost: number;
  total: number;
}
