import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { LogoutButton } from '../../../auth/components/logout-button/logout-button';
import { ActiveRedemptionCard } from '../../components/active-redemption-card/active-redemption-card';
import { DashboardHeader } from '../../components/dashboard-header/dashboard-header';
import {
  FeaturedBenefitCard,
  FeaturedBenefitPhase,
} from '../../components/featured-benefit-card/featured-benefit-card';
import { LoyaltyCard } from '../../components/loyalty-card/loyalty-card';
import { NearbyCafeCard } from '../../components/nearby-cafe-card/nearby-cafe-card';
import { QuickActionId, QuickActions } from '../../components/quick-actions/quick-actions';
import { SectionHeader } from '../../components/section-header/section-header';
import { ProfileRepository } from '../../services/profile.repository';
import { ProfileStore } from '../../services/profile.store';
import { toRedeemErrorMessage } from '../../utils/redeem-error';

interface RedeemTarget {
  readonly id: string;
  readonly phase: Exclude<FeaturedBenefitPhase, 'idle'>;
}

const QUICK_ACTION_PATHS: Record<QuickActionId, string> = {
  'redeem-points': '/rewards',
  'order-in-store': '/catalog',
  'my-coupons': '/profile/coupons',
  'write-review': '/purchases',
};

@Component({
  imports: [
    RouterLink,
    Icon,
    DashboardHeader,
    LoyaltyCard,
    QuickActions,
    SectionHeader,
    ActiveRedemptionCard,
    NearbyCafeCard,
    FeaturedBenefitCard,
    LogoutButton,
  ],
  selector: 'app-profile-page',
  templateUrl: './profile-page.html',
  host: { class: 'block' },
})
export class ProfilePage {
  protected readonly store = inject(ProfileStore);
  private readonly repository = inject(ProfileRepository);
  private readonly router = inject(Router);

  protected readonly redeemTarget = signal<RedeemTarget | null>(null);
  private readonly redeemSuccess = signal<string | null>(null);
  protected readonly redeemError = signal<string | null>(null);
  // El aviso del canje es propio de esta pantalla; el de guardar el perfil sigue viniendo del store.
  protected readonly successMessage = computed(
    () => this.redeemSuccess() ?? this.store.successMessage(),
  );

  private readonly feedback = viewChild<ElementRef<HTMLElement>>('feedback');

  constructor() {
    this.store.reload();
    // Al terminar un canje el panel se recarga: el aviso queda arriba y se lleva el foco ahí.
    afterRenderEffect(() => {
      if (this.redeemSuccess() || this.redeemError()) {
        this.feedback()?.nativeElement.focus();
      }
    });
  }

  protected readonly activeRedemptionsBadge = computed(() => {
    const count = this.store.activeRedemptions().length;
    if (count === 0) {
      return null;
    }
    return count === 1 ? '1 activo' : `${count} activos`;
  });

  protected onQuickAction(action: QuickActionId): void {
    this.router.navigate([QUICK_ACTION_PATHS[action]]);
  }
  protected onShowQr(redemptionId: string): void {
    this.router.navigate(['/profile/redemptions', redemptionId]);
  }
  protected onSeeCafes(): void {
    this.router.navigate(['/home']);
  }
  protected onSeeBenefits(): void {
    this.router.navigate(['/rewards']);
  }

  protected phaseOf(benefitId: string): FeaturedBenefitPhase {
    const target = this.redeemTarget();
    return target?.id === benefitId ? target.phase : 'idle';
  }

  protected onRedeem(benefitId: string): void {
    const dashboard = this.store.dashboard();
    const benefit = dashboard?.featuredBenefits.find(({ id }) => id === benefitId);
    if (
      this.redeemTarget()?.phase === 'redeeming' ||
      !dashboard ||
      !benefit ||
      benefit.pointsCost > dashboard.loyalty.availablePoints
    ) {
      return;
    }
    this.onDismissFeedback();
    this.redeemTarget.set({ id: benefitId, phase: 'confirming' });
  }

  protected onRedeemCancelled(): void {
    if (this.redeemTarget()?.phase === 'confirming') {
      this.redeemTarget.set(null);
    }
  }

  protected onRedeemConfirmed(): void {
    const target = this.redeemTarget();
    if (target?.phase !== 'confirming') {
      return;
    }
    this.redeemTarget.set({ id: target.id, phase: 'redeeming' });
    this.repository.redeemBenefit(target.id).subscribe({
      next: (redeemed) => {
        this.redeemTarget.set(null);
        this.redeemSuccess.set(`¡Canjeaste ${redeemed.benefitName}! Tu cupón ya está en Mis cupones.`);
        // Los puntos y los canjes activos que muestra el panel cambiaron con el canje.
        this.store.reload();
      },
      error: (error: unknown) => {
        this.redeemTarget.set(null);
        this.redeemError.set(toRedeemErrorMessage(error));
      },
    });
  }

  protected onDismissFeedback(): void {
    this.redeemSuccess.set(null);
    this.redeemError.set(null);
    this.store.dismissSuccess();
  }
}
