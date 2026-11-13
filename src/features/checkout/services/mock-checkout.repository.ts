import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { defer, delay, map, Observable, of } from 'rxjs';
import { CartService } from '../../cart/services/cart.service';
import { MOCK_PURCHASES } from '../../purchase-history/data/purchases.mock';
import { Purchase } from '../../purchase-history/model/purchase.model';
import { PurchaseResponseDto } from '../types/checkout.dto';
import { ConfirmedOrder, CreatePurchaseInput } from '../types/checkout.model';
import { buildPurchaseResponse } from '../utils/checkout.fixture';
import { toConfirmedOrder } from '../utils/checkout.mapper';
import { CheckoutRepository } from './checkout.repository';

export const MOCK_LATENCY_MS = 400;

function emptyCart(): HttpErrorResponse {
  return new HttpErrorResponse({ status: HttpStatusCode.BadRequest, error: 'Cart cannot be empty' });
}

function toHistoryPurchase(purchase: PurchaseResponseDto): Purchase {
  return {
    ...purchase,
    clientName: purchase.clientName ?? undefined,
    details: [...purchase.details],
  };
}

@Injectable()
export class MockCheckoutRepository implements CheckoutRepository {
  private readonly cart = inject(CartService);
  private purchaseCount = 0;

  findCartId(cafeId: string): Observable<string> {
    return of(`mock-cart-${cafeId}`).pipe(delay(MOCK_LATENCY_MS));
  }

  createPurchase(_input: CreatePurchaseInput): Observable<ConfirmedOrder> {
    return defer(() => of(this.registerPurchase())).pipe(
      delay(MOCK_LATENCY_MS),
      map(toConfirmedOrder),
    );
  }

  private registerPurchase(): PurchaseResponseDto {
    const cafe = this.cart.cafe();
    const items = this.cart.items();
    if (!cafe || items.length === 0) {
      throw emptyCart();
    }

    this.purchaseCount += 1;
    const orderNumber = `purchase-mock-${String(this.purchaseCount).padStart(4, '0')}`;
    const purchase = buildPurchaseResponse(orderNumber, cafe, items, new Date());
    MOCK_PURCHASES.push(toHistoryPurchase(purchase));
    return purchase;
  }
}
