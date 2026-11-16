import { Routes } from '@angular/router';
import { AdminBenefitTypesPage } from './pages/admin-benefit-types-page/admin-benefit-types-page';
import { BenefitFormatRepository } from './services/benefit-format.repository';
import { AdminBenefitFormatStore } from './services/benefit-format.store';
import { HttpBenefitFormatRepository } from './services/http-benefit-format.repository';

export default [
  {
    path: '',
    component: AdminBenefitTypesPage,
    providers: [
      {
        provide: BenefitFormatRepository,
        useClass: HttpBenefitFormatRepository,
      },
      AdminBenefitFormatStore,
    ],
  },
] satisfies Routes;
