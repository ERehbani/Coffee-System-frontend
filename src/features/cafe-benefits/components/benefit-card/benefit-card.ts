import { Component, computed, input } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { CafeBenefit } from '../../model/cafe-benefit.model';

@Component({
  selector: 'app-benefit-card',
  imports: [Icon],
  templateUrl: './benefit-card.html',
  styleUrl: './benefit-card.css',
  host: { class: 'block' },
})
export class BenefitCard {
  readonly benefit = input.required<CafeBenefit>();

  tierBadgeClass = computed(() => {
    const tier = this.benefit().tierName?.toUpperCase().trim();
    switch (tier) {
      case 'BRONCE':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'PLATA':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'ORO':
        return 'bg-yellow-100 text-yellow-900 border-yellow-300';
      case 'DIAMANTE':
        return 'bg-cyan-100 text-cyan-900 border-cyan-300';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  });

  tierDisplayName = computed(() => {
    const raw = this.benefit().tierName;
    if (!raw) {
      return '';
    }
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  });
}

