import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Cafe, CreateCafeAccountRequest } from '../model/cafe.model';
import { CAFE_CENTRAL_FIXTURE, CAFES_FIXTURE } from '../utils/cafe.fixture';
import { CafeService } from './cafe.service';

describe('CafeService', () => {
  let service: CafeService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CafeService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CafeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('getAll() pide las cafeterías al backend', () => {
    let cafes: Cafe[] | undefined;
    service.getAll().subscribe((value) => (cafes = value));

    const req = http.expectOne(`${environment.apiBaseUrl}/cafes`);
    expect(req.request.method).toBe('GET');
    req.flush(CAFES_FIXTURE);

    expect(cafes).toEqual(CAFES_FIXTURE);
  });

  it('getByExternalId() pide la cafetería por su id', () => {
    let cafe: Cafe | undefined;
    service.getByExternalId('cafe-central-001').subscribe((value) => (cafe = value));

    const req = http.expectOne(`${environment.apiBaseUrl}/cafes/cafe-central-001`);
    expect(req.request.method).toBe('GET');
    req.flush(CAFE_CENTRAL_FIXTURE);

    expect(cafe).toEqual(CAFE_CENTRAL_FIXTURE);
  });

  it('register() hace POST a ${environment.apiBaseUrl}/cafes/register y el body no tiene phoneNumber: \'\' si viene vacío', () => {
    const request: CreateCafeAccountRequest = {
      email: 'cafe@test.com',
      password: 'Password123',
      name: 'Café Test',
      address: 'Calle Falsa 123',
      phoneNumber: null,
      schedule: null,
      description: null,
    };

    service.register(request).subscribe();

    const req = http.expectOne(`${environment.apiBaseUrl}/cafes/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.phoneNumber).not.toBe('');
    expect(req.request.body.phoneNumber).toBeNull();
    req.flush({
      externalId: 'cafe-123',
      email: 'cafe@test.com',
      state: true,
    });
  });
});
