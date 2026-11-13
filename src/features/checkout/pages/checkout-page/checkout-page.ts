import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { CheckoutSummaryCard } from '../../components/checkout-summary/checkout-summary';
import { CheckoutStore } from '../../services/checkout.store';
import { CHECKOUT_SUCCESS_PATH } from '../../utils/checkout-paths';

@Component({
  selector: 'app-checkout-page',
  imports: [RouterLink, Icon, CheckoutSummaryCard],
  templateUrl: './checkout-page.html',
  host: { class: 'block' },
})
export class CheckoutPage {
  readonly store = inject(CheckoutStore);
  private readonly router = inject(Router);

  readonly catalogQueryParams = computed(() => {
    const summary = this.store.summary();
    return summary ? { cafe: summary.cafeId } : {};
  });

  constructor() {
    this.store.startCheckout();
  }

  confirm(): void {
    this.store.confirm(() => this.goToSuccess());
  }

  private goToSuccess(): void {
    this.router.navigateByUrl(CHECKOUT_SUCCESS_PATH);
  }
}
