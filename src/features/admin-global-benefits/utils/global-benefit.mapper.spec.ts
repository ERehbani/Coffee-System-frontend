import { CreateGlobalBenefitInput, GlobalBenefitDto, GlobalBenefitType } from '../types/global-benefit.model';
import { toCreateRequestDto, toGlobalBenefit, toGlobalBenefitList } from './global-benefit.mapper';

function benefitDto(benefitType?: GlobalBenefitType, global = true): GlobalBenefitDto {
  return {
    externalId: 'benefit-1',
    name: 'Beneficio',
    pointsCost: 300,
    status: true,
    isPublic: true,
    maxRedemptions: 100,
    description: 'Descripción',
    global,
    benefitType,
  };
}

function input(type: GlobalBenefitType, extra: Partial<CreateGlobalBenefitInput> = {}): CreateGlobalBenefitInput {
  return {
    name: ' Medialuna gratis ',
    description: 'Para todos los socios',
    pointsCost: 200,
    type,
    tier: 'BRONCE',
    tierId: 'tier-bronce',
    startDate: '2026-11-15',
    endDate: '2026-12-15',
    maxRedemptions: 50,
    discountPercent: 20,
    status: true,
    isPublic: true,
    ...extra,
  };
}

describe('toGlobalBenefit', () => {
  it('reads the type from the benefitType field of the backend', () => {
    const types: GlobalBenefitType[] = ['CODIGO_DESCUENTO', 'DOS_POR_UNO', 'PRODUCTO_POR_PUNTOS', 'PRODUCTO_GRATIS_SOCIO'];

    expect(types.map((type) => toGlobalBenefit(benefitDto(type)).type)).toEqual(types);
  });

  it('falls back to a discount code when the backend sends no type', () => {
    expect(toGlobalBenefit(benefitDto()).type).toBe('CODIGO_DESCUENTO');
  });

  it('reads the redemptions, the discount and the product sent by the backend', () => {
    const benefit = toGlobalBenefit({
      ...benefitDto('PRODUCTO_POR_PUNTOS'),
      redeemedCount: 7,
      soldOut: true,
      discountPercentage: null,
      catalogProductId: 'catalog-medialuna',
      productName: 'Medialuna',
    });

    expect(benefit.currentRedemptions).toBe(7);
    expect(benefit.soldOut).toBe(true);
    expect(benefit.discountPercent).toBeUndefined();
    expect(benefit.catalogProductId).toBe('catalog-medialuna');
    expect(benefit.productName).toBe('Medialuna');
  });

  it('keeps only the global benefits of the list', () => {
    const list = toGlobalBenefitList([benefitDto('DOS_POR_UNO'), { ...benefitDto('DOS_POR_UNO', false), externalId: 'cafe-1' }]);

    expect(list.map((benefit) => benefit.id)).toEqual(['benefit-1']);
  });
});

describe('toCreateRequestDto', () => {
  it('sends the type and the discount of a discount code', () => {
    const dto = toCreateRequestDto(input('CODIGO_DESCUENTO', { catalogProductId: 'ignored' }));

    expect(dto.type).toBe('CODIGO_DESCUENTO');
    expect(dto.discountPercentage).toBe(20);
    expect(dto.catalogProductId).toBeNull();
    expect(dto.description).toBe('Para todos los socios');
  });

  it('sends the catalog product of a product benefit and no discount', () => {
    const dto = toCreateRequestDto(input('PRODUCTO_POR_PUNTOS', { catalogProductId: 'catalog-medialuna' }));

    expect(dto.name).toBe('Medialuna gratis');
    expect(dto.catalogProductId).toBe('catalog-medialuna');
    expect(dto.discountPercentage).toBeNull();
    expect(dto.tierId).toBe('tier-bronce');
    expect(dto.cafeId).toBeNull();
  });
});
