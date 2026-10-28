import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AvailableBenefitService } from './available-benefit.service';

describe('AvailableBenefitService', () => {
  let service: AvailableBenefitService;
  let http: HttpTestingController;
  const originalUseMockApi = environment.useMockApi;
  const url = `${environment.apiBaseUrl}/benefits/available`;

  beforeEach(() => {
    environment.useMockApi = false;
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AvailableBenefitService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    environment.useMockApi = originalUseMockApi;
  });

  it('getAvailable() hace GET a /benefits/available sin filtros', () => {
    service.getAvailable('', '').subscribe();

    const req = http.expectOne((r) => r.url === url);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys()).toEqual([]);
    req.flush([]);
  });

  it('getAvailable() manda la cafetería y el tipo elegidos', () => {
    service.getAvailable('cafe-1', 'DOS_POR_UNO').subscribe();

    const req = http.expectOne((r) => r.url === url);
    expect(req.request.params.get('cafeId')).toBe('cafe-1');
    expect(req.request.params.get('type')).toBe('DOS_POR_UNO');
    req.flush([]);
  });
});
