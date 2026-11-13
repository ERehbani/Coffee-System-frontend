import { Route } from '@angular/router';
import routes from './coupon-validation.routes';
import { CouponValidationPage } from './pages/coupon-validation-page/coupon-validation-page';
import { CouponValidationRepository } from './services/coupon-validation.repository';

describe('coupon validation routes', () => {
  const route: Route = routes[0];

  it('serves the validation page at the section root', () => {
    expect(route.path).toBe('');
    expect(route.component).toBe(CouponValidationPage);
  });

  it('provides the repository to the page', () => {
    const providers = (route.providers ?? []) as unknown[];

    expect(
      providers.some(
        (provider) => (provider as { provide?: unknown }).provide === CouponValidationRepository,
      ),
    ).toBe(true);
  });
});
