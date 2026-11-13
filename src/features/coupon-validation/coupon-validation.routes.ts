import { Routes } from '@angular/router';
import { environment } from '../../environments/environment';
import { CouponValidationPage } from './pages/coupon-validation-page/coupon-validation-page';
import { CouponValidationRepository } from './services/coupon-validation.repository';
import { HttpCouponValidationRepository } from './services/http-coupon-validation.repository';
import { MockCouponValidationRepository } from './services/mock-coupon-validation.repository';

export default [
  {
    path: '',
    component: CouponValidationPage,
    providers: [
      {
        provide: CouponValidationRepository,
        useClass: environment.useMockApi
          ? MockCouponValidationRepository
          : HttpCouponValidationRepository,
      },
    ],
  },
] satisfies Routes;
