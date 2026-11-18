import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ALL_ITEMS, Page } from '../../../shared/types/page';
import { Product } from '../model/product.model';
import {
  CategoryOption,
  CreateProductRequest,
  PointsRange,
  PointsRangeQuery,
  ProductDto,
  UpdateProductRequest,
} from '../types/product.dto';
import { toProducts } from '../utils/product.mapper';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly cafesUrl = `${environment.apiBaseUrl}/cafes`;
  private readonly categoryUrl = `${environment.apiBaseUrl}/category`;

  getMyCafeId(): Observable<string> {
    return this.http.get<{ externalId: string }>(`${this.cafesUrl}/me`).pipe(map((cafe) => cafe.externalId));
  }

  getProductsByCafe(cafeId: string): Observable<Product[]> {
    return this.listByCafe(cafeId).pipe(map(toProducts));
  }

  listByCafe(cafeId: string): Observable<ProductDto[]> {
    return this.http
      .get<Page<ProductDto>>(this.productsUrl(cafeId), { params: ALL_ITEMS })
      .pipe(map((page) => [...page.content]));
  }

  create(cafeId: string, request: CreateProductRequest): Observable<ProductDto> {
    return this.http.post<ProductDto>(this.productsUrl(cafeId), request);
  }

  getPointsRange(cafeId: string, query: PointsRangeQuery): Observable<PointsRange> {
    let params = new HttpParams().set('price', query.price);
    if (query.catalogProductId) {
      params = params.set('catalogProductId', query.catalogProductId);
    } else if (query.name) {
      params = params.set('name', query.name);
    }
    return this.http.get<PointsRange>(`${this.productsUrl(cafeId)}/points-range`, { params });
  }

  update(cafeId: string, productId: string, request: UpdateProductRequest): Observable<ProductDto> {
    return this.http.put<ProductDto>(`${this.productsUrl(cafeId)}/${productId}`, request);
  }

  activate(cafeId: string, productId: string): Observable<ProductDto> {
    return this.http.patch<ProductDto>(`${this.productsUrl(cafeId)}/${productId}/activate`, {});
  }

  changeAvailability(cafeId: string, productId: string, available: boolean): Observable<ProductDto> {
    return this.http.patch<ProductDto>(`${this.productsUrl(cafeId)}/${productId}/availability`, { available });
  }

  delete(cafeId: string, productId: string): Observable<void> {
    return this.http.delete<void>(`${this.productsUrl(cafeId)}/${productId}`);
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

  private productsUrl(cafeId: string): string {
    return `${this.cafesUrl}/${cafeId}/products`;
  }
}
