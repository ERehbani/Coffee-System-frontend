import { Routes } from '@angular/router';
import { AdminClientsPage } from './pages/admin-clients-page/admin-clients-page';
import { AdminClientRepository } from './services/admin-client.repository';
import { AdminClientStore } from './services/admin-client.store';
import { HttpAdminClientRepository } from './services/http-admin-client.repository';

export default [
  {
    path: '',
    component: AdminClientsPage,
    providers: [
      { provide: AdminClientRepository, useClass: HttpAdminClientRepository },
      AdminClientStore,
    ],
  },
] satisfies Routes;
