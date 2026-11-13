import { Observable } from 'rxjs';
import { ConfirmedOrder, CreatePurchaseInput } from '../types/checkout.model';
import { CheckoutCoupon } from '../types/coupon.model';

export abstract class CheckoutRepository {
  abstract findCartId(cafeId: string): Observable<string>;
  abstract findCoupons(): Observable<readonly CheckoutCoupon[]>;
  abstract createPurchase(input: CreatePurchaseInput): Observable<ConfirmedOrder>;
}
