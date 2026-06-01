import { Component, HostListener, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-sheet.component.html',
  styleUrl: './bottom-sheet.component.scss',
})
export class BottomSheetComponent {
  public readonly isOpen = input(false);
  public readonly title = input('');
  public readonly showHandle = input(true);

  public readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  protected close(): void {
    this.closed.emit();
  }

  protected onBackdropClick(): void {
    this.close();
  }
}
