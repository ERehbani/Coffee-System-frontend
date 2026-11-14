import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Product } from '../model/product.model';
import {
  CategoryOption,
  CreateProductRequest,
  ProductDto,
  UpdateProductRequest,
} from '../types/product.dto';
import { toProducts } from '../utils/product.mapper';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/products`;
  private readonly categoryUrl = `${environment.apiBaseUrl}/category`;

  getProductsByCafe(cafeExternalId: string): Observable<Product[]> {
    return this.http.get<ProductDto[]>(`${this.url}/cafes/${cafeExternalId}`).pipe(map(toProducts));
  }

  getAll(): Observable<ProductDto[]> {
    return this.http.get<ProductDto[]>(this.url);
  }

  create(request: CreateProductRequest): Observable<ProductDto> {
    return this.http.post<ProductDto>(this.url, request);
  }

  update(productId: string, request: UpdateProductRequest): Observable<ProductDto> {
    return this.http.put<ProductDto>(`${this.url}/${productId}`, request);
  }

  activate(productId: string): Observable<ProductDto> {
    return this.http.put<ProductDto>(`${this.url}/${productId}/activate`, {});
  }

  delete(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${productId}`);
  }

  getCategories(): Observable<CategoryOption[]> {
    return this.http
      .get<{ categoryId?: string; id?: string; name: string }[]>(this.categoryUrl)
      .pipe(
        map((items) =>
          items.map((i) => ({
            categoryId: i.categoryId || i.id || '',
            name: i.name,
          })),
        ),
      );
  }
}
