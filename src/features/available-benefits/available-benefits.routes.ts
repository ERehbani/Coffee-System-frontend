import { Routes } from '@angular/router';
import { environment } from '../../environments/environment';
import { HttpProfileRepository } from '../profile/services/http-profile.repository';
import { MockProfileRepository } from '../profile/services/mock-profile.repository';
import { ProfileRepository } from '../profile/services/profile.repository';
import { AvailableBenefits } from './components/available-benefits/available-benefits';

export default [
  {
    path: '',
    component: AvailableBenefits,
    providers: [
      {
        provide: ProfileRepository,
        useClass: environment.useMockApi ? MockProfileRepository : HttpProfileRepository,
      },
    ],
  },
] satisfies Routes;
