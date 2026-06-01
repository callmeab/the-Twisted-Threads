import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../../services/loader.service';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './global-loader.component.html',
  styleUrl: './global-loader.component.scss',
})
export class GlobalLoaderComponent {
  protected readonly loader = inject(LoaderService);
  protected readonly visible = signal(false);
  protected readonly fadingOut = signal(false);

  constructor() {
    effect(() => {
      const loading = this.loader.isLoading();
      if (loading) {
        this.fadingOut.set(false);
        this.visible.set(true);
      } else if (this.visible()) {
        this.fadingOut.set(true);
        setTimeout(() => {
          if (!this.loader.isLoading()) {
            this.visible.set(false);
            this.fadingOut.set(false);
          }
        }, 280);
      }
    });
  }
}
