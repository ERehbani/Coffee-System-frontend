import { CHECKOUT_PATH, CHECKOUT_SUCCESS_PATH } from './checkout-paths';

describe('checkout paths', () => {
  it('serves the checkout at /checkout', () => {
    expect(CHECKOUT_PATH).toBe('/checkout');
  });

  it('sends the client to the purchase history after paying', () => {
    expect(CHECKOUT_SUCCESS_PATH).toBe('/purchases');
  });
});
