import { Routes } from '@angular/router';
import { environment } from '../../environments/environment';
import { CafeProfilePage } from './pages/cafe-profile-page/cafe-profile-page';
import { CafeProfileRepository } from './services/cafe-profile.repository';
import { CafeProfileStore } from './services/cafe-profile.store';
import { HttpCafeProfileRepository } from './services/http-cafe-profile.repository';
import { MockCafeProfileRepository } from './services/mock-cafe-profile.repository';

export default [
  {
    path: '',
    component: CafeProfilePage,
    providers: [
      {
        provide: CafeProfileRepository,
        useClass: environment.useMockApi ? MockCafeProfileRepository : HttpCafeProfileRepository,
      },
      CafeProfileStore,
    ],
  },
] satisfies Routes;
