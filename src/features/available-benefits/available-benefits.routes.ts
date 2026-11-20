import { Routes } from '@angular/router';
import { HttpProfileRepository } from '../profile/services/http-profile.repository';
import { ProfileRepository } from '../profile/services/profile.repository';
import { AvailableBenefits } from './components/available-benefits/available-benefits';
import { BenefitDetail } from './components/benefit-detail/benefit-detail';

export default [
  {
    path: '',
    providers: [{ provide: ProfileRepository, useClass: HttpProfileRepository }],
    children: [
      { path: '', component: AvailableBenefits },
      { path: ':id', component: BenefitDetail },
    ],
  },
] satisfies Routes;
