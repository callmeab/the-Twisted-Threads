import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.scss',
})
export class StarRatingComponent {
  public readonly value = input<number>(0);
  public readonly readonly = input(false);
  public readonly size = input<'sm' | 'md' | 'lg'>('md');
  public readonly showLabel = input(false);

  public readonly valueChange = output<number>();

  protected readonly hoverValue = signal(0);
  protected readonly animateIndex = signal(0);

  protected readonly stars = [1, 2, 3, 4, 5] as const;

  protected displayValue(): number {
    if (!this.readonly() && this.hoverValue() > 0) {
      return this.hoverValue();
    }
    return this.value();
  }

  protected onEnter(star: number): void {
    if (this.readonly()) {
      return;
    }
    this.hoverValue.set(star);
  }

  protected onLeave(): void {
    this.hoverValue.set(0);
  }

  protected onSelect(star: number): void {
    if (this.readonly()) {
      return;
    }
    this.animateIndex.set(star);
    setTimeout(() => this.animateIndex.set(0), 400);
    this.valueChange.emit(star);
  }

  protected isFilled(star: number): boolean {
    return star <= this.displayValue();
  }

  protected isAnimated(star: number): boolean {
    return !this.readonly() && this.animateIndex() === star;
  }
}
