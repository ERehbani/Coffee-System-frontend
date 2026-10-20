import { Routes } from '@angular/router';
import { environment } from '../../environments/environment';
import { ProfileEditPage } from './pages/profile-edit-page/profile-edit-page';
import { ProfilePage } from './pages/profile-page/profile-page';
import { HttpProfileRepository } from './services/http-profile.repository';
import { MockProfileRepository } from './services/mock-profile.repository';
import { ProfileRepository } from './services/profile.repository';
import { ProfileStore } from './services/profile.store';

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
      {
        path: '',
        component: ProfilePage,
      },
      {
        path: 'edit',
        component: ProfileEditPage,
      },
    ],
  },
] satisfies Routes;

