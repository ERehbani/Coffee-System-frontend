import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { UsedBenefit } from '../../types/profile.model';

@Component({
  imports: [DatePipe, DecimalPipe, Icon],
  selector: 'app-used-benefit-item',
  template: `
    <article
      [attr.aria-labelledby]="'used-benefit-' + benefit().id"
      class="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 shadow-2xs"
    >
      <span
        aria-hidden="true"
        class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-light text-primary"
      >
        <app-icon name="gift" [size]="20" />
      </span>
      <div class="min-w-0 flex-1 space-y-1">
        <h3
          [id]="'used-benefit-' + benefit().id"
          class="text-base leading-snug font-bold text-text"
        >
          {{ benefit().benefitName }}
        </h3>
        <p class="flex items-center gap-1.5 text-sm text-muted">
          <app-icon name="store" [size]="14" />
          <span class="sr-only">Cafetería: </span>
          {{ benefit().cafeName ?? 'Todas las cafeterías de la red' }}
        </p>
        <p class="flex items-center gap-1.5 text-sm text-muted">
          <app-icon name="clock" [size]="14" />
          <span class="sr-only">Canjeado el </span>
          <time [attr.datetime]="benefit().redeemedAt.toISOString()">
            {{ benefit().redeemedAt | date: 'd MMM y, HH:mm' }}
          </time>
        </p>
      </div>
      <p class="shrink-0 rounded-full bg-bg px-2.5 py-1 text-xs font-bold text-muted">
        −{{ benefit().usedPoints | number }} pts
      </p>
    </article>
  `,
  host: { class: 'block' },
})
export class UsedBenefitItem {
  readonly benefit = input.required<UsedBenefit>();
}
