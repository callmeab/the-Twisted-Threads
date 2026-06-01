import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hamburger-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hamburger-button.component.html',
  styleUrl: './hamburger-button.component.scss',
})
export class HamburgerButtonComponent {
  public readonly isOpen = input(false);
  public readonly ariaLabel = input('Open menu');

  public readonly toggled = output<void>();

  protected onClick(): void {
    this.toggled.emit();
  }
}
