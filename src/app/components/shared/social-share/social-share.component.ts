import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-social-share',
  standalone: true,
  template: `
    <div class="social-share flex gap-2" role="group" [attr.aria-label]="'Share ' + (title || 'this page')">
      <a [href]="facebookUrl()" target="_blank" rel="noopener noreferrer" class="share-btn fb" aria-label="Share on Facebook">Facebook</a>
      <a [href]="twitterUrl()" target="_blank" rel="noopener noreferrer" class="share-btn tw" aria-label="Share on Twitter">Twitter</a>
      <a [href]="pinterestUrl()" target="_blank" rel="noopener noreferrer" class="share-btn pi" aria-label="Share on Pinterest">Pinterest</a>
      <a [href]="whatsAppUrl()" target="_blank" rel="noopener noreferrer" class="share-btn wa" aria-label="Share via WhatsApp">WhatsApp</a>
    </div>
  `,
  styles: [
    `.share-btn{display:inline-flex;align-items:center;padding:0.4rem 0.6rem;border-radius:6px;background:#f3f4f6;color:#111827;text-decoration:none;font-size:0.9rem}`
  ]
})
export class SocialShareComponent {
  @Input() url = typeof window !== 'undefined' ? window.location.href : '';
  @Input() title = '';

  facebookUrl() { return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.url)}`; }
  twitterUrl() { return `https://twitter.com/intent/tweet?text=${encodeURIComponent(this.title)}&url=${encodeURIComponent(this.url)}`; }
  pinterestUrl() { return `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(this.url)}&description=${encodeURIComponent(this.title)}`; }
  whatsAppUrl() { return `https://api.whatsapp.com/send?text=${encodeURIComponent(this.title + ' ' + this.url)}`; }
}
