import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { AuthService } from '../../../auth/services/auth.service';
import { CheckoutStore } from '../../services/checkout.store';
import { HOME_PATH, PURCHASES_PATH } from '../../utils/checkout-paths';
import { toOrderStatusLabel } from '../../utils/order-status-label';

@Component({
  selector: 'app-checkout-success-page',
  imports: [CurrencyPipe, DatePipe, RouterLink, Icon],
  templateUrl: './checkout-success-page.html',
  host: { class: 'block' },
})
export class CheckoutSuccessPage {
  private readonly store = inject(CheckoutStore);
  private readonly auth = inject(AuthService);

  readonly order = this.store.confirmedOrder;
  readonly email = this.auth.email;
  readonly statusLabel = computed(() => {
    const order = this.order();
    return order ? toOrderStatusLabel(order.status) : '';
  });

  readonly purchasesPath = PURCHASES_PATH;
  readonly homePath = HOME_PATH;
}
