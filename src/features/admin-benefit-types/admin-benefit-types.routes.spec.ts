import { Route } from '@angular/router';
import routes from './admin-benefit-types.routes';
import { AdminBenefitTypesPage } from './pages/admin-benefit-types-page/admin-benefit-types-page';
import { BenefitFormatRepository } from './services/benefit-format.repository';
import { AdminBenefitFormatStore } from './services/benefit-format.store';

describe('admin benefit types routes', () => {
  const route: Route = routes[0];

  it('serves the benefit types page at the section root', () => {
    expect(route.path).toBe('');
    expect(route.component).toBe(AdminBenefitTypesPage);
  });

  it('provides the repository and the store to the page', () => {
    const providers = (route.providers ?? []) as unknown[];

    expect(providers).toContain(AdminBenefitFormatStore);
    expect(
      providers.some(
        (provider) => (provider as { provide?: unknown }).provide === BenefitFormatRepository,
      ),
    ).toBe(true);
  });
});
