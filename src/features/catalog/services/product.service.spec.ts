import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { pageOf } from '../../../shared/types/page.fixture';
import { Product } from '../model/product.model';
import { ESPRESSO_DTO_FIXTURE, ESPRESSO_FIXTURE, PRODUCT_CAFE_ID } from '../utils/product.fixture';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let http: HttpTestingController;
  const productsUrl = `${environment.apiBaseUrl}/cafes/${PRODUCT_CAFE_ID}/products`;
  const productUrl = `${productsUrl}/${ESPRESSO_DTO_FIXTURE.externalId}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('asks the backend for the products of the cafe and maps the page content', () => {
    let products: Product[] | undefined;
    service.getProductsByCafe(PRODUCT_CAFE_ID).subscribe((value) => (products = value));

    const request = http.expectOne((req) => req.url === productsUrl);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('size')).toBe('100');
    request.flush(pageOf([ESPRESSO_DTO_FIXTURE]));

    expect(products).toEqual([ESPRESSO_FIXTURE]);
  });

  it('propagates a backend failure instead of inventing products', () => {
    let products: Product[] | undefined;
    let status: number | undefined;
    service.getProductsByCafe(PRODUCT_CAFE_ID).subscribe({
      next: (value) => (products = value),
      error: (error) => (status = error.status),
    });

    http.expectOne((req) => req.url === productsUrl).flush('error', { status: 500, statusText: 'Server Error' });

    expect(products).toBeUndefined();
    expect(status).toBe(500);
  });

  it('reads the id of the cafe of the logged user', () => {
    let cafeId: string | undefined;
    service.getMyCafeId().subscribe((value) => (cafeId = value));

    http.expectOne(`${environment.apiBaseUrl}/cafes/me`).flush({ externalId: PRODUCT_CAFE_ID, name: 'Central' });

    expect(cafeId).toBe(PRODUCT_CAFE_ID);
  });

  it('creates the product inside the cafe', () => {
    const request = { name: 'Espresso', price: 1500, awardedPoints: 50, categoryId: 'category-cafeteria' };
    service.create(PRODUCT_CAFE_ID, request).subscribe();

    const req = http.expectOne(productsUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(ESPRESSO_DTO_FIXTURE);
  });

  it('asks for the points range of a catalog product at a price', () => {
    service.getPointsRange(PRODUCT_CAFE_ID, { price: 2500, catalogProductId: 'catalog-1', name: 'Ignored' }).subscribe();

    const request = http.expectOne((req) => req.url === `${productsUrl}/points-range`);
    expect(request.request.params.get('price')).toBe('2500');
    expect(request.request.params.get('catalogProductId')).toBe('catalog-1');
    expect(request.request.params.has('name')).toBe(false);
    request.flush({ suggested: 100, min: 80, max: 120, referencePrice: 2500, cafesSelling: 1 });
  });

  it('asks for the points range of a new product by its name', () => {
    service.getPointsRange(PRODUCT_CAFE_ID, { price: 900, name: 'Medialuna' }).subscribe();

    const request = http.expectOne((req) => req.url === `${productsUrl}/points-range`);
    expect(request.request.params.get('name')).toBe('Medialuna');
    expect(request.request.params.has('catalogProductId')).toBe(false);
    request.flush({ suggested: 36, min: 29, max: 43, referencePrice: 900, cafesSelling: 1 });
  });

  it('updates the product of the cafe', () => {
    service.update(PRODUCT_CAFE_ID, ESPRESSO_DTO_FIXTURE.externalId, { price: 1800 }).subscribe();

    const req = http.expectOne(productUrl);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ price: 1800 });
    req.flush(ESPRESSO_DTO_FIXTURE);
  });

  it('sells a deactivated product again', () => {
    service.activate(PRODUCT_CAFE_ID, ESPRESSO_DTO_FIXTURE.externalId).subscribe();

    const req = http.expectOne(`${productUrl}/activate`);
    expect(req.request.method).toBe('PATCH');
    req.flush(ESPRESSO_DTO_FIXTURE);
  });

  it('marks a product as sold out for today', () => {
    service.changeAvailability(PRODUCT_CAFE_ID, ESPRESSO_DTO_FIXTURE.externalId, false).subscribe();

    const req = http.expectOne(`${productUrl}/availability`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ available: false });
    req.flush({ ...ESPRESSO_DTO_FIXTURE, available: false });
  });

  it('stops selling a product', () => {
    service.delete(PRODUCT_CAFE_ID, ESPRESSO_DTO_FIXTURE.externalId).subscribe();

    const req = http.expectOne(productUrl);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
