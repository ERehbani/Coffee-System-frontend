import { Routes } from '@angular/router';
import { environment } from '../../environments/environment';
import { AdminUsersPage } from './pages/admin-users-page/admin-users-page';
import { AdminUserRepository } from './services/admin-user.repository';
import { AdminUserStore } from './services/admin-user.store';
import { HttpAdminUserRepository } from './services/http-admin-user.repository';
import { MockAdminUserRepository } from './services/mock-admin-user.repository';

export default [
  {
    path: '',
    component: AdminUsersPage,
    providers: [
      {
        provide: AdminUserRepository,
        useClass: environment.useMockApi ? MockAdminUserRepository : HttpAdminUserRepository,
      },
      AdminUserStore,
    ],
  },
] satisfies Routes;
