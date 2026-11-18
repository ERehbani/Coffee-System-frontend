import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { LogoutButton } from '../../../auth/components/logout-button/logout-button';
import { ActiveRedemptionCard } from '../../components/active-redemption-card/active-redemption-card';
import { DashboardHeader } from '../../components/dashboard-header/dashboard-header';
import { FeaturedBenefitCard } from '../../components/featured-benefit-card/featured-benefit-card';
import { LoyaltyCard } from '../../components/loyalty-card/loyalty-card';
import { NearbyCafeCard } from '../../components/nearby-cafe-card/nearby-cafe-card';
import { QuickActionId, QuickActions } from '../../components/quick-actions/quick-actions';
import { SectionHeader } from '../../components/section-header/section-header';
import { ProfileStore } from '../../services/profile.store';

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
  private readonly router = inject(Router);

  constructor() {
    this.store.reload();
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
  protected onRedeem(_benefitId: string): void {
    this.router.navigate(['/rewards']);
  }
}
