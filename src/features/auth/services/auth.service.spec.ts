import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { clearTestSession, createTestToken, storeTestSession } from '../utils/auth.fixture';
import { AuthService, TOKEN_KEY } from './auth.service';

describe('AuthService', () => {
  let http: HttpTestingController;

  function createService(): AuthService {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    return TestBed.inject(AuthService);
  }

  afterEach(() => {
    http.verify();
    clearTestSession();
  });

  it('starts without a session when nothing is stored', () => {
    const service = createService();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.token()).toBeNull();
    expect(service.roles()).toEqual([]);
  });

  it('restores a valid stored session', () => {
    storeTestSession(['ROLE_CAFETERIA']);

    const service = createService();

    expect(service.isAuthenticated()).toBe(true);
    expect(service.email()).toBe('user@test.com');
    expect(service.hasRole('ROLE_CAFETERIA')).toBe(true);
  });

  it('discards an expired stored token', () => {
    localStorage.setItem(TOKEN_KEY, createTestToken({ exp: Math.floor(Date.now() / 1000) - 60 }));

    const service = createService();

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('discards an invalid stored token', () => {
    localStorage.setItem(TOKEN_KEY, 'not-a-token');

    const service = createService();

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('ignores roles that the app does not know', () => {
    storeTestSession(['ROLE_CLIENTE', 'READ_PRODUCTS']);

    const service = createService();

    expect(service.roles()).toEqual(['ROLE_CLIENTE']);
  });

  it('login() sends the email and password and saves the token', () => {
    const service = createService();
    const token = createTestToken({ roles: ['ROLE_SUPERADMIN'] });

    service.login({ email: 'admin@test.com', password: 'Secret123' }).subscribe();

    const req = http.expectOne(`${environment.apiBaseUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'admin@test.com', password: 'Secret123' });
    req.flush({ token });

    expect(service.token()).toBe(token);
    expect(service.hasRole('ROLE_SUPERADMIN')).toBe(true);
    expect(localStorage.getItem(TOKEN_KEY)).toBe(token);
  });

  it('login() does not save anything when the back rejects the credentials', () => {
    const service = createService();

    service.login({ email: 'admin@test.com', password: 'wrong' }).subscribe({ error: () => undefined });

    http
      .expectOne(`${environment.apiBaseUrl}/auth/login`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('logout() removes the token from memory and storage', () => {
    storeTestSession(['ROLE_CLIENTE']);
    const service = createService();

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
