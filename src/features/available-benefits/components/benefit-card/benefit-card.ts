import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { benefitFormatLabel } from '../../../admin-benefit-types/utils/benefit-format-labels';
import { AvailableBenefit } from '../../model/available-benefit.model';

@Component({
  selector: 'app-available-benefit-card',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './benefit-card.html',
  styleUrl: './benefit-card.css',
  host: { class: 'block h-full' },
})
export class AvailableBenefitCard {
  readonly benefit = input.required<AvailableBenefit>();
  readonly clientTierPoints = input<number | null>(null);

  typeLabel = computed(() => {
    const type = this.benefit().benefitType;
    return type ? benefitFormatLabel(type) : 'Beneficio';
  });

  cafeLabel = computed(() => (this.benefit().global ? 'Todas las cafeterías' : this.benefit().cafeEntity ?? 'Cafetería'));

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
