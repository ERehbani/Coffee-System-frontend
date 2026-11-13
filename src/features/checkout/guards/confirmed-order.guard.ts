import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CheckoutStore } from '../services/checkout.store';
import { PURCHASES_PATH } from '../utils/checkout-paths';

export const confirmedOrderGuard: CanActivateFn = () => {
  const store = inject(CheckoutStore);
  const router = inject(Router);

  return store.confirmedOrder() !== null || router.parseUrl(PURCHASES_PATH);
};
