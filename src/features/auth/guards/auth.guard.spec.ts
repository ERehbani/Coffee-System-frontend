import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TOKEN_KEY } from '../services/auth.service';
import { clearTestSession, storeTestSession } from '../utils/auth.fixture';
import { guestGuard, roleGuard } from './auth.guard';

@Component({ template: '' })
class EmptyPage {}

describe('auth guards', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  async function setup(): Promise<void> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', component: EmptyPage, canActivate: [guestGuard] },
          { path: 'admin', component: EmptyPage, canActivate: [roleGuard('ROLE_SUPERADMIN')] },
          { path: 'cafe/profile', component: EmptyPage, canActivate: [roleGuard('ROLE_CAFETERIA')] },
          { path: 'home', component: EmptyPage, canActivate: [roleGuard('ROLE_CLIENTE')] },
        ]),
      ],
    });
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  }

  afterEach(() => clearTestSession());

  describe('roleGuard', () => {
    it('sends to the login when there is no session', async () => {
      await setup();

      await harness.navigateByUrl('/admin');

      expect(router.url).toBe('/login');
    });

    it('lets in a user with the required role', async () => {
      storeTestSession(['ROLE_SUPERADMIN']);
      await setup();

      await harness.navigateByUrl('/admin');

      expect(router.url).toBe('/admin');
    });

    it('sends a client that opens the admin panel to the home', async () => {
      storeTestSession(['ROLE_CLIENTE']);
      await setup();

      await harness.navigateByUrl('/admin');

      expect(router.url).toBe('/home');
    });

    it('sends a cafe that opens the home to its profile', async () => {
      storeTestSession(['ROLE_CAFETERIA']);
      await setup();

      await harness.navigateByUrl('/home');

      expect(router.url).toBe('/cafe/profile');
    });

    it('closes the session when the token has no known role', async () => {
      storeTestSession(['READ_PRODUCTS']);
      await setup();

      await harness.navigateByUrl('/home');

      expect(router.url).toBe('/login');
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });
  });

  describe('guestGuard', () => {
    it('shows the login when there is no session', async () => {
      await setup();

      await harness.navigateByUrl('/login');

      expect(router.url).toBe('/login');
    });

    it('sends a logged in user to the page of their role', async () => {
      storeTestSession(['ROLE_SUPERADMIN']);
      await setup();

      await harness.navigateByUrl('/login');

      expect(router.url).toBe('/admin');
    });
  });
});
