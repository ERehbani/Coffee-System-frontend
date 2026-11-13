import { Provider } from '@angular/core';
import { Route } from '@angular/router';
import routes from './checkout.routes';
import { CheckoutPage } from './pages/checkout-page/checkout-page';
import { CheckoutRepository } from './services/checkout.repository';
import { CheckoutStore } from './services/checkout.store';

describe('checkout routes', () => {
  const parent: Route = routes[0];
  const providers = (parent.providers ?? []) as Provider[];

  it('serves the checkout page at the root of the feature', () => {
    const children = parent.children ?? [];

    expect(children.find(({ path }) => path === '')?.component).toBe(CheckoutPage);
  });

  it('shares the repository and the store with every checkout page', () => {
    expect(providers).toContain(CheckoutStore);
    expect(
      providers.some(
        (provider) =>
          typeof provider === 'object' && 'provide' in provider && provider.provide === CheckoutRepository,
      ),
    ).toBe(true);
  });
});
