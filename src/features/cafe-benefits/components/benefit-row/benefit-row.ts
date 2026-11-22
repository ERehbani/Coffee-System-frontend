import { DatePipe } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { CafeBenefit } from '../../model/cafe-benefit.model';

@Component({
  selector: 'tr[app-benefit-row]',
  imports: [DatePipe, Icon],
  templateUrl: './benefit-row.html',
})
export class BenefitRow {
  readonly benefit = input.required<CafeBenefit>();
  readonly busy = input(false);
  readonly edit = output<CafeBenefit>();
  readonly pause = output<CafeBenefit>();
  readonly resume = output<CafeBenefit>();
  readonly remove = output<CafeBenefit>();

  readonly isConfirmingRemoval = signal(false);

  tierBadgeClass = computed(() => {
    const tier = this.benefit().tierName?.toUpperCase().trim();
    switch (tier) {
      case 'BRONCE':
        return 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300';
      case 'PLATA':
        return 'bg-slate-200 text-slate-800 dark:bg-slate-400/20 dark:text-slate-200';
      case 'ORO':
        return 'bg-yellow-100 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-300';
      case 'DIAMANTE':
        return 'bg-cyan-100 text-cyan-900 dark:bg-cyan-500/20 dark:text-cyan-300';
      default:
        return 'bg-stone-200 text-stone-800 dark:bg-stone-500/25 dark:text-stone-300';
    }
  });

  tierDisplayName = computed(() => {
    const raw = this.benefit().tierName;
    if (!raw) {
      return '';
    }
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  });

  askRemoval(): void {
    this.isConfirmingRemoval.set(true);
  }

  cancelRemoval(): void {
    this.isConfirmingRemoval.set(false);
  }

  confirmRemoval(): void {
    this.isConfirmingRemoval.set(false);
    this.remove.emit(this.benefit());
  }
}
