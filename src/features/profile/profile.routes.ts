import { Routes } from '@angular/router';
import { environment } from '../../environments/environment';
import { ProfilePage } from './pages/profile-page/profile-page';
import { HttpProfileRepository } from './services/http-profile.repository';
import { MockProfileRepository } from './services/mock-profile.repository';
import { ProfileStore } from './services/profile.store';
import { ProfileRepository } from './services/profile.repository';

export default [
  {
    path: '',
    component: ProfilePage,
    providers: [
      {
        provide: ProfileRepository,
        useClass: environment.useMockApi ? MockProfileRepository : HttpProfileRepository,
      },
      ProfileStore,
    ],
  },
] satisfies Routes;
