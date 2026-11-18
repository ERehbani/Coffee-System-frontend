import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { UsedBenefit, UsedBenefitStatus } from '../../types/profile.model';

const STATUS_LABELS: Record<UsedBenefitStatus, string> = { used: 'Canjeado', expired: 'Vencido' };

@Component({
  imports: [DatePipe, DecimalPipe],
  selector: 'app-used-benefit-item',
  template: `
    <article
      [attr.aria-labelledby]="'used-benefit-' + benefit().id"
      [attr.data-status]="benefit().status"
      class="flex items-start gap-3 rounded-2xl border border-dashed border-border bg-bg p-4 opacity-80"
    >
      <div class="min-w-0 flex-1 space-y-1">
        <h3 [id]="'used-benefit-' + benefit().id" class="text-base leading-snug font-bold text-muted">
          {{ benefit().benefitName }}
        </h3>
        <p class="flex items-center gap-1.5 text-sm text-muted">
          <span class="sr-only">Cafetería: </span>
          {{ benefit().cafeName ?? 'Todas las cafeterías de la red' }}
        </p>
        <p class="flex items-center gap-1.5 text-sm text-muted">
          <span class="sr-only">Canjeado el </span>
          <time [attr.datetime]="benefit().redeemedAt.toISOString()">
            {{ benefit().redeemedAt | date: 'd MMM y, HH:mm' }}
          </time>
        </p>
        @if (benefit().usedAt; as usedAt) {
          <p class="flex items-center gap-1.5 text-sm text-muted">
            Usado el
            <time [attr.datetime]="usedAt.toISOString()">{{ usedAt | date: 'd MMM y, HH:mm' }}</time>
          </p>
        }
      </div>
      <div class="flex shrink-0 flex-col items-end gap-1.5">
        <p
          class="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-bold text-muted"
        >
          {{ statusLabels[benefit().status] }}
        </p>
        <p class="rounded-full bg-surface px-2.5 py-1 text-xs font-bold text-muted">
          −{{ benefit().usedPoints | number }} pts
        </p>
      </div>
    </article>
  `,
  host: { class: 'block' },
})
export class UsedBenefitItem {
  readonly benefit = input.required<UsedBenefit>();

  protected readonly statusLabels = STATUS_LABELS;
}
