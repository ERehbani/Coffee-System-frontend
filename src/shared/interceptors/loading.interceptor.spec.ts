import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { PendingRequests } from '../services/pending-requests';
import { loadingInterceptor } from './loading.interceptor';

const URL = `${environment.apiBaseUrl}/cafes`;

describe('loadingInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let pendingRequests: PendingRequests;

  function configure(platformId = 'browser'): void {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: platformId },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    pendingRequests = TestBed.inject(PendingRequests);
  }

  beforeEach(() => vi.useFakeTimers());

  afterEach(() => {
    backend.verify();
    vi.useRealTimers();
  });

  it('holds a fast answer until the minimum loading time has passed', () => {
    configure();
    let cafes: unknown;
    http.get(URL).subscribe((value) => (cafes = value));

    backend.expectOne(URL).flush(['cafe']);
    vi.advanceTimersByTime(environment.minLoadingMs - 1);
    expect(cafes).toBeUndefined();

    vi.advanceTimersByTime(1);
    expect(cafes).toEqual(['cafe']);
  });

  it('does not add time to an answer that already took longer than the minimum', () => {
    configure();
    let cafes: unknown;
    http.get(URL).subscribe((value) => (cafes = value));

    vi.advanceTimersByTime(environment.minLoadingMs + 500);
    backend.expectOne(URL).flush(['cafe']);

    expect(cafes).toEqual(['cafe']);
  });

  it('counts the request as pending until its answer is delivered', () => {
    configure();
    http.get(URL).subscribe();
    expect(pendingRequests.hasPending()).toBe(true);

    backend.expectOne(URL).flush([]);
    expect(pendingRequests.hasPending()).toBe(true);

    vi.advanceTimersByTime(environment.minLoadingMs);
    expect(pendingRequests.hasPending()).toBe(false);
  });

  it('stops counting a request that fails', () => {
    configure();
    let status: number | undefined;
    http.get(URL).subscribe({ error: (error) => (status = error.status) });

    backend.expectOne(URL).flush('error', { status: 500, statusText: 'Server Error' });

    expect(status).toBe(500);
    expect(pendingRequests.hasPending()).toBe(false);
  });

  it('does not hold or count the requests that change data', () => {
    configure();
    let answered = false;
    http.post(URL, {}).subscribe(() => (answered = true));

    expect(pendingRequests.hasPending()).toBe(false);
    backend.expectOne(URL).flush({});

    expect(answered).toBe(true);
  });

  it('does not hold the requests made while rendering on the server', () => {
    configure('server');
    let cafes: unknown;
    http.get(URL).subscribe((value) => (cafes = value));

    backend.expectOne(URL).flush(['cafe']);

    expect(cafes).toEqual(['cafe']);
    expect(pendingRequests.hasPending()).toBe(false);
  });
});
