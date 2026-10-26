import { Component, computed, inject } from '@angular/core';
import { AdminPageHeader } from '../../../../shared/components/admin-page-header/admin-page-header';
import { Icon } from '../../../../shared/components/icon/icon';
import { TierFormDrawer } from '../../components/tier-form-drawer/tier-form-drawer';
import { TierTable } from '../../components/tier-table/tier-table';
import { AdminTierStore } from '../../services/tier.store';

@Component({
  imports: [AdminPageHeader, Icon, TierTable, TierFormDrawer],
  selector: 'app-admin-tiers-page',
  templateUrl: './admin-tiers-page.html',
  host: { class: 'block' },
})
export class AdminTiersPage {
  protected readonly store = inject(AdminTierStore);

  protected readonly editingBaseTier = computed(() => {
    const tier = this.store.editingTier();
    return tier !== null && this.store.isBaseTier(tier);
  });
}
