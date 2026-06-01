import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card-skeleton.component.html',
  styleUrl: './product-card-skeleton.component.scss',
})
export class ProductCardSkeletonComponent {
  public readonly count = input(1);
  public readonly layout = input<'grid' | 'list'>('grid');

  protected readonly items = computed(() =>
    Array.from({ length: Math.max(1, this.count()) }, (_, index) => index)
  );
}
