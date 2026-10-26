import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { Purchase } from '../../model/purchase.model';

@Component({
  selector: 'app-purchase-card',
  imports: [CurrencyPipe, DatePipe, Icon],
  templateUrl: './purchase-card.html',
  host: { class: 'block' },
})
export class PurchaseCard {
  readonly purchase = input.required<Purchase>();

  earnedPoints = computed(() => {
    return this.purchase().details.reduce((total, detail) => total + detail.generatedPoints, 0);
  });
}
