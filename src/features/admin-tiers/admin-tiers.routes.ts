import { Routes } from '@angular/router';
import { AdminTiersPage } from './pages/admin-tiers-page/admin-tiers-page';
import { HttpTierRepository } from './services/http-tier.repository';
import { TierRepository } from './services/tier.repository';
import { AdminTierStore } from './services/tier.store';

export default [
  {
    path: '',
    component: AdminTiersPage,
    providers: [{ provide: TierRepository, useClass: HttpTierRepository }, AdminTierStore],
  },
] satisfies Routes;
