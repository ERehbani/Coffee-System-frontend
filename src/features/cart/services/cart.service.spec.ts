import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { MOCK_PRODUCTS } from '../../catalog/data/products.mock';
import { CartService } from './cart.service';

const STORAGE_KEY = 'coffee-system-cart';

describe('CartService', () => {
  let service: CartService;
  let http: HttpTestingController;
  const originalUseMockApi = environment.useMockApi;

  beforeEach(() => {
    environment.useMockApi = false;
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CartService);
    http = TestBed.inject(HttpTestingController);

    service.items.set([{ product: MOCK_PRODUCTS[0], quantity: 2 }]);
    service.cafe.set({ externalId: 'cafe-central-001', name: 'Cafe Central' });
  });

  afterEach(() => {
    http.verify();
    environment.useMockApi = originalUseMockApi;
    localStorage.clear();
  });

  describe('clearLocal', () => {
    it('empties the cart without calling the backend', () => {
      service.clearLocal();

      expect(service.items()).toEqual([]);
      expect(service.cafe()).toBeNull();
      expect(service.totalItems()).toBe(0);
      expect(service.totalPrice()).toBe(0);
      http.expectNone(`${environment.apiBaseUrl}/carts/clear`);
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
      const request = http.expectOne(`${environment.apiBaseUrl}/carts/clear`);
      expect(request.request.method).toBe('DELETE');
      request.flush(null);
    });

    it('does not call the backend in mock mode', () => {
      environment.useMockApi = true;

      service.clear();

      expect(service.items()).toEqual([]);
      http.expectNone(`${environment.apiBaseUrl}/carts/clear`);
    });
  });
});
