import { Injectable } from '@angular/core';
import { WHATSAPP_CONFIG } from '../config/whatsapp.config';
import { OrderModel } from '../models/order.model';

function normalizeNumber(num: string): string {
  // remove non digits and leading +
  return num.replace(/[^0-9]/g, '').replace(/^0+/, '');
}

function normalizeRecipientNumber(num: string): string {
  const cleaned = num.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('03') && cleaned.length === 11) {
    return '92' + cleaned.slice(1);
  }
  if (cleaned.startsWith('3') && cleaned.length === 10) {
    return '92' + cleaned;
  }
  return cleaned;
}

@Injectable({ providedIn: 'root' })
export class WhatsAppService {
  private phone = normalizeNumber(WHATSAPP_CONFIG.phoneNumber);

  isMobile(): boolean {
    if (typeof navigator === 'undefined') return false;
    return /Mobi|Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
  }

  buildMessage(text: string): string {
    return encodeURIComponent(text);
  }

  buildWhatsAppUrl(text: string, opts?: { phone?: string }): string {
    const phone = normalizeNumber(opts?.phone || this.phone);
    const msg = this.buildMessage(text);
    if (this.isMobile()) {
      // use whatsapp:// on mobile devices
      return `whatsapp://send?phone=${phone}&text=${msg}`;
    }
    // fallback to api.whatsapp.com for desktop which redirects appropriately
    return `https://api.whatsapp.com/send?phone=${phone}&text=${msg}`;
  }

  openChat(text: string, opts?: { phone?: string }) {
    const url = this.buildWhatsAppUrl(text, opts);
    try {
      window.open(url, '_blank');
    } catch (e) {
      // fallback to web
      const fallback = `https://web.whatsapp.com/send?text=${this.buildMessage(text)}`;
      window.open(fallback, '_blank');
    }
  }

  // Pre-built messages
  generalInquiry(): string {
    return `${WHATSAPP_CONFIG.defaultMessagePrefix} Can you share more details?`;
  }

  orderInquiry(orderNumber?: string): string {
    return `Hi, I'd like to ask about my order ${orderNumber ? '#' + orderNumber : ''}.`;
  }

  customOrder(): string {
    return "Hi, I'd like to discuss a custom jewelry piece. Please advise on options and pricing.";
  }

  paymentReceipt(orderNumber?: string): string {
    return `Hi, I've made a payment for order ${orderNumber ? '#' + orderNumber : ''}. Attaching receipt.`;
  }

  // Share product
  productShare(productName: string, productUrl: string): string {
    return `Hi, I'm interested in ${productName}. Here's the link: ${productUrl}`;
  }

  // Wishlist share
  wishlistShare(names: string[], shareUrl: string): string {
    return `My wishlist from ${WHATSAPP_CONFIG.displayName}: ${names.join(', ')}\n${shareUrl}`;
  }

  // Order share
  orderShare(orderNumber: string, orderUrl: string): string {
    return `Order ${orderNumber} details: ${orderUrl}`;
  }

  buildOrderWhatsAppMessage(order: OrderModel): string {
    const itemsText = order.items
      .map(item => {
        const variant = [item.selectedSize, item.selectedColor].filter(Boolean).join(' / ');
        const variantStr = variant ? ` (${variant})` : '';
        return `• ${item.name}${variantStr} x${item.quantity} - PKR ${item.price * item.quantity}`;
      })
      .join('\n');

    const paymentLabel = order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Bank Transfer';

    return `*Order Confirmed!* 🎉

Thank you for shopping with *The Twisted Threads*.

*Order Number:* ${order.orderNumber}
*Date:* ${new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
*Payment Method:* ${paymentLabel}

*Items Ordered:*
${itemsText}

*Summary:*
• *Subtotal:* PKR ${order.subtotal}
• *Shipping & Fees:* PKR ${order.shippingCost}
• *Total:* *PKR ${order.total}*

*Shipping Address:*
${order.shippingAddress.fullName}
${order.shippingAddress.addressLine1}
${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '\n' : ''}${order.shippingAddress.city}, ${order.shippingAddress.stateProvince}
${order.shippingAddress.postalCode}, ${order.shippingAddress.country}

Track your order: ${window.location.origin}/track-order?order=${order.orderNumber}&whatsapp=${normalizeRecipientNumber(order.customerInfo.whatsappNumber)}`;
  }

  getOrderWhatsAppUrl(order: OrderModel): string {
    const phone = normalizeRecipientNumber(order.customerInfo.whatsappNumber || order.customerInfo.phone);
    const message = this.buildOrderWhatsAppMessage(order);
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }
}
