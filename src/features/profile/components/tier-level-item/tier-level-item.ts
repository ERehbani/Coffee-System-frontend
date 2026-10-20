import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { TierLevelView } from '../../services/tier.store';
import { TIER_LABELS, TIER_TEXT_CLASSES } from '../../utils/loyalty-tier';

@Component({
  imports: [DecimalPipe, Icon],
  selector: 'app-tier-level-item',
  templateUrl: './tier-level-item.html',
  host: { class: 'block' },
})
export class TierLevelItem {
  readonly level = input.required<TierLevelView>();

  protected readonly label = computed(() => TIER_LABELS[this.level().tier]);
  protected readonly tierClass = computed(() => TIER_TEXT_CLASSES[this.level().tier]);
}
