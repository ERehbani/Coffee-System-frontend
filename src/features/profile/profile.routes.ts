import { Routes } from '@angular/router';
import { environment } from '../../environments/environment';
import { CouponsPage } from './pages/coupons-page/coupons-page';
import { ProfileEditPage } from './pages/profile-edit-page/profile-edit-page';
import { ProfilePage } from './pages/profile-page/profile-page';
import { RedemptionDetailPage } from './pages/redemption-detail-page/redemption-detail-page';
import { RedemptionHistoryPage } from './pages/redemption-history-page/redemption-history-page';
import { TierPage } from './pages/tier-page/tier-page';
import { HttpProfileRepository } from './services/http-profile.repository';
import { MockProfileRepository } from './services/mock-profile.repository';
import { ProfileRepository } from './services/profile.repository';
import { ProfileStore } from './services/profile.store';
import { RedemptionHistoryStore } from './services/redemption-history.store';
import { TierStore } from './services/tier.store';

export default [
  {
    path: '',
    providers: [
      {
        provide: ProfileRepository,
        useClass: environment.useMockApi ? MockProfileRepository : HttpProfileRepository,
      },
      ProfileStore,
    ],
    children: [
      { path: '', component: ProfilePage },
      { path: 'edit', component: ProfileEditPage },
      { path: 'tier', component: TierPage, providers: [TierStore] },
      {
        path: 'redemptions',
        component: RedemptionHistoryPage,
        providers: [RedemptionHistoryStore],
      },
      { path: 'coupons', component: CouponsPage },
      { path: 'redemptions/:id', component: RedemptionDetailPage },
    ],
  },
] satisfies Routes;
