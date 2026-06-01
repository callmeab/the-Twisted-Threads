import { Component, CommonModule, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-optimized-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './optimized-image.component.html',
  styleUrls: ['./optimized-image.component.scss'],
})
export class OptimizedImageComponent {
  public readonly src = input('');
  public readonly alt = input('');
  public readonly width = input<number | null>(null);
  public readonly height = input<number | null>(null);
  public readonly loading = input<'lazy' | 'eager'>('lazy');
  public readonly imgClass = input('');

  protected readonly loaded = signal(false);
  protected readonly srcSet = computed(() => this.buildSrcSet(this.src(), false));
  protected readonly webpSrcSet = computed(() => this.buildSrcSet(this.src(), true));

  protected onLoad(): void {
    this.loaded.set(true);
  }

  protected imageClasses(): string {
    return `${this.imgClass || ''} optimized-img${this.loaded() ? ' loaded' : ''}`.trim();
  }

  private buildSrcSet(src: string, useWebp: boolean): string {
    if (!src) {
      return '';
    }

    const widths = [320, 600, 900, 1200];
    return widths
      .map(width => `${this.buildOptimizedUrl(src, width, useWebp)} ${width}w`)
      .join(', ');
  }

  private buildOptimizedUrl(src: string, width: number, useWebp: boolean): string {
    if (!src) {
      return src;
    }

    try {
      const url = new URL(src, location.href);
      const params = new URLSearchParams(url.search);
      params.set('w', width.toString());
      if (useWebp) {
        params.set('fm', 'webp');
      } else {
        params.delete('fm');
      }
      url.search = params.toString();
      return url.toString();
    } catch {
      return src;
    }
  }
}
