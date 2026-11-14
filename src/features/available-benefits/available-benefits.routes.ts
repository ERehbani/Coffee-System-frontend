import { Routes } from '@angular/router';
import { HttpProfileRepository } from '../profile/services/http-profile.repository';
import { ProfileRepository } from '../profile/services/profile.repository';
import { AvailableBenefits } from './components/available-benefits/available-benefits';

export default [
  {
    path: '',
    component: AvailableBenefits,
    providers: [{ provide: ProfileRepository, useClass: HttpProfileRepository }],
  },
] satisfies Routes;
