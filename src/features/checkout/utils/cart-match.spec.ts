import { CheckoutSummary, ServerCart } from '../types/checkout.model';
import { matchesServerCart } from './cart-match';
import {
  CHECKOUT_CAFE_FIXTURE,
  CHECKOUT_ITEMS_FIXTURE,
  CHECKOUT_SERVER_CART_FIXTURE,
} from './checkout.fixture';
import { toCheckoutSummary } from './checkout.mapper';

describe('matchesServerCart', () => {
  const summary = toCheckoutSummary(CHECKOUT_CAFE_FIXTURE, CHECKOUT_ITEMS_FIXTURE) as CheckoutSummary;
  const [espresso, flatWhite] = CHECKOUT_SERVER_CART_FIXTURE.lines;

  function serverCart(overrides: Partial<ServerCart>): ServerCart {
    return { ...CHECKOUT_SERVER_CART_FIXTURE, ...overrides };
  }

  it('matches when the products, the quantities and the total are the same', () => {
    expect(matchesServerCart(summary, CHECKOUT_SERVER_CART_FIXTURE)).toBe(true);
  });

  it('matches whatever the order of the products', () => {
    expect(matchesServerCart(summary, serverCart({ lines: [flatWhite, espresso] }))).toBe(true);
  });

  it('ignores a rounding difference in the total', () => {
    expect(matchesServerCart(summary, serverCart({ total: 9200.001 }))).toBe(true);
  });

  it('does not match when a quantity differs', () => {
    const lines = [{ ...espresso, quantity: 3 }, flatWhite];

    expect(matchesServerCart(summary, serverCart({ lines }))).toBe(false);
  });

  it('does not match when the backend has a product the local cart does not', () => {
    const lines = [espresso, flatWhite, { productId: 'prod-other', quantity: 1 }];

    expect(matchesServerCart(summary, serverCart({ lines }))).toBe(false);
  });

  it('does not match when the backend misses a product of the local cart', () => {
    expect(matchesServerCart(summary, serverCart({ lines: [espresso] }))).toBe(false);
  });

  it('does not match when the backend has another product in its place', () => {
    const lines = [espresso, { productId: 'prod-other', quantity: 1 }];

    expect(matchesServerCart(summary, serverCart({ lines }))).toBe(false);
  });

  it('does not match when the total differs', () => {
    expect(matchesServerCart(summary, serverCart({ total: 9900 }))).toBe(false);
  });
});
