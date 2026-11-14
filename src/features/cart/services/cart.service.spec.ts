import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import {
  ESPRESSO_FIXTURE,
  FLAT_WHITE_FIXTURE,
  NORTE_LATTE_FIXTURE,
} from '../../catalog/utils/product.fixture';
import { CAFE_CENTRAL_FIXTURE, CAFE_NORTE_FIXTURE } from '../../home/utils/cafe.fixture';
import { CartService } from './cart.service';

const STORAGE_KEY = 'coffee-system-cart';
const CARTS_URL = `${environment.apiBaseUrl}/carts`;

describe('CartService', () => {
  let service: CartService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CartService);
    http = TestBed.inject(HttpTestingController);

    service.items.set([{ product: ESPRESSO_FIXTURE, quantity: 2 }]);
    service.cafe.set({ externalId: 'cafe-central-001', name: 'Cafe Central' });
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  describe('addProduct', () => {
    it('adds a product of the same cafe and sends it to the backend', () => {
      const added = service.addProduct(FLAT_WHITE_FIXTURE, CAFE_CENTRAL_FIXTURE);

      const request = http.expectOne(`${CARTS_URL}/${CAFE_CENTRAL_FIXTURE.externalId}/items`);
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual({
        productId: FLAT_WHITE_FIXTURE.externalId,
        quantity: 1,
      });
      request.flush({});

      expect(added).toBe(true);
      expect(service.totalItems()).toBe(3);
      expect(service.totalPrice()).toBe(9200);
    });

    it('increases the quantity of a product that is already in the cart', () => {
      service.addProduct(ESPRESSO_FIXTURE, CAFE_CENTRAL_FIXTURE);
      http.expectOne(`${CARTS_URL}/${CAFE_CENTRAL_FIXTURE.externalId}/items`).flush({});

      expect(service.items()).toEqual([{ product: ESPRESSO_FIXTURE, quantity: 3 }]);
    });

    it('goes back to the previous cart when the backend rejects the product', () => {
      service.addProduct(FLAT_WHITE_FIXTURE, CAFE_CENTRAL_FIXTURE);

      http
        .expectOne(`${CARTS_URL}/${CAFE_CENTRAL_FIXTURE.externalId}/items`)
        .flush('Product not found in this cafe', { status: 404, statusText: 'Not Found' });

      expect(service.items()).toEqual([{ product: ESPRESSO_FIXTURE, quantity: 2 }]);
    });

    it('rejects a product of another cafe without calling the backend', () => {
      const added = service.addProduct(NORTE_LATTE_FIXTURE, CAFE_NORTE_FIXTURE);

      expect(added).toBe(false);
      expect(service.isFromAnotherCafe(NORTE_LATTE_FIXTURE)).toBe(true);
      expect(service.items().length).toBe(1);
    });
  });

  describe('replaceWithProduct', () => {
    it('empties the cart of the backend before adding the product of the other cafe', () => {
      service.replaceWithProduct(NORTE_LATTE_FIXTURE, CAFE_NORTE_FIXTURE);

      const clear = http.expectOne(`${CARTS_URL}/clear`);
      expect(clear.request.method).toBe('DELETE');
      expect(service.items()).toEqual([]);
      clear.flush(null);
      http.expectOne(`${CARTS_URL}/${CAFE_NORTE_FIXTURE.externalId}/items`).flush({});

      expect(service.items()).toEqual([{ product: NORTE_LATTE_FIXTURE, quantity: 1 }]);
      expect(service.cafe()).toEqual({ externalId: 'cafe-norte-001', name: 'Cafe Norte' });
    });
  });

  describe('quantities', () => {
    it('sends the new quantity to the backend', () => {
      service.increaseQuantity(ESPRESSO_FIXTURE.externalId);

      const request = http.expectOne(`${CARTS_URL}/items/${ESPRESSO_FIXTURE.externalId}`);
      expect(request.request.method).toBe('PUT');
      expect(request.request.body).toEqual({ quantity: 3 });
      request.flush({});

      expect(service.totalItems()).toBe(3);
    });

    it('goes back to the previous quantity when the backend fails', () => {
      service.decreaseQuantity(ESPRESSO_FIXTURE.externalId);

      http
        .expectOne(`${CARTS_URL}/items/${ESPRESSO_FIXTURE.externalId}`)
        .flush('error', { status: 500, statusText: 'Server Error' });

      expect(service.totalItems()).toBe(2);
    });
  });

  describe('removeProduct', () => {
    it('removes the product, forgets the cafe of an empty cart and tells the backend', () => {
      service.removeProduct(ESPRESSO_FIXTURE.externalId);

      const request = http.expectOne(`${CARTS_URL}/items/${ESPRESSO_FIXTURE.externalId}`);
      expect(request.request.method).toBe('DELETE');
      request.flush({});

      expect(service.items()).toEqual([]);
      expect(service.cafe()).toBeNull();
    });
  });

  describe('clearLocal', () => {
    it('empties the cart without calling the backend', () => {
      service.clearLocal();

      expect(service.items()).toEqual([]);
      expect(service.cafe()).toBeNull();
      expect(service.totalItems()).toBe(0);
      expect(service.totalPrice()).toBe(0);
      http.expectNone(`${CARTS_URL}/clear`);
    });

    it('saves the empty cart so a reload does not bring it back', () => {
      service.clearLocal();

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
      expect(saved).toEqual({ cafe: null, items: [] });
    });
  });

  describe('clear', () => {
    it('empties the local cart and the cart of the backend', () => {
      service.clear();

      expect(service.items()).toEqual([]);
      expect(service.cafe()).toBeNull();
      const request = http.expectOne(`${CARTS_URL}/clear`);
      expect(request.request.method).toBe('DELETE');
      request.flush(null);
    });
  });
});
