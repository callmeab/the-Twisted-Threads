import { Directive, ElementRef, HostListener, OnDestroy, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appFocusTrap]'
})
export class FocusTrapDirective implements AfterViewInit, OnDestroy {
  private previousFocused?: HTMLElement | null;
  private focusableSelectors = [
    'a[href]',
    'area[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'iframe',
    'object',
    'embed',
    '[contenteditable]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.previousFocused = document.activeElement as HTMLElement;
    // move focus into the container
    const first = this.getFocusableElements()[0] as HTMLElement | undefined;
    if (first) {
      first.focus();
    } else {
      this.el.nativeElement.setAttribute('tabindex', '-1');
      this.el.nativeElement.focus();
    }
  }

  ngOnDestroy(): void {
    if (this.previousFocused && typeof this.previousFocused.focus === 'function') {
      this.previousFocused.focus();
    }
  }

  private getFocusableElements(): HTMLElement[] {
    const nodes = Array.from(this.el.nativeElement.querySelectorAll<HTMLElement>(this.focusableSelectors));
    return nodes.filter(n => !!(n.offsetWidth || n.offsetHeight || n.getClientRects().length));
  }

  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;
    const focusable = this.getFocusableElements();
    if (!focusable.length) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      if (active === first || active === this.el.nativeElement) {
        last.focus();
        event.preventDefault();
      }
    } else {
      if (active === last) {
        first.focus();
        event.preventDefault();
      }
    }
  }
}
