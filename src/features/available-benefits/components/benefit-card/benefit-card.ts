import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { AvailableBenefit } from '../../model/available-benefit.model';
import { isBenefitUnlocked } from '../../utils/benefit-access';

@Component({
  selector: 'app-available-benefit-card',
  imports: [RouterLink, Icon],
  templateUrl: './benefit-card.html',
  host: { class: 'block' },
})
export class AvailableBenefitCard {
  readonly benefit = input.required<AvailableBenefit>();
  readonly clientTierPoints = input<number | null>(null);

  isUnlocked = computed(() => isBenefitUnlocked(this.benefit(), this.clientTierPoints()));

  showAccess = computed(() => this.clientTierPoints() !== null);
}
