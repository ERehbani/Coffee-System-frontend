import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CreateCafeAccountRequest } from '../model/cafe.model';
import { CafeService } from './cafe.service';

describe('CafeService', () => {
  let service: CafeService;
  let http: HttpTestingController;
  const originalUseMockApi = environment.useMockApi;

  beforeEach(() => {
    environment.useMockApi = false;
    TestBed.configureTestingModule({
      providers: [CafeService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CafeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    environment.useMockApi = originalUseMockApi;
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

