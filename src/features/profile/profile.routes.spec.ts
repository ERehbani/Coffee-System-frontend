import { Route } from '@angular/router';
import { CouponsPage } from './pages/coupons-page/coupons-page';
import routes from './profile.routes';

describe('profile routes', () => {
  const children: Route[] = routes[0].children ?? [];

  it('serves the my coupons page next to the other profile pages', () => {
    expect(children.find(({ path }) => path === 'coupons')?.component).toBe(CouponsPage);
    expect(children.some(({ path }) => path === 'redemptions/:id')).toBe(true);
  });
});
