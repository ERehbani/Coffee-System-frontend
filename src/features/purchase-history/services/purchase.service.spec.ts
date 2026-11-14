import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Purchase, Review, ReviewRequest } from '../model/purchase.model';
import { PURCHASES_FIXTURE, REVIEW_FIXTURE } from '../utils/purchase.fixture';
import { PurchaseService } from './purchase.service';

describe('PurchaseService', () => {
  let service: PurchaseService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PurchaseService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('asks the backend for the purchases of the client', () => {
    let purchases: Purchase[] | undefined;
    service.getMyPurchases().subscribe((value) => (purchases = value));

    const request = http.expectOne(`${environment.apiBaseUrl}/purchases`);
    expect(request.request.method).toBe('GET');
    request.flush(PURCHASES_FIXTURE);

    expect(purchases).toEqual(PURCHASES_FIXTURE);
  });

  it('propagates a failure when the purchases cannot be loaded', () => {
    let status: number | undefined;
    service.getMyPurchases().subscribe({ error: (error) => (status = error.status) });

    http
      .expectOne(`${environment.apiBaseUrl}/purchases`)
      .flush('error', { status: 500, statusText: 'Server Error' });

    expect(status).toBe(500);
  });

  it('posts the review and returns the one the backend created', () => {
    const request: ReviewRequest = {
      cafeId: REVIEW_FIXTURE.cafeId,
      purchaseId: REVIEW_FIXTURE.purchaseId,
      rating: 5,
      message: 'Excelente atención',
    };
    let review: Review | undefined;
    service.createReview(request).subscribe((value) => (review = value));

    const sent = http.expectOne(`${environment.apiBaseUrl}/reviews`);
    expect(sent.request.method).toBe('POST');
    expect(sent.request.body).toEqual(request);
    sent.flush(REVIEW_FIXTURE, { status: 201, statusText: 'Created' });

    expect(review).toEqual(REVIEW_FIXTURE);
  });
});
