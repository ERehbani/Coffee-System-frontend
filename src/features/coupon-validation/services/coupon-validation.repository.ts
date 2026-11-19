import { Observable } from 'rxjs';
import { CancelledCoupon, ValidatedCoupon } from '../types/coupon-validation.model';

export abstract class CouponValidationRepository {
  abstract validate(code: string): Observable<ValidatedCoupon>;
  abstract cancel(code: string): Observable<CancelledCoupon>;
}
