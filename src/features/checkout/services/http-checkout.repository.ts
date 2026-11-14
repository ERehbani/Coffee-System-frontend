import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartResponse } from '../../cart/model/cart.model';
import { PurchaseResponseDto } from '../types/checkout.dto';
import { ConfirmedOrder, CreatePurchaseInput, ServerCart } from '../types/checkout.model';
import { CheckoutCouponDto } from '../types/coupon.dto';
import { CheckoutCoupon } from '../types/coupon.model';
import {
  toConfirmedOrder,
  toCreatePurchaseRequestDto,
  toServerCart,
} from '../utils/checkout.mapper';
import { toCheckoutCoupons } from '../utils/coupon.mapper';
import { CheckoutRepository } from './checkout.repository';

function cartNotFound(): HttpErrorResponse {
  return new HttpErrorResponse({ status: HttpStatusCode.NotFound, error: 'Cart not found' });
}

function pickCart(carts: readonly CartResponse[], cafeId: string): ServerCart {
  const cart = carts.find((candidate) => candidate.cafeid === cafeId);
  if (!cart) {
    throw cartNotFound();
  }
  return toServerCart(cart);
}

@Injectable()
export class HttpCheckoutRepository implements CheckoutRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  findCart(cafeId: string): Observable<ServerCart> {
    return this.http
      .get<CartResponse[]>(`${this.baseUrl}/carts/myCart`)
      .pipe(map((carts) => pickCart(carts, cafeId)));
  }

  findCoupons(): Observable<readonly CheckoutCoupon[]> {
    return this.http
      .get<CheckoutCouponDto[]>(`${this.baseUrl}/redemption`, { params: { state: true } })
      .pipe(map(toCheckoutCoupons));
  }

  createPurchase(input: CreatePurchaseInput): Observable<ConfirmedOrder> {
    const payload = toCreatePurchaseRequestDto(input);
    return this.http
      .post<PurchaseResponseDto>(`${this.baseUrl}/purchases`, payload)
      .pipe(map(toConfirmedOrder));
  }
}
