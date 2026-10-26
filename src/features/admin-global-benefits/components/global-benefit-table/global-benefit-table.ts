import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { GlobalBenefit } from '../../types/global-benefit.model';
import { getBenefitTypeMeta, getTierMeta } from '../../utils/global-benefit.mapper';

@Component({
  selector: 'app-global-benefit-table',
  standalone: true,
  imports: [CommonModule, Icon],
  templateUrl: './global-benefit-table.html',
})
export class GlobalBenefitTable {
  readonly benefits = input.required<readonly GlobalBenefit[]>();
  readonly status = input<'loading' | 'ready' | 'error'>('ready');
  readonly isProcessing = input(false);

  readonly edit = output<GlobalBenefit>();
  readonly delete = output<GlobalBenefit>();
  readonly duplicate = output<GlobalBenefit>();
  readonly togglePublish = output<{ id: string; current: boolean }>();
  readonly toggleStatus = output<{ id: string; current: boolean }>();

  protected getTypeMeta = getBenefitTypeMeta;
  protected getTierMeta = getTierMeta;

  protected getProgress(current: number, max: number): number {
    return max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
  }
}
