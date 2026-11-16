import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Tier } from '../types/tier.model';
import { HttpTierRepository } from './http-tier.repository';

describe('HttpTierRepository', () => {
  const url = `${environment.apiBaseUrl}/tiers`;
  let repository: HttpTierRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpTierRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repository = TestBed.inject(HttpTierRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getTiers requests GET /tiers and maps the list sorted by points', () => {
    let tiers: readonly Tier[] | undefined;
    repository.getTiers().subscribe((value) => (tiers = value));

    const request = http.expectOne(url);
    expect(request.request.method).toBe('GET');
    request.flush([
      { externalId: 'b', name: 'ORO', minPoints: 3000 },
      { externalId: 'a', name: 'BRONCE', minPoints: 0 },
    ]);

    expect(tiers).toEqual([
      { id: 'a', name: 'BRONCE', minPoints: 0 },
      { id: 'b', name: 'ORO', minPoints: 3000 },
    ]);
  });

  it('createTier posts the trimmed name and the points', () => {
    let created: Tier | undefined;
    repository.createTier({ name: ' Platino ', minPoints: 5000 }).subscribe((v) => (created = v));

    const request = http.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ name: 'Platino', minPoints: 5000 });
    request.flush({ externalId: 'new-1', name: 'Platino', minPoints: 5000 });

    expect(created).toEqual({ id: 'new-1', name: 'Platino', minPoints: 5000 });
  });

  it('updateTier puts the body on the tier external id', () => {
    let updated: Tier | undefined;
    repository
      .updateTier('tier-9', { name: 'Oro', minPoints: 3500 })
      .subscribe((v) => (updated = v));

    const request = http.expectOne(`${url}/tier-9`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ name: 'Oro', minPoints: 3500 });
    request.flush({ externalId: 'tier-9', name: 'Oro', minPoints: 3500 });

    expect(updated).toEqual({ id: 'tier-9', name: 'Oro', minPoints: 3500 });
  });

  it('lets the HTTP error reach the caller untouched', () => {
    let failure: unknown;
    repository.createTier({ name: 'Oro', minPoints: 1 }).subscribe({ error: (e) => (failure = e) });

    http
      .expectOne(url)
      .flush('A tier named Oro already exists', { status: 409, statusText: 'Conflict' });

    expect(failure).toBeInstanceOf(HttpErrorResponse);
    expect((failure as HttpErrorResponse).status).toBe(409);
  });
});
