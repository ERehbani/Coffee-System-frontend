import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, Observable } from 'rxjs';
import { CartService } from '../../cart/services/cart.service';
import { MOCK_PURCHASES } from '../../purchase-history/data/purchases.mock';
import { CHECKOUT_CAFE_FIXTURE, CHECKOUT_ITEMS_FIXTURE } from '../utils/checkout.fixture';
import {
  DISCOUNT_COUPON_DTO,
  MEMBER_PRODUCT_COUPON_DTO,
  OTHER_CAFE_COUPON_DTO,
  TWO_FOR_ONE_COUPON_DTO,
  USED_COUPON_DTO,
} from '../utils/coupon.fixture';
import { MOCK_LATENCY_MS, MockCheckoutRepository } from './mock-checkout.repository';

describe('MockCheckoutRepository', () => {
  let repository: MockCheckoutRepository;
  let cart: CartService;
  const originalPurchaseCount = MOCK_PURCHASES.length;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [MockCheckoutRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    cart = TestBed.inject(CartService);
    cart.items.set([...CHECKOUT_ITEMS_FIXTURE]);
    cart.cafe.set(CHECKOUT_CAFE_FIXTURE);
    repository = TestBed.inject(MockCheckoutRepository);
  });

  afterEach(() => {
    vi.useRealTimers();
    MOCK_PURCHASES.splice(originalPurchaseCount);
    localStorage.clear();
  });

  function settle<T>(source: Observable<T>): Promise<T> {
    const result = firstValueFrom(source);
    vi.advanceTimersByTime(MOCK_LATENCY_MS);
    return result;
  }

  it('gives a cart id for the cafe', async () => {
    expect(await settle(repository.findCartId('cafe-central-001'))).toBe(
      'mock-cart-cafe-central-001',
    );
  });

  it('creates a confirmed order from the local cart', async () => {
    const order = await settle(repository.createPurchase({ cartId: 'mock-cart-cafe-central-001' }));

    expect(order.orderNumber).toBe('purchase-mock-0001');
    expect(order.status).toBe('confirmed');
    expect(order.cafeName).toBe('Cafe Central');
    expect(order.total).toBe(9200);
    expect(order.generatedPoints).toBe(170);
    expect(order.lines.map((line) => line.quantity)).toEqual([2, 1]);
  });

  it('gives every order its own number', async () => {
    const first = await settle(repository.createPurchase({ cartId: 'cart' }));
    const second = await settle(repository.createPurchase({ cartId: 'cart' }));

    expect(first.orderNumber).not.toBe(second.orderNumber);
  });

  it('adds the order to the mocked purchase history', async () => {
    const order = await settle(repository.createPurchase({ cartId: 'cart' }));

    const saved = MOCK_PURCHASES.find((purchase) => purchase.externalId === order.orderNumber);
    expect(saved?.cafeName).toBe('Cafe Central');
    expect(saved?.status).toBe('CONFIRMED');
    expect(saved?.details.length).toBe(2);
  });

  it('rejects an empty cart like the backend does', async () => {
    cart.clearLocal();

    const error = await settle(repository.createPurchase({ cartId: 'cart' })).catch(
      (rejection: unknown) => rejection,
    );

    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect((error as HttpErrorResponse).status).toBe(400);
    expect((error as HttpErrorResponse).error).toBe('Cart cannot be empty');
  });

  describe('coupons', () => {
    async function rejectionOf(code: string): Promise<HttpErrorResponse> {
      const rejection = await settle(
        repository.createPurchase({ cartId: 'cart', validationCode: code }),
      ).catch((error: unknown) => error);
      return rejection as HttpErrorResponse;
    }

    it('lists only the active redemptions, like the state filter of the backend', async () => {
      const coupons = await settle(repository.findCoupons());

      expect(coupons.every((coupon) => coupon.isActive)).toBe(true);
      expect(coupons.map((coupon) => coupon.id)).not.toContain(USED_COUPON_DTO.externalId);
      expect(coupons.map((coupon) => coupon.id)).toContain(DISCOUNT_COUPON_DTO.externalId);
    });

    it('applies a percentage coupon to the total of the order', async () => {
      const order = await settle(
        repository.createPurchase({
          cartId: 'cart',
          validationCode: DISCOUNT_COUPON_DTO.validationCode,
        }),
      );

      expect(order.total).toBe(7820);
      expect(order.redemptionId).toBe(DISCOUNT_COUPON_DTO.externalId);
    });

    it('applies a two for one to the units of the product', async () => {
      const order = await settle(
        repository.createPurchase({
          cartId: 'cart',
          validationCode: TWO_FOR_ONE_COUPON_DTO.validationCode,
        }),
      );

      expect(order.total).toBe(6400);
    });

    it('adds the gift product to the order without changing the total', async () => {
      const order = await settle(
        repository.createPurchase({
          cartId: 'cart',
          validationCode: MEMBER_PRODUCT_COUPON_DTO.validationCode,
        }),
      );

      expect(order.total).toBe(9200);
      expect(order.lines.map((line) => line.productName)).toContain('Croissant de Almendras');
    });

    it('does not offer a coupon again after using it', async () => {
      await settle(
        repository.createPurchase({
          cartId: 'cart',
          validationCode: DISCOUNT_COUPON_DTO.validationCode,
        }),
      );

      const coupons = await settle(repository.findCoupons());

      expect(coupons.map((coupon) => coupon.id)).not.toContain(DISCOUNT_COUPON_DTO.externalId);
    });

    it('rejects an unknown code with a 404 like the backend', async () => {
      const error = await rejectionOf('nope');

      expect(error.status).toBe(404);
      expect(error.error).toBe('Invalid code');
    });

    it('rejects a code that was already used', async () => {
      const error = await rejectionOf(USED_COUPON_DTO.validationCode);

      expect(error.status).toBe(400);
      expect(error.error).toEqual({ error: 'Code already used', status: 400 });
    });

    it('rejects a code of another cafe', async () => {
      const error = await rejectionOf(OTHER_CAFE_COUPON_DTO.validationCode);

      expect(error.status).toBe(400);
      expect(error.error.error).toBe('This code does not belong to this cafe');
    });
  });
});
