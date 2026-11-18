import { CurrencyPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { CheckoutSummary } from '../../types/checkout.model';
import { CouponPreview } from '../../types/coupon.model';

@Component({
  selector: 'app-checkout-summary',
  imports: [CurrencyPipe],
  templateUrl: './checkout-summary.html',
  host: { class: 'block' },
})
export class CheckoutSummaryCard {
  readonly summary = input.required<CheckoutSummary>();
  readonly preview = input<CouponPreview | null>(null);

  protected readonly total = computed(() => this.preview()?.total ?? this.summary().total);
}
