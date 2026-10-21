import { Routes } from '@angular/router';
import { environment } from '../../environments/environment';
import { AdminClientDetailPage } from './pages/admin-client-detail-page/admin-client-detail-page';
import { AdminClientsPage } from './pages/admin-clients-page/admin-clients-page';
import { AdminClientStore } from './services/admin-client.store';
import { AdminUserRepository } from './services/admin-user.repository';
import { HttpAdminUserRepository } from './services/http-admin-user.repository';
import { MockAdminUserRepository } from './services/mock-admin-user.repository';

export default [
  {
    path: '',
    providers: [
      {
        provide: AdminUserRepository,
        useClass: environment.useMockApi ? MockAdminUserRepository : HttpAdminUserRepository,
      },
      AdminClientStore,
    ],
    children: [
      { path: '', component: AdminClientsPage },
      { path: ':id', component: AdminClientDetailPage },
    ],
  },
] satisfies Routes;
