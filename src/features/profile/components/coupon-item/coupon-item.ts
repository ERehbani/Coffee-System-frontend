import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { ActiveRedemptionView } from '../../services/profile.store';

@Component({
  imports: [DatePipe, RouterLink, Icon],
  selector: 'app-coupon-item',
  templateUrl: './coupon-item.html',
  host: { class: 'block' },
})
export class CouponItem {
  readonly coupon = input.required<ActiveRedemptionView>();
}
