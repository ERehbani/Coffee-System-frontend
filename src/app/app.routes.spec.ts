import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ADMIN_NAV_ITEMS } from '../shared/components/admin-layout/admin-nav';
import { routes } from './app.routes';

describe('admin routes', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  const page = () => harness.fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();

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

  it('renders the placeholder with the section title inside the admin layout', async () => {
    await harness.navigateByUrl('/admin/tiers');

    const placeholder = page().querySelector('app-admin-layout app-admin-placeholder-page');

    expect(placeholder?.querySelector('h1')?.textContent?.trim()).toBe('Tiers');
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
    ADMIN_NAV_ITEMS.filter((item) => item.path !== 'users' && item.path !== 'cafes'),
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
