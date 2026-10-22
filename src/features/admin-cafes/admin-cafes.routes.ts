import { Routes } from '@angular/router';
import { environment } from '../../environments/environment';
import { AdminCafesPage } from './pages/admin-cafes-page/admin-cafes-page';
import { AdminCafeRepository } from './services/admin-cafe.repository';
import { AdminCafeStore } from './services/admin-cafe.store';
import { HttpAdminCafeRepository } from './services/http-admin-cafe.repository';
import { MockAdminCafeRepository } from './services/mock-admin-cafe.repository';

export default [
  {
    path: '',
    component: AdminCafesPage,
    providers: [
      {
        provide: AdminCafeRepository,
        useClass: environment.useMockApi ? MockAdminCafeRepository : HttpAdminCafeRepository,
      },
      AdminCafeStore,
    ],
  },
] satisfies Routes;
