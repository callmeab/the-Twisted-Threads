import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-skeleton.component.html',
  styleUrl: './cart-skeleton.component.scss',
})
export class CartSkeletonComponent {
  public readonly rowCount = input(3);

  protected readonly rows = computed(() =>
    Array.from({ length: Math.max(1, this.rowCount()) }, (_, index) => index)
  );
}
