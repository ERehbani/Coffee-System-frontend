import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PurchaseDto, ReviewDto } from '../types/order.dto';
import { CreateReviewInput, Order, OrderReview } from '../types/order.model';
import { toOrderReview, toOrders, toReviewCreateRequestDto } from '../utils/order.mapper';
import { OrdersRepository } from './orders.repository';

@Service({ autoProvided: false })
export class HttpOrdersRepository implements OrdersRepository {
  private readonly http = inject(HttpClient);

  getOrders(): Observable<readonly Order[]> {
    return this.http
      .get<PurchaseDto[]>(`${environment.apiBaseUrl}/clients/me/purchases`)
      .pipe(map(toOrders));
  }

  createReview(order: Order, input: CreateReviewInput): Observable<OrderReview> {
    return this.http
      .post<ReviewDto>(`${environment.apiBaseUrl}/reviews`, toReviewCreateRequestDto(order, input))
      .pipe(map(toOrderReview));
  }
}
