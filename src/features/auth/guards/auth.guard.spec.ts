import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { signInForTest, signOutForTest } from '../utils/auth.fixture';
import { guestGuard, roleGuard } from './auth.guard';

@Component({ template: '' })
class EmptyPage {}

describe('auth guards', () => {
  const authUrl = `${environment.apiBaseUrl}/auth`;
  let harness: RouterTestingHarness;
  let router: Router;
  let http: HttpTestingController;

  async function createHarness(): Promise<void> {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'login', component: EmptyPage, canActivate: [guestGuard] },
          { path: 'admin', component: EmptyPage, canActivate: [roleGuard('ROLE_SUPERADMIN')] },
          { path: 'cafe/profile', component: EmptyPage, canActivate: [roleGuard('ROLE_CAFETERIA')] },
          { path: 'home', component: EmptyPage, canActivate: [roleGuard('ROLE_CLIENTE')] },
        ]),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    harness = await RouterTestingHarness.create();
  }

  async function setupSignedIn(roles: string[]): Promise<void> {
    await createHarness();
    signInForTest(roles);
  }

  async function setupSignedOut(): Promise<void> {
    await createHarness();
    signOutForTest();
  }

  afterEach(() => http.verify());

  describe('roleGuard', () => {
    it('sends to the login when there is no session', async () => {
      await setupSignedOut();

      await harness.navigateByUrl('/admin');

      expect(router.url).toBe('/login');
    });

    it('lets in a user with the required role', async () => {
      await setupSignedIn(['ROLE_SUPERADMIN']);

      await harness.navigateByUrl('/admin');

      expect(router.url).toBe('/admin');
    });

    it('sends a client that opens the admin panel to the home', async () => {
      await setupSignedIn(['ROLE_CLIENTE']);

      await harness.navigateByUrl('/admin');

      expect(router.url).toBe('/home');
    });

    it('sends a cafe that opens the home to its profile', async () => {
      await setupSignedIn(['ROLE_CAFETERIA']);

      await harness.navigateByUrl('/home');

      expect(router.url).toBe('/cafe/profile');
    });

    it('closes the session when the user has no known role', async () => {
      await setupSignedIn(['READ_PRODUCTS']);

      await harness.navigateByUrl('/home');

      expect(router.url).toBe('/login');
      expect(TestBed.inject(AuthService).isAuthenticated()).toBe(false);
      http.expectOne(`${authUrl}/logout`).flush(null);
    });

    it('waits for /auth/me before deciding after a reload', async () => {
      await createHarness();

      const navigation = harness.navigateByUrl('/home');
      await new Promise((resolve) => setTimeout(resolve));
      http.expectOne(`${authUrl}/me`).flush({ email: 'cliente@test.com', roles: ['ROLE_CLIENTE'] });
      await navigation;

      expect(router.url).toBe('/home');
    });
  });

  describe('guestGuard', () => {
    it('shows the login when there is no session', async () => {
      await setupSignedOut();

      await harness.navigateByUrl('/login');

      expect(router.url).toBe('/login');
    });

    it('sends a logged in user to the page of their role', async () => {
      await setupSignedIn(['ROLE_SUPERADMIN']);

      await harness.navigateByUrl('/login');

      expect(router.url).toBe('/admin');
    });
  });
});
