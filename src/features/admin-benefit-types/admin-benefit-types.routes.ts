import { Routes } from '@angular/router';
import { environment } from '../../environments/environment';
import { AdminBenefitTypesPage } from './pages/admin-benefit-types-page/admin-benefit-types-page';
import { BenefitFormatRepository } from './services/benefit-format.repository';
import { AdminBenefitFormatStore } from './services/benefit-format.store';
import { HttpBenefitFormatRepository } from './services/http-benefit-format.repository';
import { MockBenefitFormatRepository } from './services/mock-benefit-format.repository';

export default [
  {
    path: '',
    component: AdminBenefitTypesPage,
    providers: [
      {
        provide: BenefitFormatRepository,
        useClass: environment.useMockApi
          ? MockBenefitFormatRepository
          : HttpBenefitFormatRepository,
      },
      AdminBenefitFormatStore,
    ],
  },
] satisfies Routes;
