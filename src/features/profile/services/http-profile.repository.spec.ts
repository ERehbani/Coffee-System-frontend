import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import {
  ProfileDashboard,
  RedeemedBenefit,
  SavedClientProfile,
  TierBenefit,
  TierDetail,
} from '../types/profile.model';
import { buildProfileDashboardFixture, buildTierDetailFixture } from '../utils/profile.fixture';
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

  it('getDashboard requests the dashboard of the signed-in client and maps it', () => {
    let dashboard: ProfileDashboard | undefined;
    repository.getDashboard().subscribe((value) => (dashboard = value));

    const request = http.expectOne(`${environment.apiBaseUrl}/clients/me/dashboard`);
    expect(request.request.method).toBe('GET');
    request.flush(buildProfileDashboardFixture(new Date()));

    expect(dashboard?.profile).toEqual({
      id: 'client-001',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@example.com',
      phoneNumber: '1145238890',
      avatarUrl: expect.stringContaining('https://'),
    });
    expect(dashboard?.loyalty.tier).toBe('silver');
    expect(dashboard?.activeRedemptions.length).toBe(2);
  });

  it('getDashboard keeps a tier created by the admin instead of failing', () => {
    const dto = buildProfileDashboardFixture(new Date());
    let dashboard: ProfileDashboard | undefined;
    repository.getDashboard().subscribe((value) => (dashboard = value));

    http
      .expectOne(`${environment.apiBaseUrl}/clients/me/dashboard`)
      .flush({ ...dto, loyalty: { ...dto.loyalty, tier: 'Platino', nextTier: null } });

    expect(dashboard?.loyalty.tier).toBe('Platino');
  });

  it('updateProfile sends the field names of the backend, without the email', () => {
    repository
      .updateProfile('client-001', {
        firstName: 'Mateo',
        lastName: 'Gómez',
        phoneNumber: '1199887766',
        avatarUrl: 'https://example.com/avatar.jpg',
      })
      .subscribe();

    const request = http.expectOne(`${environment.apiBaseUrl}/clients/client-001`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      name: 'Mateo',
      lastName: 'Gómez',
      phone: '1199887766',
      profilePhoto: 'https://example.com/avatar.jpg',
    });
    request.flush({});
  });

  it('updateProfile maps the client the backend returns', () => {
    let saved: SavedClientProfile | undefined;
    repository
      .updateProfile('client-001', {
        firstName: 'Mateo',
        lastName: 'Gómez',
        phoneNumber: '1199887766',
        avatarUrl: null,
      })
      .subscribe((value) => (saved = value));

    http.expectOne(`${environment.apiBaseUrl}/clients/client-001`).flush({
      externalId: 'client-001',
      name: 'Mateo',
      lastName: 'Gómez',
      phone: '1199887766',
      profilePhoto: '',
      currentPoints: 850,
      historicalPoints: 1420,
      tierName: 'PLATA',
      state: true,
    });

    expect(saved).toEqual({
      id: 'client-001',
      firstName: 'Mateo',
      lastName: 'Gómez',
      phoneNumber: '1199887766',
      avatarUrl: null,
    });
  });

  it('updateProfile propagates a backend rejection', () => {
    let status: number | undefined;
    repository
      .updateProfile('client-001', {
        firstName: 'Mateo',
        lastName: 'Gómez',
        phoneNumber: '1199887766',
        avatarUrl: null,
      })
      .subscribe({ error: (error) => (status = error.status) });

    http
      .expectOne(`${environment.apiBaseUrl}/clients/client-001`)
      .flush({ error: 'Access denied' }, { status: 403, statusText: 'Forbidden' });

    expect(status).toBe(403);
  });

  it('getUsedBenefits requests redemptions with state=false', () => {
    repository.getUsedBenefits().subscribe();

    const request = http.expectOne((req) => req.url === `${environment.apiBaseUrl}/redemption`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('state')).toBe('false');
    request.flush([]);
  });

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
      cafeName: 'Global',
      cafeId: null,
    });

    expect(redeemed?.id).toBe('redemption-9');
    expect(redeemed?.cafeName).toBeNull();
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
