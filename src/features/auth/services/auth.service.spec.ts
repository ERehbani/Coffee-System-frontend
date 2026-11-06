import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { SessionUser } from '../types/auth.model';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const authUrl = `${environment.apiBaseUrl}/auth`;
  let http: HttpTestingController;
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);
  });

  afterEach(() => http.verify());

  it('starts without a session', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.email()).toBeNull();
    expect(service.roles()).toEqual([]);
  });

  it('login() sends the credentials and keeps the user of the response', () => {
    service.login({ email: 'admin@test.com', password: 'Secret123' }).subscribe();

    const req = http.expectOne(`${authUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'admin@test.com', password: 'Secret123' });
    req.flush({ email: 'admin@test.com', roles: ['ROLE_SUPERADMIN'] });

    expect(service.email()).toBe('admin@test.com');
    expect(service.hasRole('ROLE_SUPERADMIN')).toBe(true);
  });

  it('login() leaves no session when the back rejects the credentials', () => {
    service.login({ email: 'admin@test.com', password: 'wrong' }).subscribe({ error: () => undefined });

    http.expectOne(`${authUrl}/login`).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(service.isAuthenticated()).toBe(false);
  });

  it('ignores roles that the app does not know', () => {
    service.startSession({ email: 'user@test.com', roles: ['ROLE_CLIENTE', 'READ_PRODUCTS'] });

    expect(service.roles()).toEqual(['ROLE_CLIENTE']);
  });

  it('loadSession() restores the session from /auth/me', () => {
    let loaded: SessionUser | null = null;

    service.loadSession().subscribe((user) => (loaded = user));
    http.expectOne(`${authUrl}/me`).flush({ email: 'cafe.central@test.com', roles: ['ROLE_CAFETERIA'] });

    expect(loaded).toEqual({ email: 'cafe.central@test.com', roles: ['ROLE_CAFETERIA'] });
    expect(service.hasRole('ROLE_CAFETERIA')).toBe(true);
  });

  it('loadSession() asks the back only once', () => {
    service.loadSession().subscribe();
    service.loadSession().subscribe();
    http.expectOne(`${authUrl}/me`).flush({ email: 'user@test.com', roles: ['ROLE_CLIENTE'] });

    service.loadSession().subscribe();

    http.expectNone(`${authUrl}/me`);
  });

  it('loadSession() leaves no session when /auth/me answers 401', () => {
    let loaded: SessionUser | null | undefined;

    service.loadSession().subscribe((user) => (loaded = user));
    http.expectOne(`${authUrl}/me`).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(loaded).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('loadSession() does not ask the back after a login', () => {
    service.startSession({ email: 'user@test.com', roles: ['ROLE_CLIENTE'] });

    service.loadSession().subscribe();

    http.expectNone(`${authUrl}/me`);
  });

  it('logout() clears the session and asks the back to remove the cookie', () => {
    service.startSession({ email: 'user@test.com', roles: ['ROLE_CLIENTE'] });

    service.logout().subscribe();

    const req = http.expectOne(`${authUrl}/logout`);
    expect(req.request.method).toBe('POST');
    req.flush(null, { status: 204, statusText: 'No Content' });
    expect(service.isAuthenticated()).toBe(false);
  });

  it('logout() completes even when the back fails', () => {
    service.startSession({ email: 'user@test.com', roles: ['ROLE_CLIENTE'] });
    let completed = false;

    service.logout().subscribe({ complete: () => (completed = true) });
    http.expectOne(`${authUrl}/logout`).flush(null, { status: 500, statusText: 'Server Error' });

    expect(completed).toBe(true);
    expect(service.isAuthenticated()).toBe(false);
  });
});
