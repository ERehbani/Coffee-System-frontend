import { computed, inject, Service } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActiveRedemption, ProfileDashboard } from '../types/profile.model';
import {
  calculateLoyaltyProgress,
  calendarDaysUntil,
  LoyaltyProgress,
} from '../utils/loyalty-progress';
import { ProfileRepository } from './profile.repository';

export type ProfileDashboardStatus = 'loading' | 'error' | 'ready';

export interface ActiveRedemptionView extends ActiveRedemption {
  readonly daysUntilExpiry: number;
}

/** Dashboard state for the current client. Provided at the feature route level. */
@Service({ autoProvided: false })
export class ProfileStore {
  private readonly repository = inject(ProfileRepository);
  private readonly resource = rxResource({ stream: () => this.repository.getDashboard() });

  readonly dashboard = computed<ProfileDashboard | null>(() =>
    this.resource.hasValue() ? this.resource.value() : null,
  );

  readonly status = computed<ProfileDashboardStatus>(() => {
    if (this.resource.isLoading() && !this.resource.hasValue()) {
      return 'loading';
    }
    if (this.resource.error()) {
      return 'error';
    }
    return this.resource.hasValue() ? 'ready' : 'loading';
  });

  readonly loyaltyProgress = computed<LoyaltyProgress | null>(() => {
    const dashboard = this.dashboard();
    return dashboard ? calculateLoyaltyProgress(dashboard.loyalty) : null;
  });

  readonly activeRedemptions = computed<readonly ActiveRedemptionView[]>(() => {
    const redemptions = this.dashboard()?.activeRedemptions ?? [];
    const now = new Date();
    return redemptions.map((redemption) => ({
      ...redemption,
      daysUntilExpiry: calendarDaysUntil(redemption.expiresAt, now),
    }));
  });

  reload(): void {
    this.resource.reload();
  }
}
