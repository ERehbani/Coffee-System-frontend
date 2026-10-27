import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { buildTierDetailFixture } from '../utils/profile.fixture';
import { RedeemedBenefit, TierBenefit, TierDetail } from '../types/profile.model';
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

  it('getTierDetail maps the available points and the Spanish tier names', () => {
    let detail: TierDetail | undefined;
    repository.getTierDetail().subscribe((value) => (detail = value));

    const request = http.expectOne(`${environment.apiBaseUrl}/clients/me/tier`);
    expect(request.request.method).toBe('GET');
    request.flush({ ...buildTierDetailFixture(), tier: 'PLATA', availablePoints: 820 });

    expect(detail?.availablePoints).toBe(820);
    expect(detail?.tier).toBe('silver');
  });

  it('getTierBenefits requests the benefits enabled for the client and maps them', () => {
    let benefits: readonly TierBenefit[] | undefined;
    repository.getTierBenefits().subscribe((value) => (benefits = value));

    const request = http.expectOne(`${environment.apiBaseUrl}/clients/me/benefits`);
    expect(request.request.method).toBe('GET');
    request.flush([
      {
        externalId: 'benefit-1',
        name: 'Café de cortesía',
        description: 'Un café a elección',
        pointsCost: 300,
        endDate: null,
        cafeName: null,
        tierName: 'BRONCE',
        benefitType: 'PRODUCTO_GRATIS_SOCIO',
      },
    ]);

    expect(benefits).toEqual([
      {
        id: 'benefit-1',
        name: 'Café de cortesía',
        description: 'Un café a elección',
        pointsCost: 300,
        expiresAt: null,
        cafeName: null,
        tier: 'bronze',
      },
    ]);
  });

  it('redeemBenefit posts the benefit id and maps the validation code', () => {
    let redeemed: RedeemedBenefit | undefined;
    repository.redeemBenefit('benefit-1').subscribe((value) => (redeemed = value));

    const request = http.expectOne(`${environment.apiBaseUrl}/redemption`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ benefitId: 'benefit-1' });
    request.flush({
      externalId: 'redemption-9',
      date: '2026-10-26T09:30:00',
      usedPoints: 300,
      state: true,
      validationCode: 'VLD-0009-ABCD',
      benefitName: 'Café de cortesía',
      cafeName: null,
    });

    expect(redeemed?.id).toBe('redemption-9');
    expect(redeemed?.validationCode).toBe('VLD-0009-ABCD');
    expect(redeemed?.usedPoints).toBe(300);
  });

  it('redeemBenefit propagates a backend rejection', () => {
    let status: number | undefined;
    repository.redeemBenefit('benefit-1').subscribe({ error: (error) => (status = error.status) });

    http
      .expectOne(`${environment.apiBaseUrl}/redemption`)
      .flush({ message: 'Puntos insuficientes' }, { status: 400, statusText: 'Bad Request' });

    expect(status).toBe(400);
  });
});
