import { Component, signal, ElementRef, ViewChild, OnDestroy, AfterViewInit, NgZone } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements AfterViewInit, OnDestroy {
  @ViewChild('whatsappBtn') whatsappBtnRef!: ElementRef<HTMLElement>;

  emailInput = '';
  isSubscribed = signal<boolean>(false);

  // Drag state
  private isDragging = false;
  private hasDragged = false;
  private startX = 0;
  private startY = 0;
  private startLeft = 0;
  private startTop = 0;

  // Saved position (px from top-left)
  posX = -1; // -1 = not initialized yet
  posY = -1;

  private boundMouseMove = this.onMouseMove.bind(this);
  private boundMouseUp   = this.onMouseUp.bind(this);
  private boundTouchMove = this.onTouchMove.bind(this);
  private boundTouchEnd  = this.onTouchEnd.bind(this);

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit() {
    // Set initial position: bottom-right corner (mirrors CSS default)
    const el = this.whatsappBtnRef.nativeElement;
    const size = el.offsetWidth || 58;
    const gap = 28;
    this.posX = window.innerWidth  - size - gap;
    this.posY = window.innerHeight - size - gap;
    this.applyPos();
  }

  ngOnDestroy() {
    this.removeListeners();
  }

  // ── Mouse events ──────────────────────────────────────────────
  onMouseDown(event: MouseEvent) {
    // Only drag with primary button
    if (event.button !== 0) return;
    event.preventDefault();
    this.startDrag(event.clientX, event.clientY);
    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('mousemove', this.boundMouseMove);
      document.addEventListener('mouseup',   this.boundMouseUp);
    });
  }

  private onMouseMove(event: MouseEvent) {
    this.moveDrag(event.clientX, event.clientY);
  }

  private onMouseUp(event: MouseEvent) {
    this.endDrag();
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup',   this.boundMouseUp);
  }

  // ── Touch events ──────────────────────────────────────────────
  onTouchStart(event: TouchEvent) {
    const t = event.touches[0];
    this.startDrag(t.clientX, t.clientY);
    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('touchmove', this.boundTouchMove, { passive: false });
      document.addEventListener('touchend',  this.boundTouchEnd);
    });
  }

  private onTouchMove(event: TouchEvent) {
    event.preventDefault(); // prevent page scroll while dragging
    const t = event.touches[0];
    this.moveDrag(t.clientX, t.clientY);
  }

  private onTouchEnd() {
    this.endDrag();
    document.removeEventListener('touchmove', this.boundTouchMove);
    document.removeEventListener('touchend',  this.boundTouchEnd);
  }

  // ── Core drag logic ───────────────────────────────────────────
  private startDrag(clientX: number, clientY: number) {
    this.isDragging = true;
    this.hasDragged = false;
    this.startX    = clientX;
    this.startY    = clientY;
    this.startLeft = this.posX;
    this.startTop  = this.posY;
    const el = this.whatsappBtnRef.nativeElement;
    el.classList.add('is-dragging');
  }

  private moveDrag(clientX: number, clientY: number) {
    if (!this.isDragging) return;
    const dx = clientX - this.startX;
    const dy = clientY - this.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) this.hasDragged = true;

    const el = this.whatsappBtnRef.nativeElement;
    const size = el.offsetWidth;
    const maxX = window.innerWidth  - size;
    const maxY = window.innerHeight - size;

    this.posX = Math.min(Math.max(0, this.startLeft + dx), maxX);
    this.posY = Math.min(Math.max(0, this.startTop  + dy), maxY);
    this.applyPos();
  }

  private endDrag() {
    this.isDragging = false;
    const el = this.whatsappBtnRef.nativeElement;
    el.classList.remove('is-dragging');

    // Snap to nearest side (left or right wall)
    const size  = el.offsetWidth;
    const midX  = window.innerWidth / 2;
    const gap   = 16;
    this.posX   = this.posX + size / 2 < midX ? gap : window.innerWidth - size - gap;
    this.applyPos(true); // animated snap
  }

  /** onClick — only fire if user didn't actually drag */
  onBtnClick(event: MouseEvent) {
    if (this.hasDragged) {
      event.preventDefault();
    }
  }

  private applyPos(animate = false) {
    const el = this.whatsappBtnRef.nativeElement;
    if (animate) {
      el.style.transition = 'left 0.35s cubic-bezier(.4,0,.2,1), top 0.35s cubic-bezier(.4,0,.2,1)';
    } else {
      el.style.transition = 'none';
    }
    el.style.left = `${this.posX}px`;
    el.style.top  = `${this.posY}px`;
  }

  private removeListeners() {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup',   this.boundMouseUp);
    document.removeEventListener('touchmove', this.boundTouchMove);
    document.removeEventListener('touchend',  this.boundTouchEnd);
  }

  onSubscribe(event: Event) {
    event.preventDefault();
    if (this.emailInput.trim()) {
      this.isSubscribed.set(true);
      this.emailInput = '';
      setTimeout(() => {
        this.isSubscribed.set(false);
      }, 5000);
    }
  }
}
