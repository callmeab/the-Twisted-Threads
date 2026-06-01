import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SpinnerVariant = 'ring' | 'dots' | 'brand';

export type SpinnerSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
})
export class SpinnerComponent {
  public readonly variant = input<SpinnerVariant>('ring');
  public readonly size = input<SpinnerSize>('md');
}
