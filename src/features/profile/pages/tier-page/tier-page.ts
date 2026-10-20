import { DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { SectionHeader } from '../../components/section-header/section-header';
import { TierLevelItem } from '../../components/tier-level-item/tier-level-item';
import { TierProgress } from '../../components/tier-progress/tier-progress';
import { TierStore } from '../../services/tier.store';
import { TIER_LABELS, TIER_TEXT_CLASSES } from '../../utils/loyalty-tier';

@Component({
  imports: [DecimalPipe, RouterLink, Icon, SectionHeader, TierLevelItem, TierProgress],
  selector: 'app-tier-page',
  templateUrl: './tier-page.html',
  host: { class: 'block' },
})
export class TierPage {
  protected readonly store = inject(TierStore);

  protected readonly tierLabel = computed(() => {
    const detail = this.store.detail();
    return detail ? TIER_LABELS[detail.tier] : '';
  });
  protected readonly tierClass = computed(() => {
    const detail = this.store.detail();
    return detail ? TIER_TEXT_CLASSES[detail.tier] : '';
  });
}
