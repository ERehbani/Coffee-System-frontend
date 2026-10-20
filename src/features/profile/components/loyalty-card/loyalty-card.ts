import { DecimalPipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { LoyaltyStatus } from '../../types/profile.model';
import { LoyaltyProgress } from '../../utils/loyalty-progress';
import { TIER_LABELS, TIER_TEXT_CLASSES } from '../../utils/loyalty-tier';
import { TierProgress } from '../tier-progress/tier-progress';

@Component({
  imports: [DecimalPipe, RouterLink, Icon, TierProgress],
  selector: 'app-loyalty-card',
  templateUrl: './loyalty-card.html',
  host: { class: 'block' },
})
export class LoyaltyCard {
  readonly loyalty = input.required<LoyaltyStatus>();
  readonly progress = input.required<LoyaltyProgress>();
  readonly scanQr = output<void>();
  readonly viewCard = output<void>();

  protected readonly tierLabel = computed(() => TIER_LABELS[this.loyalty().tier]);
  protected readonly tierClass = computed(() => TIER_TEXT_CLASSES[this.loyalty().tier]);
}
