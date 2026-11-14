import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ALL_ITEMS, Page } from '../../../shared/types/page';
import { Purchase, Review, ReviewRequest } from '../model/purchase.model';

@Injectable({
  providedIn: 'root',
})
export class PurchaseService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/purchases`;
  private readonly reviewsUrl = `${environment.apiBaseUrl}/reviews`;

  getMyPurchases(): Observable<Purchase[]> {
    return this.listFrom(`${this.url}/me`);
  }

  getAll(): Observable<Purchase[]> {
    return this.listFrom(this.url);
  }

  createReview(request: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.reviewsUrl, request);
  }

  private listFrom(url: string): Observable<Purchase[]> {
    return this.http
      .get<Page<Purchase>>(url, { params: ALL_ITEMS })
      .pipe(map((page) => [...page.content]));
  }
}
