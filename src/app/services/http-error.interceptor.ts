import { inject, Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, mergeMap, retryWhen, scan } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class HttpErrorInterceptor implements HttpInterceptor {
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((retryCount, error) => {
            if (
              retryCount >= 1 ||
              !(error instanceof HttpErrorResponse) ||
              (error.status !== 0 && error.status < 500)
            ) {
              throw error;
            }
            return retryCount + 1;
          }, 0),
          mergeMap(() => timer(1000))
        )
      ),
      catchError((error: HttpErrorResponse) => {
        const title = error.status === 0 ? 'Network error' : 'Request failed';
        const message = this.getErrorMessage(error);

        if (error.status === 404) {
          this.router.navigate(['/not-found']);
        } else if (error.status >= 500) {
          this.router.navigate(['/server-error']);
        }

        this.toastr.error(message, title, {
          timeOut: 5000,
          closeButton: true,
          progressBar: true,
        });

        return throwError(() => error);
      })
    );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No internet connection detected. Check your network and try again.';
    }

    if (error.error && typeof error.error === 'string') {
      return error.error;
    }

    if (error.status >= 500) {
      return 'The server encountered a problem. Please try again later.';
    }

    if (error.status === 404) {
      return 'The requested resource was not found.';
    }

    return 'An unexpected error occurred while processing your request.';
  }
}
