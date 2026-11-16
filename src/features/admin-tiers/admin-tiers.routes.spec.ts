import { Route } from '@angular/router';
import routes from './admin-tiers.routes';
import { AdminTiersPage } from './pages/admin-tiers-page/admin-tiers-page';
import { TierRepository } from './services/tier.repository';
import { AdminTierStore } from './services/tier.store';

describe('admin tiers routes', () => {
  const route: Route = routes[0];

  it('serves the tiers page at the section root', () => {
    expect(route.path).toBe('');
    expect(route.component).toBe(AdminTiersPage);
  });

  it('provides the repository and the store to the page', () => {
    const providers = (route.providers ?? []) as unknown[];

    expect(providers).toContain(AdminTierStore);
    expect(
      providers.some((provider) => (provider as { provide?: unknown }).provide === TierRepository),
    ).toBe(true);
  });
});
