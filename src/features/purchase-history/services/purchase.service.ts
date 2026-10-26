import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MOCK_PURCHASES } from '../data/purchases.mock';
import { Purchase, Review, ReviewRequest } from '../model/purchase.model';

@Injectable({
  providedIn: 'root',
})
export class PurchaseService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/purchases`;
  private readonly reviewsUrl = `${environment.apiBaseUrl}/reviews`;

  getMyPurchases(): Observable<Purchase[]> {
    if (environment.useMockApi) {
      return of(MOCK_PURCHASES);
    }

    return this.http.get<Purchase[]>(`${this.url}/me`).pipe(
      catchError(() => of(MOCK_PURCHASES))
    );
  }

  getAll(): Observable<Purchase[]> {
    if (environment.useMockApi) {
      return of(MOCK_PURCHASES);
    }

    return this.http.get<Purchase[]>(this.url).pipe(
      catchError(() => of(MOCK_PURCHASES))
    );
  }

  createReview(request: ReviewRequest): Observable<Review> {
    if (environment.useMockApi) {
      return of({
        externalId: `review-${request.purchaseId}`,
        message: request.message,
        rating: request.rating,
        date: new Date().toISOString(),
        clientId: 'client-001',
        cafeId: request.cafeId,
        purchaseId: request.purchaseId,
      });
    }

    return this.http.post<Review>(this.reviewsUrl, request);
  }
}
