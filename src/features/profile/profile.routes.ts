import { Routes } from '@angular/router';
import { environment } from '../../environments/environment';
import { ProfilePage } from './pages/profile-page/profile-page';
import { TierPage } from './pages/tier-page/tier-page';
import { HttpProfileRepository } from './services/http-profile.repository';
import { MockProfileRepository } from './services/mock-profile.repository';
import { ProfileStore } from './services/profile.store';
import { ProfileRepository } from './services/profile.repository';
import { TierStore } from './services/tier.store';

export default [
  {
    path: '',
    providers: [
      {
        provide: ProfileRepository,
        useClass: environment.useMockApi ? MockProfileRepository : HttpProfileRepository,
      },
    ],
    children: [
      { path: '', component: ProfilePage, providers: [ProfileStore] },
      { path: 'tier', component: TierPage, providers: [TierStore] },
    ],
  },
] satisfies Routes;
