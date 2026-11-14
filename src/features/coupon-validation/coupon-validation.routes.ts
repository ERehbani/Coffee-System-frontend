import { Routes } from '@angular/router';
import { CouponValidationPage } from './pages/coupon-validation-page/coupon-validation-page';
import { CouponValidationRepository } from './services/coupon-validation.repository';
import { HttpCouponValidationRepository } from './services/http-coupon-validation.repository';

export default [
  {
    path: '',
    component: CouponValidationPage,
    providers: [{ provide: CouponValidationRepository, useClass: HttpCouponValidationRepository }],
  },
] satisfies Routes;
