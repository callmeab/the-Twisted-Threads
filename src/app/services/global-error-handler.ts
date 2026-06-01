import { ErrorHandler, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler implements ErrorHandler {
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  handleError(error: unknown): void {
    console.error('[GlobalErrorHandler]', error);

    const currentUrl = this.router.url;
    if (currentUrl !== '/server-error') {
      this.toastr.error(
        'Something unexpected occurred. Please refresh the page or try again later.',
        'Application error',
        {
          timeOut: 5000,
          closeButton: true,
          progressBar: true,
        }
      );
      this.router.navigate(['/server-error']);
    }
  }
}
