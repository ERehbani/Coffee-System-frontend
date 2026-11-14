import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Product } from '../model/product.model';
import { ESPRESSO_DTO_FIXTURE, ESPRESSO_FIXTURE, PRODUCT_CAFE_ID } from '../utils/product.fixture';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let http: HttpTestingController;
  const url = `${environment.apiBaseUrl}/products/cafes/${PRODUCT_CAFE_ID}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('asks the backend for the products of the cafe and maps them', () => {
    let products: Product[] | undefined;
    service.getProductsByCafe(PRODUCT_CAFE_ID).subscribe((value) => (products = value));

    const request = http.expectOne(url);
    expect(request.request.method).toBe('GET');
    request.flush([ESPRESSO_DTO_FIXTURE]);

    expect(products).toEqual([ESPRESSO_FIXTURE]);
  });

  it('propagates a backend failure instead of inventing products', () => {
    let products: Product[] | undefined;
    let status: number | undefined;
    service.getProductsByCafe(PRODUCT_CAFE_ID).subscribe({
      next: (value) => (products = value),
      error: (error) => (status = error.status),
    });

    http.expectOne(url).flush('error', { status: 500, statusText: 'Server Error' });

    expect(products).toBeUndefined();
    expect(status).toBe(500);
  });
});
