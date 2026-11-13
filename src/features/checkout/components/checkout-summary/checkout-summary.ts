import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { CheckoutSummary } from '../../types/checkout.model';

@Component({
  selector: 'app-checkout-summary',
  imports: [CurrencyPipe, Icon],
  templateUrl: './checkout-summary.html',
  host: { class: 'block' },
})
export class CheckoutSummaryCard {
  readonly summary = input.required<CheckoutSummary>();
}
