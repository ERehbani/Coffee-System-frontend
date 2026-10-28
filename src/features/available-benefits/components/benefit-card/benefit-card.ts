import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { benefitFormatLabel } from '../../../admin-benefit-types/utils/benefit-format-labels';
import { AvailableBenefit } from '../../model/available-benefit.model';

@Component({
  selector: 'app-benefit-card',
  imports: [DatePipe, DecimalPipe, Icon],
  templateUrl: './benefit-card.html',
  styleUrl: './benefit-card.css',
  host: { class: 'block h-full' },
})
export class BenefitCard {
  readonly benefit = input.required<AvailableBenefit>();
  readonly clientTierPoints = input<number | null>(null);

  typeLabel = computed(() => {
    const type = this.benefit().benefitType;
    return type ? benefitFormatLabel(type) : 'Beneficio';
  });

  cafeLabel = computed(() => this.benefit().cafeEntity ?? 'Todas las cafeterías');

  isUnlocked = computed(() => {
    const requiredPoints = this.benefit().tierMinPoints;
    const clientPoints = this.clientTierPoints();

    if (requiredPoints === null) {
      return true;
    }
    return clientPoints !== null && clientPoints >= requiredPoints;
  });

  showAccess = computed(() => this.clientTierPoints() !== null);
}
