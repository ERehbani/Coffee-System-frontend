import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { TierLevelView } from '../../services/tier.store';
import { toTierLabel, toTierTextClass } from '../../utils/loyalty-tier';

@Component({
  imports: [DecimalPipe, Icon],
  selector: 'app-tier-level-item',
  templateUrl: './tier-level-item.html',
  host: { class: 'block' },
})
export class TierLevelItem {
  readonly level = input.required<TierLevelView>();

  protected readonly label = computed(() => toTierLabel(this.level().tier));
  protected readonly tierClass = computed(() => toTierTextClass(this.level().tier));
}
