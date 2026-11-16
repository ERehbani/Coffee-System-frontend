import { Routes } from '@angular/router';
import { confirmedOrderGuard } from './guards/confirmed-order.guard';
import { CheckoutPage } from './pages/checkout-page/checkout-page';
import { CheckoutSuccessPage } from './pages/checkout-success-page/checkout-success-page';
import { CheckoutRepository } from './services/checkout.repository';
import { CheckoutStore } from './services/checkout.store';
import { HttpCheckoutRepository } from './services/http-checkout.repository';

export default [
  {
    path: '',
    providers: [{ provide: CheckoutRepository, useClass: HttpCheckoutRepository }, CheckoutStore],
    children: [
      { path: '', component: CheckoutPage },
      { path: 'success', component: CheckoutSuccessPage, canActivate: [confirmedOrderGuard] },
    ],
  },
] satisfies Routes;
