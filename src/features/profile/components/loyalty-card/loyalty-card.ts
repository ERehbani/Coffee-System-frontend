import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoyaltyStatus } from '../../types/profile.model';
import { LoyaltyProgress } from '../../utils/loyalty-progress';
import { toTierLabel } from '../../utils/loyalty-tier';
import { TierProgress } from '../tier-progress/tier-progress';

@Component({
  imports: [DecimalPipe, RouterLink, TierProgress],
  selector: 'app-loyalty-card',
  templateUrl: './loyalty-card.html',
  host: { class: 'block' },
})
export class LoyaltyCard {
  readonly loyalty = input.required<LoyaltyStatus>();
  readonly progress = input.required<LoyaltyProgress>();

  protected readonly tierLabel = computed(() => toTierLabel(this.loyalty().tier));
}
