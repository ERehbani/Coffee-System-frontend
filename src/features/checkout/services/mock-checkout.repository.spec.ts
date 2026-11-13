import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, Observable } from 'rxjs';
import { CartService } from '../../cart/services/cart.service';
import { MOCK_PURCHASES } from '../../purchase-history/data/purchases.mock';
import { CHECKOUT_CAFE_FIXTURE, CHECKOUT_ITEMS_FIXTURE } from '../utils/checkout.fixture';
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
});
