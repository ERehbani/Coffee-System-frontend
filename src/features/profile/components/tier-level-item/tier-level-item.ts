import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { TierLevelView } from '../../services/tier.store';
import { toTierLabel } from '../../utils/loyalty-tier';

@Component({
  imports: [DecimalPipe],
  selector: 'app-tier-level-item',
  templateUrl: './tier-level-item.html',
  host: { class: 'block' },
})
export class TierLevelItem {
  readonly level = input.required<TierLevelView>();

  protected readonly label = computed(() => toTierLabel(this.level().tier));
}
