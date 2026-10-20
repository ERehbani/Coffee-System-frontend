import { DecimalPipe, PercentPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { LoyaltyTier } from '../../types/profile.model';
import { TIER_LABELS, TIER_TEXT_CLASSES } from '../../utils/loyalty-tier';
import { LoyaltyProgress } from '../../utils/loyalty-progress';

@Component({
  imports: [DecimalPipe, PercentPipe],
  selector: 'app-tier-progress',
  templateUrl: './tier-progress.html',
  host: { class: 'block' },
})
export class TierProgress {
  readonly progress = input.required<LoyaltyProgress>();
  readonly lifetimePoints = input.required<number>();
  readonly nextTier = input.required<LoyaltyTier | null>();
  readonly nextTierThreshold = input.required<number | null>();

  protected readonly progressRatio = computed(() => this.progress().percent / 100);
  protected readonly nextTierLabel = computed(() => {
    const nextTier = this.nextTier();
    return nextTier ? TIER_LABELS[nextTier] : '';
  });
  protected readonly nextTierClass = computed(() => {
    const nextTier = this.nextTier();
    return nextTier ? TIER_TEXT_CLASSES[nextTier] : '';
  });
}
