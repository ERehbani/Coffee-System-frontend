import { computed, inject, linkedSignal, Service, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { AuthService } from '../../auth/services/auth.service';
import {
  ActiveRedemption,
  ClientProfile,
  ProfileDashboard,
  UpdateClientProfileInput,
} from '../types/profile.model';
import { calendarDaysUntil, LoyaltyProgress, toLoyaltyProgress } from '../utils/loyalty-progress';
import { ProfileRepository } from './profile.repository';

export type ProfileDashboardStatus = 'loading' | 'error' | 'ready';

export interface ActiveRedemptionView extends ActiveRedemption {
  readonly daysUntilExpiry: number | null;
}

@Service({ autoProvided: false })
export class ProfileStore {
  private readonly repository = inject(ProfileRepository);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  // The store outlives a logout, so the dashboard is keyed by the session: another account fetches its own.
  private readonly resource = rxResource({
    params: () => this.auth.email() ?? undefined,
    stream: () => this.repository.getDashboard(),
  });

  readonly isSaving = signal<boolean>(false);
  // A saved profile belongs to the account that saved it: it is dropped when the session changes.
  private readonly updatedProfile = linkedSignal<string | null, ClientProfile | null>({
    source: this.auth.email,
    computation: () => null,
  });

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
    if (this.resource.isLoading()) {
      return 'loading';
    }
    if (this.resource.error()) {
      return 'error';
    }
    return this.resource.hasValue() ? 'ready' : 'loading';
  });

  readonly loyaltyProgress = computed<LoyaltyProgress | null>(() => {
    const dashboard = this.dashboard();
    return dashboard ? toLoyaltyProgress(dashboard.loyalty) : null;
  });

  readonly activeRedemptions = computed<readonly ActiveRedemptionView[]>(() => {
    const redemptions = this.dashboard()?.activeRedemptions ?? [];
    const now = new Date();
    return redemptions
      .filter(
        (redemption) => !redemption.expiresAt || redemption.expiresAt.getTime() >= now.getTime(),
      )
      .map((redemption) => ({
        ...redemption,
        daysUntilExpiry: redemption.expiresAt ? calendarDaysUntil(redemption.expiresAt, now) : null,
      }));
  });

  saveProfile(input: UpdateClientProfileInput, onSuccess?: () => void): void {
    const current = this.profile();
    if (!current) {
      return;
    }

    this.isSaving.set(true);

    this.repository.updateProfile(current.id, input).subscribe({
      next: (savedProfile) => {
        this.updatedProfile.set({ ...savedProfile, email: current.email });
        this.isSaving.set(false);
        this.toast.success('¡Tus datos personales se han actualizado correctamente!', {
          label: 'Ver en perfil',
          route: '/profile',
        });
        if (onSuccess) {
          onSuccess();
        }
      },
      error: () => {
        this.isSaving.set(false);
        this.toast.error('Ocurrió un error al intentar guardar los cambios.');
      },
    });
  }

  reload(): void {
    this.resource.reload();
  }
}
