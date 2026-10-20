import { computed, inject, Service } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TierDetail, TierLevel } from '../types/profile.model';
import { LoyaltyProgress, toLoyaltyProgress } from '../utils/loyalty-progress';
import { ProfileRepository } from './profile.repository';

export type TierDetailStatus = 'loading' | 'error' | 'ready';

export type TierLevelState = 'reached' | 'current' | 'locked';

export interface TierLevelView extends TierLevel {
  readonly state: TierLevelState;
}

@Service({ autoProvided: false })
export class TierStore {
  private readonly repository = inject(ProfileRepository);
  private readonly resource = rxResource({ stream: () => this.repository.getTierDetail() });

  readonly detail = computed<TierDetail | null>(() =>
    this.resource.hasValue() ? this.resource.value() : null,
  );

  readonly status = computed<TierDetailStatus>(() => {
    if (this.resource.isLoading() && !this.resource.hasValue()) {
      return 'loading';
    }
    if (this.resource.error()) {
      return 'error';
    }
    return this.resource.hasValue() ? 'ready' : 'loading';
  });

  readonly progress = computed<LoyaltyProgress | null>(() => {
    const detail = this.detail();
    return detail ? toLoyaltyProgress(detail) : null;
  });

  readonly levels = computed<readonly TierLevelView[]>(() => {
    const detail = this.detail();
    if (!detail) {
      return [];
    }
    const currentIndex = detail.levels.findIndex((level) => level.tier === detail.tier);
    return detail.levels.map((level, index) => ({
      ...level,
      state: index < currentIndex ? 'reached' : index === currentIndex ? 'current' : 'locked',
    }));
  });

  reload(): void {
    this.resource.reload();
  }
}
