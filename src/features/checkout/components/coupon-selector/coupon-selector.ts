import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { ApplicableCoupon, CouponsStatus } from '../../types/coupon.model';
import { describeCouponReward } from '../../utils/coupon-label';

@Component({
  selector: 'app-coupon-selector',
  imports: [DatePipe, Icon],
  templateUrl: './coupon-selector.html',
  host: { class: 'block' },
})
export class CouponSelector {
  readonly coupons = input.required<readonly ApplicableCoupon[]>();
  readonly status = input.required<CouponsStatus>();
  readonly selectedId = input<string | null>(null);
  readonly disabled = input(false);
  readonly couponSelected = output<string | null>();

  protected readonly options = computed(() =>
    this.coupons().map((coupon) => ({ coupon, reward: describeCouponReward(coupon.benefit) })),
  );

  protected toggle(couponId: string): void {
    this.couponSelected.emit(couponId === this.selectedId() ? null : couponId);
  }

  protected clear(): void {
    this.couponSelected.emit(null);
  }
}
