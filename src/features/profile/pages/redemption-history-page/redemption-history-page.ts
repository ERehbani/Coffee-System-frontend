import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { UsedBenefitItem } from '../../components/used-benefit-item/used-benefit-item';
import { RedemptionHistoryStore } from '../../services/redemption-history.store';

@Component({
  imports: [DecimalPipe, RouterLink, Icon, UsedBenefitItem],
  selector: 'app-redemption-history-page',
  templateUrl: './redemption-history-page.html',
  host: { class: 'block' },
})
export class RedemptionHistoryPage {
  protected readonly store = inject(RedemptionHistoryStore);
}
