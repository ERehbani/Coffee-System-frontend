import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { signInForTest } from '../utils/auth.fixture';
import { SESSION_EXPIRED_REASON, authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  const api = environment.apiBaseUrl;
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let router: Router;
  let auth: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    auth = TestBed.inject(AuthService);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => httpTesting.verify());

  it('does not add an Authorization header to api requests', () => {
    signInForTest(['ROLE_CLIENTE']);

    http.get(`${api}/cafes`).subscribe();

    const req = httpTesting.expectOne(`${api}/cafes`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('closes the session and goes to the login on a 401', () => {
    signInForTest(['ROLE_CLIENTE']);
    let receivedStatus: number | undefined;

    http.get(`${api}/cafes`).subscribe({ error: (error) => (receivedStatus = error.status) });
    httpTesting.expectOne(`${api}/cafes`).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(receivedStatus).toBe(401);
    expect(auth.isAuthenticated()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { reason: SESSION_EXPIRED_REASON },
    });
  });

  it('does not redirect on a 401 when there is no session', () => {
    http.get(`${api}/cafes`).subscribe({ error: () => undefined });
    httpTesting.expectOne(`${api}/cafes`).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('does not redirect when an auth request answers 401', () => {
    signInForTest(['ROLE_CLIENTE']);

    http.get(`${api}/auth/me`).subscribe({ error: () => undefined });
    httpTesting.expectOne(`${api}/auth/me`).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(auth.isAuthenticated()).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('keeps the session on a 403', () => {
    signInForTest(['ROLE_CLIENTE']);

    http.get(`${api}/tiers`).subscribe({ error: () => undefined });
    httpTesting.expectOne(`${api}/tiers`).flush(null, { status: 403, statusText: 'Forbidden' });

    expect(auth.isAuthenticated()).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
