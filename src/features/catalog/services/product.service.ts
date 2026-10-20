import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MOCK_PRODUCTS } from '../data/products.mock';
import { Product } from '../model/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly url = `${environment.apiBaseUrl}/products`;

  constructor(private http: HttpClient) {}

  getProductsByCafe(cafeExternalId: string): Observable<Product[]> {
    if (environment.useMockApi) {
      return of(
        MOCK_PRODUCTS.filter((p) => p.cafeExternalId === cafeExternalId && p.state)
      );
    }

    return this.http.get<Product[]>(`${this.url}/cafes/${cafeExternalId}`).pipe(
      catchError(() =>
        of(MOCK_PRODUCTS.filter((p) => p.cafeExternalId === cafeExternalId && p.state))
      )
    );
  }
}
