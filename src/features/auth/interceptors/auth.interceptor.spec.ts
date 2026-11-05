import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { clearTestSession, storeTestSession } from '../utils/auth.fixture';
import { SESSION_EXPIRED_REASON, authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  const api = environment.apiBaseUrl;
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let router: Router;

  function setup(): void {
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
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  }

  afterEach(() => {
    httpTesting.verify();
    clearTestSession();
  });

  it('adds the bearer token to api requests', () => {
    storeTestSession(['ROLE_CLIENTE']);
    setup();
    const token = TestBed.inject(AuthService).token();

    http.get(`${api}/cafes`).subscribe();

    const req = httpTesting.expectOne(`${api}/cafes`);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush([]);
  });

  it('does not add the token to the login request', () => {
    storeTestSession(['ROLE_CLIENTE']);
    setup();

    http.post(`${api}/auth/login`, {}).subscribe();

    const req = httpTesting.expectOne(`${api}/auth/login`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ token: 'x' });
  });

  it('does not add the token to requests outside the api', () => {
    storeTestSession(['ROLE_CLIENTE']);
    setup();

    http.get('/assets/config.json').subscribe();

    const req = httpTesting.expectOne('/assets/config.json');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('does not add the header when there is no session', () => {
    setup();

    http.get(`${api}/cafes`).subscribe();

    const req = httpTesting.expectOne(`${api}/cafes`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('closes the session and goes to the login on a 401', () => {
    storeTestSession(['ROLE_CLIENTE']);
    setup();
    const auth = TestBed.inject(AuthService);
    let receivedStatus: number | undefined;

    http.get(`${api}/cafes`).subscribe({ error: (error) => (receivedStatus = error.status) });
    httpTesting.expectOne(`${api}/cafes`).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(receivedStatus).toBe(401);
    expect(auth.isAuthenticated()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { reason: SESSION_EXPIRED_REASON },
    });
  });

  it('keeps the session on a 403', () => {
    storeTestSession(['ROLE_CLIENTE']);
    setup();
    const auth = TestBed.inject(AuthService);

    http.get(`${api}/tiers`).subscribe({ error: () => undefined });
    httpTesting.expectOne(`${api}/tiers`).flush(null, { status: 403, statusText: 'Forbidden' });

    expect(auth.isAuthenticated()).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
