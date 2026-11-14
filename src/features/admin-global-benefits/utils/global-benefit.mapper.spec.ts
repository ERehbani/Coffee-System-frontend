import { GlobalBenefitDto } from '../types/global-benefit.model';
import { toGlobalBenefit } from './global-benefit.mapper';

function benefitDto(benefitType?: string): GlobalBenefitDto {
  return {
    externalId: 'benefit-1',
    name: 'Beneficio',
    pointsCost: 300,
    status: true,
    isPublic: true,
    maxRedemptions: 100,
    description: 'Descripción',
    isGlobal: 'GLOBAL_BENEFIT',
    benefitType,
  };
}

describe('toGlobalBenefit', () => {
  it('reads the type from the benefitType field of the backend', () => {
    const types = ['CODIGO_DESCUENTO', 'DOS_POR_UNO', 'PRODUCTO_POR_PUNTOS', 'PRODUCTO_GRATIS_SOCIO'];

    expect(types.map((type) => toGlobalBenefit(benefitDto(type)).type)).toEqual(types);
  });

  it('falls back to a discount code when the backend sends no type', () => {
    expect(toGlobalBenefit(benefitDto()).type).toBe('CODIGO_DESCUENTO');
  });
});
