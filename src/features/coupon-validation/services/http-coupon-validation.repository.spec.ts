import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { RedemptionResponseDto } from '../types/coupon-validation.dto';
import { ValidatedCoupon } from '../types/coupon-validation.model';
import { HttpCouponValidationRepository } from './http-coupon-validation.repository';

const response: RedemptionResponseDto = {
  externalId: 'redemption-1',
  date: '2026-11-10T10:30:00',
  usedPoints: 300,
  state: false,
  validationCode: '3f2b8c1e-9d4a-4c7b-8e21-5a6f0d9b7c34',
  benefitName: '15% off',
  cafeName: 'Café Central',
  description: null,
  expiresAt: null,
  conditions: null,
  usedDate: '2026-11-13T11:42:07',
  cafeId: 'cafe-central-001',
  benefitType: 'CODIGO_DESCUENTO',
  discountPercentage: 15,
  productId: null,
  productName: null,
  productPrice: null,
};

describe('HttpCouponValidationRepository', () => {
  const url = `${environment.apiBaseUrl}/redemption/validate`;
  let repository: HttpCouponValidationRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpCouponValidationRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repository = TestBed.inject(HttpCouponValidationRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts the code to /redemption/validate/{code} and maps the coupon', () => {
    let coupon: ValidatedCoupon | undefined;
    repository.validate(response.validationCode).subscribe((value) => (coupon = value));

    const request = http.expectOne(`${url}/${response.validationCode}`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeNull();
    request.flush(response);

    expect(coupon).toMatchObject({
      id: 'redemption-1',
      code: response.validationCode,
      benefitType: 'CODIGO_DESCUENTO',
      discountPercentage: 15,
    });
  });

  it('encodes the code so a strange QR cannot change the URL', () => {
    repository.validate('a b/c?d').subscribe();

    http.expectOne(`${url}/a%20b%2Fc%3Fd`).flush(response);
  });

  it('lets the HTTP error reach the caller untouched', () => {
    let failure: unknown;
    repository.validate('missing').subscribe({ error: (error) => (failure = error) });

    http
      .expectOne(`${url}/missing`)
      .flush('Redemption not found', { status: 404, statusText: 'Not Found' });

    expect(failure).toBeInstanceOf(HttpErrorResponse);
    expect((failure as HttpErrorResponse).status).toBe(404);
    expect((failure as HttpErrorResponse).error).toBe('Redemption not found');
  });
});
