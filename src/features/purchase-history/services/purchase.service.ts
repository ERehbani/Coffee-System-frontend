import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Purchase, Review, ReviewRequest } from '../model/purchase.model';

@Injectable({
  providedIn: 'root',
})
export class PurchaseService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/purchases`;
  private readonly reviewsUrl = `${environment.apiBaseUrl}/reviews`;

  getMyPurchases(): Observable<Purchase[]> {
    return this.http.get<Purchase[]>(this.url);
  }

  getAll(): Observable<Purchase[]> {
    return this.http.get<Purchase[]>(this.url);
  }

  createReview(request: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.reviewsUrl, request);
  }
}
