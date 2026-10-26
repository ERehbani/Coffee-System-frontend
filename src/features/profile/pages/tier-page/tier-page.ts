import { DecimalPipe } from '@angular/common';
import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { SectionHeader } from '../../components/section-header/section-header';
import { TierBenefitItem } from '../../components/tier-benefit-item/tier-benefit-item';
import { TierLevelItem } from '../../components/tier-level-item/tier-level-item';
import { TierProgress } from '../../components/tier-progress/tier-progress';
import { TierStore } from '../../services/tier.store';
import { TIER_LABELS, TIER_TEXT_CLASSES } from '../../utils/loyalty-tier';

@Component({
  imports: [
    DecimalPipe,
    RouterLink,
    Icon,
    SectionHeader,
    TierBenefitItem,
    TierLevelItem,
    TierProgress,
  ],
  selector: 'app-tier-page',
  templateUrl: './tier-page.html',
  host: { class: 'block' },
})
export class TierPage {
  protected readonly store = inject(TierStore);

  private readonly redeemedPanel = viewChild<ElementRef<HTMLElement>>('redeemedPanel');

  protected readonly tierLabel = computed(() => {
    const detail = this.store.detail();
    return detail ? TIER_LABELS[detail.tier] : '';
  });
  protected readonly tierClass = computed(() => {
    const detail = this.store.detail();
    return detail ? TIER_TEXT_CLASSES[detail.tier] : '';
  });

  constructor() {
    // The benefit that was just activated may be far down the list: bring the result into view.
    afterRenderEffect(() => {
      if (this.store.redeemed()) {
        this.redeemedPanel()?.nativeElement.focus();
      }
    });
  }
}
