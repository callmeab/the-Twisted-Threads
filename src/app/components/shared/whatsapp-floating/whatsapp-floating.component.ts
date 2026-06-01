import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatsAppService } from '../../../services/whatsapp.service';

@Component({
  selector: 'app-whatsapp-floating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="whatsapp-floating" (click)="openChat()" aria-label="Chat with us on WhatsApp" title="Chat with us">
      <span class="pulse" aria-hidden="true"></span>
      <svg class="whatsapp-icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <path fill="#25D366" d="M12 2C6.48 2 2 6.48 2 12c0 1.77.46 3.44 1.26 4.9L2 22l5.26-1.2C8.56 21.54 10.25 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
        <path fill="#fff" d="M17.5 14.2c-.3-.1-1.8-.9-2-.9-.2 0-.3-.1-.5.1-.2.2-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.4-2.3-1.4-.8-.8-1.3-1.8-1.5-2.1-.2-.3 0-.5.1-.6.1-.1.2-.4.3-.6.2-.2.1-.4 0-.6 0-.2-.5-1.2-.7-1.6-.2-.4-.4-.3-.6-.3-.2 0-.5 0-.8 0-.3 0-.6.1-.9.9-.3.8-1 2.1 1.1 4.6 1.5 1.7 3.1 2.5 4.6 3 1.9.6 2.6.5 3 .5.4 0 1.3-.5 1.5-1.1.2-.6.2-1 .1-1.1-.1-.1-.3-.2-.6-.3z"/>
      </svg>
    </button>
  `,
  styles: [
    `.whatsapp-floating{position:fixed;right:1rem;bottom:1.25rem;width:56px;height:56px;border-radius:9999px;background:#fff;box-shadow:0 6px 18px rgba(0,0,0,0.12);display:flex;align-items:center;justify-content:center;z-index:400}`,
    `.whatsapp-floating .pulse{position:absolute;width:100%;height:100%;border-radius:9999px;background:rgba(37,211,102,0.12);animation:pulse 2s infinite;border:2px solid rgba(37,211,102,0.06)}`,
    `.whatsapp-icon{position:relative;z-index:2;width:28px;height:28px}`,
    `@keyframes pulse{0%{transform:scale(0.6);opacity:0.9}70%{transform:scale(1.2);opacity:0}100%{opacity:0}}`
  ]
})
export class WhatsappFloatingComponent {
  constructor(private wa: WhatsAppService) {}

  openChat() {
    const message = this.wa.generalInquiry();
    this.wa.openChat(message);
  }
}
