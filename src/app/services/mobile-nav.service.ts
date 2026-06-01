import { Injectable, signal } from '@angular/core';

const BODY_LOCK_CLASS = 'mobile-nav-open';

@Injectable({
  providedIn: 'root',
})
export class MobileNavService {
  private readonly openSignal = signal(false);

  public readonly isOpen = this.openSignal.asReadonly();

  public open(): void {
    this.setOpen(true);
  }

  public close(): void {
    this.setOpen(false);
  }

  public toggle(): void {
    this.setOpen(!this.openSignal());
  }

  private setOpen(open: boolean): void {
    this.openSignal.set(open);
    if (typeof document === 'undefined') {
      return;
    }
    document.body.classList.toggle(BODY_LOCK_CLASS, open);
    document.documentElement.classList.toggle(BODY_LOCK_CLASS, open);
  }
}
