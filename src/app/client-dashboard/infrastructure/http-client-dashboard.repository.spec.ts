import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { buildClientDashboardFixture } from './client-dashboard.fixture';
import { HttpClientDashboardRepository } from './http-client-dashboard.repository';

describe('HttpClientDashboardRepository', () => {
  const url = `${environment.apiBaseUrl}/clients/me/dashboard`;
  let repository: HttpClientDashboardRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpClientDashboardRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repository = TestBed.inject(HttpClientDashboardRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('requests the dashboard of the current client and maps the response', async () => {
    const dashboard = firstValueFrom(repository.getDashboard());

    const request = http.expectOne(url);
    expect(request.request.method).toBe('GET');
    request.flush(buildClientDashboardFixture(new Date('2026-10-12T12:00:00.000Z')));

    const result = await dashboard;
    expect(result.loyalty.tier).toBe('silver');
    expect(result.activeRedemptions[0].expiresAt).toEqual(new Date('2026-10-17T12:00:00.000Z'));
  });

  it('propagates server errors', async () => {
    const dashboard = firstValueFrom(repository.getDashboard());

    http.expectOne(url).flush('Unavailable', { status: 503, statusText: 'Service Unavailable' });

    await expect(dashboard).rejects.toMatchObject({ status: 503 });
  });
});
