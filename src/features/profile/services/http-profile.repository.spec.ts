import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { HttpProfileRepository } from './http-profile.repository';

describe('HttpProfileRepository', () => {
  let repository: HttpProfileRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpProfileRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repository = TestBed.inject(HttpProfileRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getUsedBenefits requests redemptions with state=false', () => {
    repository.getUsedBenefits().subscribe();

    const request = http.expectOne((req) => req.url === `${environment.apiBaseUrl}/redemption`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('state')).toBe('false');
    request.flush([]);
  });
});
