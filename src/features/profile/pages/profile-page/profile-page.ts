import { Component, computed, inject } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { ActiveRedemptionCard } from '../../components/active-redemption-card/active-redemption-card';
import { DashboardHeader } from '../../components/dashboard-header/dashboard-header';
import { FeaturedBenefitCard } from '../../components/featured-benefit-card/featured-benefit-card';
import { LoyaltyCard } from '../../components/loyalty-card/loyalty-card';
import { NearbyCafeCard } from '../../components/nearby-cafe-card/nearby-cafe-card';
import { QuickActionId, QuickActions } from '../../components/quick-actions/quick-actions';
import { SectionHeader } from '../../components/section-header/section-header';
import { ProfileStore } from '../../services/profile.store';

@Component({
  imports: [
    Icon,
    DashboardHeader,
    LoyaltyCard,
    QuickActions,
    SectionHeader,
    ActiveRedemptionCard,
    NearbyCafeCard,
    FeaturedBenefitCard,
  ],
  selector: 'app-profile-page',
  templateUrl: './profile-page.html',
  host: { class: 'block' },
})
export class ProfilePage {
  protected readonly store = inject(ProfileStore);

  protected readonly activeRedemptionsBadge = computed(() => {
    const count = this.store.activeRedemptions().length;
    if (count === 0) {
      return null;
    }
    return count === 1 ? '1 activo' : `${count} activos`;
  });

  // The flows behind these actions (QR scanner, card, map, catalog, redemption) are not built yet.
  protected onScanQr(): void {}
  protected onViewCard(): void {}
  protected onQuickAction(_action: QuickActionId): void {}
  protected onShowQr(_redemptionId: string): void {}
  protected onSeeMap(): void {}
  protected onSeeCatalog(): void {}
  protected onRedeem(_benefitId: string): void {}
}
