import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CartResponse } from '../../cart/model/cart.model';
import { ConfirmedOrder } from '../types/checkout.model';
import { CheckoutCoupon } from '../types/coupon.model';
import {
  buildPurchaseResponse,
  CHECKOUT_CAFE_FIXTURE,
  CHECKOUT_ITEMS_FIXTURE,
} from '../utils/checkout.fixture';
import { CHECKOUT_COUPON_DTOS_FIXTURE } from '../utils/coupon.fixture';
import { HttpCheckoutRepository } from './http-checkout.repository';

function cartFor(cafeId: string, externalId: string): CartResponse {
  return { externalId, clientid: 'client-001', cafeid: cafeId, totalPrice: 0, products: [] };
}

describe('HttpCheckoutRepository', () => {
  let repository: HttpCheckoutRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpCheckoutRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repository = TestBed.inject(HttpCheckoutRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('findCartId', () => {
    it('picks the cart of the cafe among all the carts of the client', () => {
      let cartId: string | undefined;
      repository.findCartId('cafe-b').subscribe((value) => (cartId = value));

      const request = http.expectOne(`${environment.apiBaseUrl}/carts/myCart`);
      expect(request.request.method).toBe('GET');
      request.flush([cartFor('cafe-a', 'cart-a'), cartFor('cafe-b', 'cart-b')]);

      expect(cartId).toBe('cart-b');
    });

    it('fails with a 404 when the client has no cart for that cafe', () => {
      let status: number | undefined;
      repository.findCartId('cafe-c').subscribe({ error: (error) => (status = error.status) });

      http.expectOne(`${environment.apiBaseUrl}/carts/myCart`).flush([cartFor('cafe-a', 'cart-a')]);

      expect(status).toBe(404);
    });
  });

  describe('findCoupons', () => {
    it('asks for the active redemptions of the client and maps them', () => {
      let coupons: readonly CheckoutCoupon[] | undefined;
      repository.findCoupons().subscribe((value) => (coupons = value));

      const request = http.expectOne(
        (candidate) => candidate.url === `${environment.apiBaseUrl}/redemption`,
      );
      expect(request.request.method).toBe('GET');
      expect(request.request.params.get('state')).toBe('true');
      request.flush(CHECKOUT_COUPON_DTOS_FIXTURE);

      expect(coupons?.length).toBe(CHECKOUT_COUPON_DTOS_FIXTURE.length);
      expect(coupons?.[0].benefit).toEqual({ kind: 'percentage-discount', percentage: 15 });
    });

    it('propagates a backend failure', () => {
      let status: number | undefined;
      repository.findCoupons().subscribe({ error: (error) => (status = error.status) });

      http
        .expectOne((candidate) => candidate.url === `${environment.apiBaseUrl}/redemption`)
        .flush('error', { status: 500, statusText: 'Server Error' });

      expect(status).toBe(500);
    });
  });

  describe('createPurchase', () => {
    it('posts the cart id and maps the created purchase', () => {
      let order: ConfirmedOrder | undefined;
      repository.createPurchase({ cartId: 'cart-b' }).subscribe((value) => (order = value));

      const request = http.expectOne(`${environment.apiBaseUrl}/purchases`);
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual({ cartId: 'cart-b' });
      request.flush(
        buildPurchaseResponse(
          'purchase-9',
          CHECKOUT_CAFE_FIXTURE,
          CHECKOUT_ITEMS_FIXTURE,
          new Date('2026-11-13T10:30:00Z'),
        ),
        { status: 201, statusText: 'Created' },
      );

      expect(order?.orderNumber).toBe('purchase-9');
      expect(order?.status).toBe('confirmed');
      expect(order?.total).toBe(9200);
      expect(order?.generatedPoints).toBe(170);
    });

    it('sends the validation code when there is one', () => {
      repository.createPurchase({ cartId: 'cart-b', validationCode: 'VLD-0001-ABCD' }).subscribe();

      const request = http.expectOne(`${environment.apiBaseUrl}/purchases`);
      expect(request.request.body).toEqual({ cartId: 'cart-b', validationCode: 'VLD-0001-ABCD' });
      request.flush(
        buildPurchaseResponse('purchase-9', CHECKOUT_CAFE_FIXTURE, CHECKOUT_ITEMS_FIXTURE, new Date()),
      );
    });

    it('propagates a backend rejection', () => {
      let status: number | undefined;
      repository
        .createPurchase({ cartId: 'cart-b' })
        .subscribe({ error: (error) => (status = error.status) });

      http
        .expectOne(`${environment.apiBaseUrl}/purchases`)
        .flush('Cart cannot be empty', { status: 400, statusText: 'Bad Request' });

      expect(status).toBe(400);
    });
  });
});
