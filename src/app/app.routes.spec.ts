import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { environment } from '../environments/environment';
import { signInForTest } from '../features/auth/utils/auth.fixture';
import { ADMIN_NAV_ITEMS } from '../shared/components/admin-layout/admin-nav';
import { routes } from './app.routes';

describe('admin routes', () => {
  let harness: RouterTestingHarness;
  let router: Router;
  const originalUseMockApi = environment.useMockApi;

  const page = () => harness.fixture.nativeElement as HTMLElement;

  afterEach(() => {
    environment.useMockApi = originalUseMockApi;
  });

  beforeEach(async () => {
    environment.useMockApi = true;
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();
    signInForTest(['ROLE_SUPERADMIN']);

    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  it('redirects /admin to /admin/users', async () => {
    await harness.navigateByUrl('/admin');

    expect(router.url).toBe('/admin/users');
  });

  it('renders the users page inside the admin layout', async () => {
    await harness.navigateByUrl('/admin/users');

    expect(page().querySelector('app-admin-layout app-admin-users-page')).not.toBeNull();
    expect(page().querySelector('app-admin-placeholder-page')).toBeNull();
  });

  it('renders the tiers page inside the admin layout', async () => {
    await harness.navigateByUrl('/admin/tiers');

    expect(page().querySelector('app-admin-layout app-admin-tiers-page')).not.toBeNull();
    expect(page().querySelector('app-admin-placeholder-page')).toBeNull();
    expect(page().querySelector('h1')?.textContent?.trim()).toBe('Tiers');
  });

  it('renders the benefit types page inside the admin layout', async () => {
    await harness.navigateByUrl('/admin/benefit-types');

    expect(page().querySelector('app-admin-layout app-admin-benefit-types-page')).not.toBeNull();
    expect(page().querySelector('app-admin-placeholder-page')).toBeNull();
    expect(page().querySelector('h1')?.textContent?.trim()).toBe('Tipos de beneficio');
  });

  it('renders the placeholder with the section title inside the admin layout', async () => {
    await harness.navigateByUrl('/admin/clients');

    const placeholder = page().querySelector('app-admin-layout app-admin-placeholder-page');

    expect(placeholder?.querySelector('h1')?.textContent?.trim()).toBe('Clientes');
    expect(placeholder?.textContent).toContain('Próximamente');
  });

  it('marks the active section in the sidebar after navigating', async () => {
    await harness.navigateByUrl('/admin/categories');

    const current = page().querySelector('nav[aria-label="Administración"] a[aria-current="page"]');

    expect(current?.textContent?.trim()).toBe('Categorías');
  });

  it('declares one route per sidebar item', () => {
    const admin = routes.find((route) => route.path === 'admin');
    const childPaths = (admin?.children ?? []).map((route) => route.path);

    for (const item of ADMIN_NAV_ITEMS) {
      expect(childPaths).toContain(item.path);
    }
  });

  describe.each(
    ADMIN_NAV_ITEMS.filter((item) => item.path !== 'users' && item.path !== 'categories' && item.path !== 'global-benefits' && item.path !== 'purchases' && item.path !== 'tiers' && item.path !== 'benefit-types' && item.path !== 'cafes'),
  )(
    'section $label',
    ({ label, path }) => {
      it(`resolves /admin/${path} to the placeholder titled "${label}"`, async () => {
        await harness.navigateByUrl(`/admin/${path}`);

        expect(router.url).toBe(`/admin/${path}`);
        expect(
          page()
            .querySelector('app-admin-layout app-admin-placeholder-page h1')
            ?.textContent?.trim(),
        ).toBe(label);
      });
    },
  );
});

describe('cafe routes', () => {
  let harness: RouterTestingHarness;
  let router: Router;
  const originalUseMockApi = environment.useMockApi;

  const page = () => harness.fixture.nativeElement as HTMLElement;

  async function navigateAs(roles: string[], url: string): Promise<void> {
    signInForTest(roles);
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
    await harness.navigateByUrl(url);
  }

  beforeEach(async () => {
    environment.useMockApi = true;
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  afterEach(() => {
    environment.useMockApi = originalUseMockApi;
  });

  it('renders the coupon validator for a cafe', async () => {
    await navigateAs(['ROLE_CAFETERIA'], '/cafe/validate');

    expect(router.url).toBe('/cafe/validate');
    expect(page().querySelector('app-coupon-validation-page')).not.toBeNull();
  });

  it('keeps a client out of the coupon validator', async () => {
    await navigateAs(['ROLE_CLIENTE'], '/cafe/validate');

    expect(router.url).toBe('/home');
    expect(page().querySelector('app-coupon-validation-page')).toBeNull();
  });
});
