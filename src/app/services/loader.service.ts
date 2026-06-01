import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private readonly loadingSignal = signal(false);
  private readonly messageSignal = signal('Loading...');
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  public readonly isLoading = this.loadingSignal.asReadonly();
  public readonly message = this.messageSignal.asReadonly();

  public show(message = 'Loading...'): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    this.messageSignal.set(message);
    this.loadingSignal.set(true);
  }

  public hide(delayMs = 0): void {
    if (delayMs > 0) {
      this.hideTimer = setTimeout(() => this.hideNow(), delayMs);
      return;
    }
    this.hideNow();
  }

  public async wrap<T>(task: () => Promise<T>, message = 'Loading...'): Promise<T> {
    this.show(message);
    try {
      return await task();
    } finally {
      this.hide(150);
    }
  }

  private hideNow(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    this.loadingSignal.set(false);
  }
}
