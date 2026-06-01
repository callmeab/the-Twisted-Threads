import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatsAppService } from '../../../services/whatsapp.service';

@Component({
  selector: 'app-whatsapp-share',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button type="button" class="wa-share-btn" (click)="share()" [attr.aria-label]="ariaLabel">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#25D366" d="M12 2C6.48 2 2 6.48 2 12c0 1.77.46 3.44 1.26 4.9L2 22l5.26-1.2C8.56 21.54 10.25 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/><path fill="#fff" d="M17.5 14.2c-.3-.1-1.8-.9-2-.9-.2 0-.3-.1-.5.1-.2.2-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.4-2.3-1.4-.8-.8-1.3-1.8-1.5-2.1-.2-.3 0-.5.1-.6.1-.1.2-.4.3-.6.2-.2.1-.4 0-.6 0-.2-.5-1.2-.7-1.6-.2-.4-.4-.3-.6-.3-.2 0-.5 0-.8 0-.3 0-.6.1-.9.9-.3.8-1 2.1 1.1 4.6 1.5 1.7 3.1 2.5 4.6 3 1.9.6 2.6.5 3 .5.4 0 1.3-.5 1.5-1.1.2-.6.2-1 .1-1.1-.1-.1-.3-.2-.6-.3z"/></svg>
      <span class="wa-label"><ng-content></ng-content></span>
    </button>
  `,
  styles: [
    `.wa-share-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.25rem .6rem;border-radius:6px;background:#fff;border:1px solid #e6f4ea;color:#111}`,
    `.wa-label{font-size:0.95rem}`
  ]
})
export class WhatsappShareComponent {
  @Input() type: 'product' | 'order' | 'wishlist' | 'general' = 'general';
  @Input() productName?: string;
  @Input() productUrl?: string;
  @Input() orderNumber?: string;
  @Input() wishlistNames?: string[];

  constructor(private wa: WhatsAppService) {}

  get ariaLabel() {
    switch (this.type) {
      case 'product': return `Share ${this.productName} on WhatsApp`;
      case 'order': return `Share order ${this.orderNumber} on WhatsApp`;
      case 'wishlist': return `Share wishlist on WhatsApp`;
      default: return 'Share on WhatsApp';
    }
  }

  share() {
    let msg = '';
    switch (this.type) {
      case 'product':
        msg = this.wa.productShare(this.productName || 'product', this.productUrl || window.location.href);
        break;
      case 'order':
        msg = this.wa.orderShare(this.orderNumber || '', window.location.href);
        break;
      case 'wishlist':
        msg = this.wa.wishlistShare(this.wishlistNames || [], window.location.href);
        break;
      default:
        msg = this.wa.generalInquiry();
    }
    this.wa.openChat(msg);
  }
}
