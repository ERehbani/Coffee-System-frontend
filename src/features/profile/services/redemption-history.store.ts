import { computed, inject, Service } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { UsedBenefit } from '../types/profile.model';
import { ProfileRepository } from './profile.repository';

export type RedemptionHistoryStatus = 'loading' | 'error' | 'ready';

@Service({ autoProvided: false })
export class RedemptionHistoryStore {
  private readonly repository = inject(ProfileRepository);
  private readonly resource = rxResource({ stream: () => this.repository.getUsedBenefits() });

  readonly usedBenefits = computed<readonly UsedBenefit[]>(() =>
    this.resource.hasValue() ? this.resource.value() : [],
  );

  readonly totalUsedPoints = computed(() =>
    this.usedBenefits().reduce((total, benefit) => total + benefit.usedPoints, 0),
  );

  readonly status = computed<RedemptionHistoryStatus>(() => {
    if (this.resource.isLoading() && !this.resource.hasValue()) {
      return 'loading';
    }
    if (this.resource.error()) {
      return 'error';
    }
    return this.resource.hasValue() ? 'ready' : 'loading';
  });

  reload(): void {
    this.resource.reload();
  }
}
