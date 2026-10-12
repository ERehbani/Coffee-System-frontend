import { computed, inject, Service } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActiveRedemption, ClientDashboard } from '../domain/client-dashboard.model';
import { ClientDashboardRepository } from '../domain/client-dashboard.repository';
import {
  calculateLoyaltyProgress,
  calendarDaysUntil,
  LoyaltyProgress,
} from '../domain/loyalty-progress';

export type ClientDashboardStatus = 'loading' | 'error' | 'ready';

export interface ActiveRedemptionView extends ActiveRedemption {
  readonly daysUntilExpiry: number;
}

/** Dashboard state for the current client. Provided at the feature route level. */
@Service({ autoProvided: false })
export class ClientDashboardStore {
  private readonly repository = inject(ClientDashboardRepository);
  private readonly resource = rxResource({ stream: () => this.repository.getDashboard() });

  readonly dashboard = computed<ClientDashboard | null>(() =>
    this.resource.hasValue() ? this.resource.value() : null,
  );

  readonly status = computed<ClientDashboardStatus>(() => {
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
