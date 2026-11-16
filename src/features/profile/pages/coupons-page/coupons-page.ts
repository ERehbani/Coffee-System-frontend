import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { CouponItem } from '../../components/coupon-item/coupon-item';
import { ProfileStore } from '../../services/profile.store';

@Component({
  imports: [RouterLink, Icon, CouponItem],
  selector: 'app-coupons-page',
  templateUrl: './coupons-page.html',
  host: { class: 'block' },
})
export class CouponsPage {
  protected readonly store = inject(ProfileStore);
}
