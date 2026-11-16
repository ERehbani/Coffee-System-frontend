import { CHECKOUT_PATH, CHECKOUT_SUCCESS_PATH, HOME_PATH, PURCHASES_PATH } from './checkout-paths';

describe('checkout paths', () => {
  it('serves the checkout at /checkout', () => {
    expect(CHECKOUT_PATH).toBe('/checkout');
  });

  it('sends the client to the success screen after paying', () => {
    expect(CHECKOUT_SUCCESS_PATH).toBe('/checkout/success');
  });

  it('points to the purchase history and to the home', () => {
    expect(PURCHASES_PATH).toBe('/purchases');
    expect(HOME_PATH).toBe('/home');
  });
});
