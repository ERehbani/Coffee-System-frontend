import {
  computed,
  DestroyRef,
  inject,
  Injector,
  linkedSignal,
  Service,
  signal,
} from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RedeemedBenefit, TierBenefit, TierDetail, TierLevel } from '../types/profile.model';
import { LoyaltyProgress, toLoyaltyProgress } from '../utils/loyalty-progress';
import { ProfileRepository } from './profile.repository';
import { ProfileStore } from './profile.store';

export type TierDetailStatus = 'loading' | 'error' | 'ready';

export type TierBenefitsStatus = 'loading' | 'error' | 'ready';

export const REDEEM_ERROR_MESSAGE =
  'No pudimos canjear este beneficio. Revisa tus puntos e inténtalo de nuevo.';

export type TierBenefitPhase = 'idle' | 'confirming' | 'redeeming';

export interface TierBenefitView extends TierBenefit {
  /** Points the client still needs to afford the benefit; 0 when affordable. */
  readonly missingPoints: number;
  readonly phase: TierBenefitPhase;
  /** Another benefit is being redeemed, so this one cannot be requested yet. */
  readonly locked: boolean;
  readonly errorMessage: string | null;
}

type RedeemState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'confirming'; readonly benefitId: string }
  | { readonly kind: 'redeeming'; readonly benefitId: string }
  | { readonly kind: 'failed'; readonly benefitId: string };

export type TierLevelState = 'reached' | 'current' | 'locked';

export interface TierLevelView extends TierLevel {
  readonly state: TierLevelState;
}

@Service({ autoProvided: false })
export class TierStore {
  private readonly repository = inject(ProfileRepository);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly resource = rxResource({ stream: () => this.repository.getTierDetail() });
  private readonly benefitsResource = rxResource({
    stream: () => this.repository.getTierBenefits(),
  });
  private readonly redeemState = signal<RedeemState>({ kind: 'idle' });
  private readonly redeemedState = signal<RedeemedBenefit | null>(null);
  /** The route injector outlives the page, so the store must know whether anyone is looking. */
  private pageOpen = true;

  /** The latest successful redemption, shown until it is dismissed or another one starts. */
  readonly redeemed = this.redeemedState.asReadonly();

  /** The last tier detail that loaded: a failed refresh must not take it away. */
  readonly detail = linkedSignal<TierDetail | null, TierDetail | null>({
    source: () => (this.resource.hasValue() ? this.resource.value() : null),
    computation: (loaded, previous) => loaded ?? previous?.value ?? null,
  });

  readonly status = computed<TierDetailStatus>(() => {
    if (this.detail()) {
      return 'ready';
    }
    if (this.resource.error()) {
      return 'error';
    }
    return 'loading';
  });

  /** A refresh failed while a previous detail is still on screen: show it, without blocking. */
  readonly detailRefreshFailed = computed(
    () => this.detail() !== null && this.resource.error() !== undefined,
  );

  readonly availablePoints = computed(() => this.detail()?.availablePoints ?? 0);

  readonly benefitsStatus = computed<TierBenefitsStatus>(() => {
    if (this.benefitsResource.isLoading() && !this.benefitsResource.hasValue()) {
      return 'loading';
    }
    if (this.benefitsResource.error()) {
      return 'error';
    }
    return this.benefitsResource.hasValue() ? 'ready' : 'loading';
  });

  readonly benefits = computed<readonly TierBenefitView[]>(() => {
    const benefits = this.benefitsResource.hasValue() ? this.benefitsResource.value() : [];
    const points = this.availablePoints();
    const state = this.redeemState();
    return benefits.map((benefit) => {
      const isTarget = state.kind !== 'idle' && state.benefitId === benefit.id;
      return {
        ...benefit,
        missingPoints: Math.max(benefit.pointsCost - points, 0),
        phase:
          isTarget && (state.kind === 'confirming' || state.kind === 'redeeming')
            ? state.kind
            : 'idle',
        locked: state.kind === 'redeeming' && !isTarget,
        errorMessage: isTarget && state.kind === 'failed' ? REDEEM_ERROR_MESSAGE : null,
      };
    });
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

  reloadBenefits(): void {
    this.benefitsResource.reload();
  }

  /** Opens the confirm step for an affordable benefit; spending points needs a second click. */
  requestRedeem(benefitId: string): void {
    if (this.redeemState().kind === 'redeeming') {
      return;
    }
    const benefit = this.benefits().find(({ id }) => id === benefitId);
    if (!benefit || benefit.missingPoints > 0) {
      return;
    }
    this.redeemedState.set(null);
    this.redeemState.set({ kind: 'confirming', benefitId });
  }

  cancelRedeem(): void {
    if (this.redeemState().kind === 'confirming') {
      this.redeemState.set({ kind: 'idle' });
    }
  }

  confirmRedeem(): void {
    const state = this.redeemState();
    if (state.kind !== 'confirming') {
      return;
    }
    this.redeemState.set({ kind: 'redeeming', benefitId: state.benefitId });
    this.repository
      .redeemBenefit(state.benefitId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (redeemed) => {
          // Kept even when the page was left meanwhile: the points are spent, so the client
          // finds the code waiting on return.
          this.redeemedState.set(redeemed);
          this.redeemState.set({ kind: 'idle' });
          this.refreshAfterRedemption();
        },
        error: () =>
          this.redeemState.set(
            this.pageOpen ? { kind: 'failed', benefitId: state.benefitId } : { kind: 'idle' },
          ),
      });
  }

  /** The tier page is shown (again). */
  enter(): void {
    this.pageOpen = true;
  }

  /**
   * The tier page is gone. Transient redeem state (open confirm step, error, success panel)
   * must not reappear on return. A request in flight is kept: its points are spent anyway and
   * its outcome still refreshes the data.
   */
  leave(): void {
    this.pageOpen = false;
    if (this.redeemState().kind !== 'redeeming') {
      this.redeemState.set({ kind: 'idle' });
    }
    this.redeemedState.set(null);
  }

  dismissRedeemed(): void {
    this.redeemedState.set(null);
  }

  private refreshAfterRedemption(): void {
    this.resource.reload();
    this.benefitsResource.reload();
    // The profile store lives in the parent route and may already hold a stale dashboard: its
    // points and active redemptions feed the loyalty card and the coupon detail ("Ver cupón").
    this.injector.get(ProfileStore, null)?.reload();
  }
}
