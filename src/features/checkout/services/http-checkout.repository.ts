import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartResponse } from '../../cart/model/cart.model';
import { PurchaseResponseDto } from '../types/checkout.dto';
import { ConfirmedOrder, CreatePurchaseInput } from '../types/checkout.model';
import { toConfirmedOrder, toCreatePurchaseRequestDto } from '../utils/checkout.mapper';
import { CheckoutRepository } from './checkout.repository';

function cartNotFound(): HttpErrorResponse {
  return new HttpErrorResponse({ status: HttpStatusCode.NotFound, error: 'Cart not found' });
}

function pickCartId(carts: readonly CartResponse[], cafeId: string): string {
  const cart = carts.find((candidate) => candidate.cafeid === cafeId);
  if (!cart) {
    throw cartNotFound();
  }
  return cart.externalId;
}

@Injectable()
export class HttpCheckoutRepository implements CheckoutRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  findCartId(cafeId: string): Observable<string> {
    return this.http
      .get<CartResponse[]>(`${this.baseUrl}/carts/myCart`)
      .pipe(map((carts) => pickCartId(carts, cafeId)));
  }

  createPurchase(input: CreatePurchaseInput): Observable<ConfirmedOrder> {
    const payload = toCreatePurchaseRequestDto(input);
    return this.http
      .post<PurchaseResponseDto>(`${this.baseUrl}/purchases`, payload)
      .pipe(map(toConfirmedOrder));
  }
}
