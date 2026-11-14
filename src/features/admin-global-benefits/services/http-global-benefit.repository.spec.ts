import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CatalogProductOption, CreateGlobalBenefitInput } from '../types/global-benefit.model';
import { HttpGlobalBenefitRepository } from './http-global-benefit.repository';

describe('HttpGlobalBenefitRepository', () => {
  let repository: HttpGlobalBenefitRepository;
  let http: HttpTestingController;
  const benefitsUrl = `${environment.apiBaseUrl}/benefits`;

  const input: CreateGlobalBenefitInput = {
    name: 'Latte gratis',
    description: 'Un latte para socios plata',
    pointsCost: 300,
    type: 'PRODUCTO_POR_PUNTOS',
    tier: 'PLATA',
    startDate: '2026-11-15',
    endDate: '2026-12-15',
    maxRedemptions: 20,
    catalogProductId: 'catalog-latte',
    status: true,
    isPublic: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), HttpGlobalBenefitRepository],
    });
    repository = TestBed.inject(HttpGlobalBenefitRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists only the active products of the general catalog', () => {
    let products: readonly CatalogProductOption[] | undefined;
    repository.getCatalogProducts().subscribe((value) => (products = value));

    http.expectOne(`${environment.apiBaseUrl}/catalog-products`).flush([
      { externalId: 'catalog-latte', name: 'Latte', active: true },
      { externalId: 'catalog-old', name: 'Viejo', active: false },
    ]);

    expect(products).toEqual([{ id: 'catalog-latte', name: 'Latte' }]);
  });

  it('resolves the tier and creates the benefit with its type and catalog product', () => {
    repository.createGlobalBenefit(input).subscribe();

    http.expectOne(`${environment.apiBaseUrl}/tiers`).flush([
      { externalId: 'tier-bronce', name: 'BRONCE' },
      { externalId: 'tier-plata', name: 'PLATA' },
    ]);
    const create = http.expectOne(benefitsUrl);
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(
      expect.objectContaining({
        type: 'PRODUCTO_POR_PUNTOS',
        catalogProductId: 'catalog-latte',
        discountPercentage: null,
        tierId: 'tier-plata',
      }),
    );
    create.flush({ ...input, externalId: 'benefit-1', global: true, benefitType: 'PRODUCTO_POR_PUNTOS' });
  });

  it('does not ask for the tiers when the benefit already has a real tier id', () => {
    repository.updateGlobalBenefit({ ...input, id: 'benefit-1', tierId: 'tier-plata' }).subscribe();

    const update = http.expectOne(`${benefitsUrl}/benefit-1`);
    expect(update.request.method).toBe('PUT');
    expect(update.request.body.tierId).toBe('tier-plata');
    update.flush({ ...input, externalId: 'benefit-1', global: true, benefitType: 'PRODUCTO_POR_PUNTOS' });
  });
});
