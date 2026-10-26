import { Routes } from '@angular/router';
import { environment } from '../../environments/environment';
import { AdminGlobalBenefitsPage } from './pages/admin-global-benefits-page/admin-global-benefits-page';
import { GlobalBenefitRepository } from './services/global-benefit.repository';
import { GlobalBenefitStore } from './services/global-benefit.store';
import { HttpGlobalBenefitRepository } from './services/http-global-benefit.repository';
import { MockGlobalBenefitRepository } from './services/mock-global-benefit.repository';

export default [
  {
    path: '',
    component: AdminGlobalBenefitsPage,
    providers: [
      {
        provide: GlobalBenefitRepository,
        useClass: environment.useMockApi
          ? MockGlobalBenefitRepository
          : HttpGlobalBenefitRepository,
      },
      GlobalBenefitStore,
    ],
  },
] satisfies Routes;
