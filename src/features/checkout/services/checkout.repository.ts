import { Observable } from 'rxjs';
import { ConfirmedOrder, CreatePurchaseInput } from '../types/checkout.model';

export abstract class CheckoutRepository {
  abstract findCartId(cafeId: string): Observable<string>;
  abstract createPurchase(input: CreatePurchaseInput): Observable<ConfirmedOrder>;
}
