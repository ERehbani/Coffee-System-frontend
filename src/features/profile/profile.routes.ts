import { Routes } from '@angular/router';
import { environment } from '../../environments/environment';
import { ProfileEditPage } from './pages/profile-edit-page/profile-edit-page';
import { ProfilePage } from './pages/profile-page/profile-page';
import { TierPage } from './pages/tier-page/tier-page';
import { HttpProfileRepository } from './services/http-profile.repository';
import { MockProfileRepository } from './services/mock-profile.repository';
import { ProfileRepository } from './services/profile.repository';
import { ProfileStore } from './services/profile.store';
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
    ],
  },
] satisfies Routes;
