import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Product } from '../model/product.model';
import { ProductDto } from '../types/product.dto';
import { toProducts } from '../utils/product.mapper';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/products`;

  getProductsByCafe(cafeExternalId: string): Observable<Product[]> {
    return this.http.get<ProductDto[]>(`${this.url}/cafes/${cafeExternalId}`).pipe(map(toProducts));
  }
}
