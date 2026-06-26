import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (typeof window !== 'undefined' && window.localStorage.getItem('dummyAdminLoggedIn') === 'true') {
    return true;
  }

  // user(auth) returns an Observable of the current user
  return user(auth).pipe(
    take(1),
    map(u => {
      if (u) {
        return true; // Authenticated
      } else {
        router.navigate(['/admin/login']);
        return false; // Not authenticated
      }
    })
  );
};
