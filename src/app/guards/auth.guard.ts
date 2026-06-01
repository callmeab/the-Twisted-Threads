import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartService } from '../services/cart.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const cartService = inject(CartService);

  // Prevent users from accessing checkout if their shopping cart is empty
  if (cartService.items().length > 0) {
    return true;
  }

  // Redirect to cart page
  router.navigate(['/cart']);
  return false;
};
