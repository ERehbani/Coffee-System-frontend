import { Observable } from 'rxjs';
import { ConfirmedOrder, CreatePurchaseInput, ServerCart } from '../types/checkout.model';
import { CheckoutCoupon } from '../types/coupon.model';

export abstract class CheckoutRepository {
  abstract findCart(cafeId: string): Observable<ServerCart>;
  abstract findCoupons(): Observable<readonly CheckoutCoupon[]>;
  abstract createPurchase(input: CreatePurchaseInput): Observable<ConfirmedOrder>;
}
