import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Redemption } from '../model/redemption.model';
import { READY_REDEMPTION_FIXTURE } from '../utils/redemption.fixture';
import { RedemptionService } from './redemption.service';

describe('RedemptionService', () => {
  let service: RedemptionService;
  let http: HttpTestingController;
  const url = `${environment.apiBaseUrl}/redemption/redemption-001`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RedemptionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('asks the backend for the redemption', () => {
    let redemption: Redemption | undefined;
    service.getById('redemption-001').subscribe((value) => (redemption = value));

    const request = http.expectOne(url);
    expect(request.request.method).toBe('GET');
    request.flush(READY_REDEMPTION_FIXTURE);

    expect(redemption).toEqual(READY_REDEMPTION_FIXTURE);
  });

  it('answers with no redemption when the backend does not find it', () => {
    let answered = false;
    let redemption: Redemption | undefined;
    service.getById('redemption-001').subscribe((value) => {
      answered = true;
      redemption = value;
    });

    http.expectOne(url).flush('Redemption not found', { status: 404, statusText: 'Not Found' });

    expect(answered).toBe(true);
    expect(redemption).toBeUndefined();
  });

  it('propagates any other failure so the page can offer to retry', () => {
    let status: number | undefined;
    service.getById('redemption-001').subscribe({ error: (error) => (status = error.status) });

    http.expectOne(url).flush('error', { status: 500, statusText: 'Server Error' });

    expect(status).toBe(500);
  });
});
