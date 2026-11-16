import { Routes } from '@angular/router';
import { AdminGlobalBenefitsPage } from './pages/admin-global-benefits-page/admin-global-benefits-page';
import { GlobalBenefitRepository } from './services/global-benefit.repository';
import { GlobalBenefitStore } from './services/global-benefit.store';
import { HttpGlobalBenefitRepository } from './services/http-global-benefit.repository';

export default [
  {
    path: '',
    component: AdminGlobalBenefitsPage,
    providers: [
      {
        provide: GlobalBenefitRepository,
        useClass: HttpGlobalBenefitRepository,
      },
      GlobalBenefitStore,
    ],
  },
] satisfies Routes;
