import {
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
  APP_INITIALIZER,
  inject,
} from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideToastr } from 'ngx-toastr';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';

import { environment } from '../environments/environment';
import { provideFirebase } from './core/firebase/firebase.providers';
import { FirebaseHealthService } from './core/firebase/services/firebase-health.service';

import { routes } from './app.routes';
import { GlobalErrorHandler } from './services/global-error-handler';
import { HttpErrorInterceptor } from './services/http-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideAnimationsAsync(),
    // provideServiceWorker('ngsw-worker.js'),
    provideHttpClient(withInterceptorsFromDi()),
    
    // Firebase setup
    provideFirebase(environment),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const firebaseHealth = inject(FirebaseHealthService);
        return () => firebaseHealth.logBootDiagnostics();
      },
    },

    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      closeButton: true,
      progressBar: true,
      preventDuplicates: true,
    }),
  ],
};
