import { DecimalPipe, PercentPipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { LoyaltyStatus, LoyaltyTier } from '../../types/profile.model';
import { LoyaltyProgress } from '../../utils/loyalty-progress';

const TIER_LABELS: Record<LoyaltyTier, string> = {
  bronze: 'BRONCE',
  silver: 'PLATA',
  gold: 'ORO',
  diamond: 'DIAMANTE',
};

// Every tier color passes 4.5:1 on the dark card except bronze (3:1), used for icons only.
const TIER_TEXT_CLASSES: Record<LoyaltyTier, string> = {
  bronze: 'text-bronze',
  silver: 'text-silver',
  gold: 'text-gold',
  diamond: 'text-diamond',
};

@Component({
  imports: [DecimalPipe, PercentPipe, Icon],
  selector: 'app-loyalty-card',
  templateUrl: './loyalty-card.html',
  host: { class: 'block' },
})
export class LoyaltyCard {
  readonly loyalty = input.required<LoyaltyStatus>();
  readonly progress = input.required<LoyaltyProgress>();
  readonly scanQr = output<void>();
  readonly viewCard = output<void>();

  // PercentPipe expects a ratio (0..1); progress is expressed as 0..100.
  protected readonly progressRatio = computed(() => this.progress().percent / 100);
  protected readonly tierLabel = computed(() => TIER_LABELS[this.loyalty().tier]);
  protected readonly tierClass = computed(() => TIER_TEXT_CLASSES[this.loyalty().tier]);
  protected readonly nextTierLabel = computed(() => {
    const nextTier = this.loyalty().nextTier;
    return nextTier ? TIER_LABELS[nextTier] : '';
  });
  protected readonly nextTierClass = computed(() => {
    const nextTier = this.loyalty().nextTier;
    return nextTier ? TIER_TEXT_CLASSES[nextTier] : '';
  });
}
