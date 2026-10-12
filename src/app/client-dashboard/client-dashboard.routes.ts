import { Routes } from '@angular/router';
import { environment } from '../../environments/environment';
import { ClientDashboardStore } from './application/client-dashboard.store';
import { ClientDashboardRepository } from './domain/client-dashboard.repository';
import { HttpClientDashboardRepository } from './infrastructure/http-client-dashboard.repository';
import { MockClientDashboardRepository } from './infrastructure/mock-client-dashboard.repository';
import { ClientDashboardPage } from './ui/client-dashboard-page/client-dashboard-page';

export default [
  {
    path: '',
    component: ClientDashboardPage,
    providers: [
      // Mock data until the backend is ready; login, auth guard and token interceptor come later.
      {
        provide: ClientDashboardRepository,
        useClass: environment.useMockApi
          ? MockClientDashboardRepository
          : HttpClientDashboardRepository,
      },
      ClientDashboardStore,
    ],
  },
] satisfies Routes;
