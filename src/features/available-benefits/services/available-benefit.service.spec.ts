import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AvailableBenefit } from '../model/available-benefit.model';
import { CAFE_BENEFIT_FIXTURE } from '../utils/available-benefit.fixture';
import { AvailableBenefitService } from './available-benefit.service';

describe('AvailableBenefitService', () => {
  let service: AvailableBenefitService;
  let http: HttpTestingController;
  const url = `${environment.apiBaseUrl}/benefits/available`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AvailableBenefitService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('asks for the whole catalog when there are no filters', () => {
    let benefits: AvailableBenefit[] | undefined;
    service.getAvailable('', '').subscribe((value) => (benefits = value));

    const request = http.expectOne((req) => req.url === url);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.keys()).toEqual([]);
    request.flush([CAFE_BENEFIT_FIXTURE]);

    expect(benefits).toEqual([CAFE_BENEFIT_FIXTURE]);
  });

  it('sends the cafe and the type chosen as filters', () => {
    service.getAvailable('cafe-central', 'DOS_POR_UNO').subscribe();

    const request = http.expectOne((req) => req.url === url);
    expect(request.request.params.get('cafeId')).toBe('cafe-central');
    expect(request.request.params.get('type')).toBe('DOS_POR_UNO');
    request.flush([]);
  });
});
