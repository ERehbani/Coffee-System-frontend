import { Component, computed, inject } from '@angular/core';
import { Icon } from '../../../shared/ui/icon/icon';
import { ClientDashboardStore } from '../../application/client-dashboard.store';
import { ActiveRedemptionCard } from '../active-redemption-card/active-redemption-card';
import { DashboardHeader } from '../dashboard-header/dashboard-header';
import { FeaturedBenefitCard } from '../featured-benefit-card/featured-benefit-card';
import { LoyaltyCard } from '../loyalty-card/loyalty-card';
import { NearbyCafeCard } from '../nearby-cafe-card/nearby-cafe-card';
import { QuickActionId, QuickActions } from '../quick-actions/quick-actions';
import { SectionHeader } from '../section-header/section-header';

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
  selector: 'app-client-dashboard-page',
  templateUrl: './client-dashboard-page.html',
  host: { class: 'block' },
})
export class ClientDashboardPage {
  protected readonly store = inject(ClientDashboardStore);

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
