import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MOCK_PURCHASES } from '../data/purchases.mock';
import { Purchase } from '../model/purchase.model';

@Injectable({
  providedIn: 'root',
})
export class PurchaseService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/purchases`;

  getMyPurchases(): Observable<Purchase[]> {
    if (environment.useMockApi) {
      return of(MOCK_PURCHASES);
    }

    return this.http.get<Purchase[]>(this.url).pipe(
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
}
