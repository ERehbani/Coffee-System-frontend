import { computed, inject, Service, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  ActiveRedemption,
  ClientProfile,
  ProfileDashboard,
  UpdateClientProfileInput,
} from '../types/profile.model';
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

@Service({ autoProvided: false })
export class ProfileStore {
  private readonly repository = inject(ProfileRepository);
  private readonly resource = rxResource({ stream: () => this.repository.getDashboard() });

  readonly isSaving = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  private readonly updatedProfile = signal<ClientProfile | null>(null);

  readonly dashboard = computed<ProfileDashboard | null>(() => {
    const raw = this.resource.hasValue() ? this.resource.value() : null;
    if (!raw) {
      return null;
    }
    const updated = this.updatedProfile();
    if (!updated) {
      return raw;
    }
    return {
      ...raw,
      profile: updated,
    };
  });

  readonly profile = computed<ClientProfile | null>(() => {
    return this.updatedProfile() ?? this.dashboard()?.profile ?? null;
  });

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

  saveProfile(input: UpdateClientProfileInput, onSuccess?: () => void): void {
    const clientId = this.profile()?.id ?? 'client-001';

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.repository.updateProfile(clientId, input).subscribe({
      next: (savedProfile) => {
        this.updatedProfile.set(savedProfile);
        this.isSaving.set(false);
        this.successMessage.set('¡Tus datos personales se han actualizado correctamente!');
        if (onSuccess) {
          onSuccess();
        }
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMessage.set('Ocurrió un error al intentar guardar los cambios.');
      },
    });
  }

  dismissSuccess(): void {
    this.successMessage.set(null);
  }

  dismissError(): void {
    this.errorMessage.set(null);
  }

  reload(): void {
    this.resource.reload();
  }
}

