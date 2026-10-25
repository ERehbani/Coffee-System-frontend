import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MOCK_ORDERS } from '../data/orders.mock';
import { Purchase, Review, ReviewRequest } from '../model/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private readonly purchasesUrl = `${environment.apiBaseUrl}/purchases`;
  private readonly reviewsUrl = `${environment.apiBaseUrl}/reviews`;

  getMyOrders(): Observable<Purchase[]> {
    if (environment.useMockApi) {
      return of(MOCK_ORDERS);
    }

    return this.http.get<Purchase[]>(`${this.purchasesUrl}/me`);
  }

  createReview(request: ReviewRequest): Observable<Review> {
    if (environment.useMockApi) {
      return of({
        externalId: `review-${request.purchaseId}`,
        message: request.message,
        rating: request.rating,
        date: new Date().toISOString(),
        clientId: 'client-1',
        cafeId: request.cafeId,
        purchaseId: request.purchaseId,
      });
    }

    return this.http.post<Review>(this.reviewsUrl, request);
  }
}
