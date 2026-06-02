import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnDestroy,
  AfterViewInit,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';
register();

type SwiperInstance = { activeIndex: number; slideTo: (index: number) => void };

@Component({
  selector: 'app-product-image-gallery',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './product-image-gallery.component.html',
  styleUrl: './product-image-gallery.component.scss',
})
export class ProductImageGalleryComponent implements AfterViewInit, OnDestroy {
  public readonly images = input<string[]>([]);
  public readonly productName = input('');
  public readonly badges = input<{ isNew?: boolean; discount?: number; inStock?: boolean }>({});

  public readonly activeIndexChange = output<number>();
  public readonly openFullscreen = output<number>();

  private readonly swiperRef = viewChild<ElementRef<HTMLElement & { swiper?: SwiperInstance }>>('swiperEl');
  protected readonly activeIndex = signal(0);
  protected readonly fullscreenOpen = signal(false);
  protected readonly zoomScale = signal(1);
  protected readonly zoomX = signal(0);
  protected readonly zoomY = signal(0);

  private pinchStartDistance = 0;
  private pinchStartScale = 1;
  private lastTouchX = 0;
  private lastTouchY = 0;
  private panning = false;

  public ngAfterViewInit(): void {
    queueMicrotask(() => this.bindSwiper());
  }

  public ngOnDestroy(): void {
    if (typeof document !== 'undefined' && this.fullscreenOpen()) {
      document.body.classList.remove('gallery-fullscreen-open');
    }
  }

  protected onSlideChange(event: Event): void {
    const swiper = (event as CustomEvent).detail?.[0] as SwiperInstance | undefined;
    if (!swiper) {
      return;
    }
    this.activeIndex.set(swiper.activeIndex);
    this.activeIndexChange.emit(swiper.activeIndex);
    this.resetZoom();
  }

  protected selectThumb(index: number): void {
    const el = this.swiperRef()?.nativeElement;
    el?.swiper?.slideTo(index);
    this.activeIndex.set(index);
  }

  protected openGallery(index?: number): void {
    const i = index ?? this.activeIndex();
    this.activeIndex.set(i);
    this.fullscreenOpen.set(true);
    document.body.classList.add('gallery-fullscreen-open');
    this.openFullscreen.emit(i);
    this.resetZoom();
  }

  protected closeFullscreen(): void {
    this.fullscreenOpen.set(false);
    document.body.classList.remove('gallery-fullscreen-open');
    this.resetZoom();
  }

  protected fullscreenPrev(): void {
    const imgs = this.images();
    if (!imgs.length) {
      return;
    }
    this.activeIndex.update(i => (i - 1 + imgs.length) % imgs.length);
    this.resetZoom();
  }

  protected fullscreenNext(): void {
    const imgs = this.images();
    if (!imgs.length) {
      return;
    }
    this.activeIndex.update(i => (i + 1) % imgs.length);
    this.resetZoom();
  }

  protected onFullscreenTouchStart(event: TouchEvent): void {
    if (event.touches.length === 2) {
      this.pinchStartDistance = this.getTouchDistance(event.touches);
      this.pinchStartScale = this.zoomScale();
      this.panning = false;
      return;
    }
    if (event.touches.length === 1 && this.zoomScale() > 1) {
      this.panning = true;
      this.lastTouchX = event.touches[0].clientX;
      this.lastTouchY = event.touches[0].clientY;
    }
  }

  protected onFullscreenTouchMove(event: TouchEvent): void {
    if (event.touches.length === 2) {
      event.preventDefault();
      const distance = this.getTouchDistance(event.touches);
      const scale = Math.min(4, Math.max(1, (this.pinchStartScale * distance) / this.pinchStartDistance));
      this.zoomScale.set(scale);
      return;
    }
    if (this.panning && event.touches.length === 1) {
      const dx = event.touches[0].clientX - this.lastTouchX;
      const dy = event.touches[0].clientY - this.lastTouchY;
      this.zoomX.update(x => x + dx);
      this.zoomY.update(y => y + dy);
      this.lastTouchX = event.touches[0].clientX;
      this.lastTouchY = event.touches[0].clientY;
    }
  }

  protected onFullscreenTouchEnd(event: TouchEvent): void {
    if (event.touches.length === 0) {
      this.panning = false;
      if (this.zoomScale() < 1.05) {
        this.resetZoom();
      }
    }
  }

  protected fullscreenTransform(): string {
    return `translate(${this.zoomX()}px, ${this.zoomY()}px) scale(${this.zoomScale()})`;
  }

  protected onFullscreenSwipeStart(event: TouchEvent): void {
    if (this.zoomScale() > 1) {
      return;
    }
    this.lastTouchX = event.touches[0].clientX;
  }

  protected onFullscreenSwipeEnd(event: TouchEvent): void {
    if (this.zoomScale() > 1) {
      return;
    }
    const dx = event.changedTouches[0].clientX - this.lastTouchX;
    if (dx > 60) {
      this.fullscreenPrev();
    } else if (dx < -60) {
      this.fullscreenNext();
    }
  }

  private bindSwiper(): void {
    const el = this.swiperRef()?.nativeElement;
    if (!el) {
      return;
    }
    el.addEventListener('swiperslidechange', (e: Event) => this.onSlideChange(e));
  }

  private getTouchDistance(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  protected goToSlide(index: number): void {
    this.activeIndex.set(index);
    this.resetZoom();
  }

  private resetZoom(): void {
    this.zoomScale.set(1);
    this.zoomX.set(0);
    this.zoomY.set(0);
  }
}
