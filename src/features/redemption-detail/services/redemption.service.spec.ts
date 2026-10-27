import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { RedemptionService } from './redemption.service';

describe('RedemptionService', () => {
  let service: RedemptionService;
  let http: HttpTestingController;
  const originalUseMockApi = environment.useMockApi;

  beforeEach(() => {
    environment.useMockApi = false;
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RedemptionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    environment.useMockApi = originalUseMockApi;
  });

  it('getUsedRedemptions() hace GET a /redemption con used=true', () => {
    service.getUsedRedemptions().subscribe();

    const req = http.expectOne((r) => r.url === `${environment.apiBaseUrl}/redemption`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('used')).toBe('true');
    req.flush([]);
  });
});
