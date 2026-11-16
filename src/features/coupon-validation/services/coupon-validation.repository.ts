import { Observable } from 'rxjs';
import { ValidatedCoupon } from '../types/coupon-validation.model';

export abstract class CouponValidationRepository {
  abstract validate(code: string): Observable<ValidatedCoupon>;
}
