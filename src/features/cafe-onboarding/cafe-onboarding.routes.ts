import { Routes } from '@angular/router';
import { CafeProfileRepository } from '../cafe-profile/services/cafe-profile.repository';
import { HttpCafeProfileRepository } from '../cafe-profile/services/http-cafe-profile.repository';
import { OnboardingPage } from './pages/onboarding-page/onboarding-page';

export default [
  {
    path: '',
    component: OnboardingPage,
    providers: [{ provide: CafeProfileRepository, useExisting: HttpCafeProfileRepository }],
  },
] satisfies Routes;
