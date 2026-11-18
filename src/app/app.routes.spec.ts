import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { environment } from '../environments/environment';
import { signInForTest, signOutForTest } from '../features/auth/utils/auth.fixture';
import { CAFE_PROFILE_FIXTURE } from '../features/cafe-profile/utils/cafe-profile.fixture';
import { ADMIN_NAV_ITEMS } from '../shared/components/admin-layout/admin-nav';
import { routes } from './app.routes';

describe('register route', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  it('renders the register page without a session', async () => {
    signOutForTest();

    await harness.navigateByUrl('/register');

    expect(router.url).toBe('/register');
    expect(harness.fixture.nativeElement.querySelector('app-register-page')).not.toBeNull();
  });

  it('sends a signed-in user to their home', async () => {
    signInForTest(['ROLE_CLIENTE']);

    await harness.navigateByUrl('/register');

    expect(router.url).toBe('/home');
  });
});

describe('admin routes', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  const page = () => harness.fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
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
    expect(page().querySelector('h1')?.textContent?.trim()).toBe('Niveles');
  });

  it('renders the benefit types page inside the admin layout', async () => {
    await harness.navigateByUrl('/admin/benefit-types');

    expect(page().querySelector('app-admin-layout app-admin-benefit-types-page')).not.toBeNull();
    expect(page().querySelector('app-admin-placeholder-page')).toBeNull();
    expect(page().querySelector('h1')?.textContent?.trim()).toBe('Tipos de beneficio');
  });

  it('renders the clients page inside the admin layout', async () => {
    await harness.navigateByUrl('/admin/clients');

    expect(page().querySelector('app-admin-layout app-admin-clients-page')).not.toBeNull();
    expect(page().querySelector('app-admin-placeholder-page')).toBeNull();
    expect(page().querySelector('h1')?.textContent?.trim()).toBe('Clientes');
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
    ADMIN_NAV_ITEMS.filter((item) => item.path !== 'users' && item.path !== 'clients' && item.path !== 'categories' && item.path !== 'global-benefits' && item.path !== 'purchases' && item.path !== 'tiers' && item.path !== 'benefit-types' && item.path !== 'cafes'),
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

  const page = () => harness.fixture.nativeElement as HTMLElement;

  async function navigateAs(roles: string[], url: string): Promise<void> {
    signInForTest(roles);
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
    await harness.navigateByUrl(url);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  async function navigateAsCafe(url: string, profileComplete: boolean): Promise<void> {
    signInForTest(['ROLE_CAFETERIA']);
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
    const http = TestBed.inject(HttpTestingController);
    let finished = false;
    const navigation = harness.navigateByUrl(url).finally(() => (finished = true));
    for (let attempt = 0; attempt < 200 && !finished; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 10));
      http
        .match(`${environment.apiBaseUrl}/cafes/me`)
        .forEach((request) => request.flush({ ...CAFE_PROFILE_FIXTURE, profileComplete }));
    }
    await navigation;
  }

  it('renders the coupon validator inside the cafe layout for a cafe with a complete profile', async () => {
    await navigateAsCafe('/cafe/validate', true);

    expect(router.url).toBe('/cafe/validate');
    expect(page().querySelector('app-cafe-layout app-coupon-validation-page')).not.toBeNull();
  });

  it('sends a cafe that did not finish its profile to the onboarding', async () => {
    await navigateAsCafe('/cafe/products', false);

    expect(router.url).toBe('/cafe/onboarding');
    expect(page().querySelector('app-onboarding-page')).not.toBeNull();
  });

  it('opens the dashboard when the cafe enters its area', async () => {
    await navigateAsCafe('/cafe', true);

    expect(router.url).toBe('/cafe/dashboard');
  });

  it('keeps a client out of the coupon validator', async () => {
    await navigateAs(['ROLE_CLIENTE'], '/cafe/validate');

    expect(router.url).toBe('/home');
    expect(page().querySelector('app-coupon-validation-page')).toBeNull();
  });
});

describe('checkout route', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  const page = () => harness.fixture.nativeElement as HTMLElement;

  async function openCheckoutAs(roles: string[]): Promise<void> {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    signInForTest(roles);

    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
    await harness.navigateByUrl('/checkout');
  }

  it('renders the checkout page inside the client layout for a client', async () => {
    await openCheckoutAs(['ROLE_CLIENTE']);

    expect(router.url).toBe('/checkout');
    expect(page().querySelector('app-client-layout app-checkout-page')).not.toBeNull();
  });

  it('keeps any other role out of the checkout', async () => {
    await openCheckoutAs(['ROLE_SUPERADMIN']);

    expect(router.url).not.toBe('/checkout');
    expect(page().querySelector('app-checkout-page')).toBeNull();
  });

  it('sends the client to the purchase history when opening the success screen directly', async () => {
    await openCheckoutAs(['ROLE_CLIENTE']);

    await harness.navigateByUrl('/checkout/success');

    expect(router.url).toBe('/purchases');
  });
});

describe('unknown routes', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  it('shows the not found page and keeps the address', async () => {
    signInForTest(['ROLE_CLIENTE']);

    await harness.navigateByUrl('/esta-pagina-no-existe');

    expect(router.url).toBe('/esta-pagina-no-existe');
    const page = harness.fixture.nativeElement as HTMLElement;
    expect(page.querySelector('app-not-found-page')).not.toBeNull();
    expect(page.textContent).toContain('No encontramos esta página');
    expect(page.querySelector('a')?.getAttribute('href')).toBe('/home');
  });

  it('offers the login to a visitor without a session', async () => {
    signOutForTest();

    await harness.navigateByUrl('/cualquier-cosa');

    const page = harness.fixture.nativeElement as HTMLElement;
    expect(page.querySelector('app-not-found-page')).not.toBeNull();
    expect(page.querySelector('a')?.getAttribute('href')).toBe('/login');
  });
});
