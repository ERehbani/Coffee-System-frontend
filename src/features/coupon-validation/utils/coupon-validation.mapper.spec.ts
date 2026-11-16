import { RedemptionResponseDto } from '../types/coupon-validation.dto';
import { toValidatedCoupon } from './coupon-validation.mapper';

const dto: RedemptionResponseDto = {
  externalId: 'redemption-1',
  date: '2026-11-10T10:30:00',
  usedPoints: 300,
  state: false,
  validationCode: '3f2b8c1e-9d4a-4c7b-8e21-5a6f0d9b7c34',
  benefitName: '2x1 en medialunas',
  cafeName: 'Café Central',
  description: '  Llevá dos y pagá una ',
  expiresAt: '2026-12-31',
  conditions: 'Un solo uso por cliente.\n\n  No acumulable.  \n',
  usedDate: '2026-11-13T11:42:07.123456',
  cafeId: 'cafe-central-001',
  benefitType: 'DOS_POR_UNO',
  discountPercentage: null,
  productId: 'product-1',
  productName: ' Medialuna ',
  productPrice: 1200,
};

describe('toValidatedCoupon', () => {
  it('keeps what the cafe needs to hand over the benefit', () => {
    expect(toValidatedCoupon(dto)).toEqual({
      id: 'redemption-1',
      code: '3f2b8c1e-9d4a-4c7b-8e21-5a6f0d9b7c34',
      benefitName: '2x1 en medialunas',
      description: 'Llevá dos y pagá una',
      conditions: ['Un solo uso por cliente.', 'No acumulable.'],
      benefitType: 'DOS_POR_UNO',
      discountPercentage: null,
      productName: 'Medialuna',
      productPrice: 1200,
      usedAt: '2026-11-13T11:42:07.123456',
    });
  });

  it('keeps the discount of a discount coupon', () => {
    const coupon = toValidatedCoupon({
      ...dto,
      benefitType: 'CODIGO_DESCUENTO',
      discountPercentage: 15,
      productName: null,
      productPrice: null,
    });

    expect(coupon.benefitType).toBe('CODIGO_DESCUENTO');
    expect(coupon.discountPercentage).toBe(15);
    expect(coupon.productName).toBeNull();
    expect(coupon.productPrice).toBeNull();
  });

  it('leaves empty texts and a benefit without type as null', () => {
    const coupon = toValidatedCoupon({
      ...dto,
      description: '   ',
      conditions: null,
      benefitType: null,
      productName: '',
      usedDate: null,
    });

    expect(coupon.description).toBeNull();
    expect(coupon.conditions).toEqual([]);
    expect(coupon.benefitType).toBeNull();
    expect(coupon.productName).toBeNull();
    expect(coupon.usedAt).toBeNull();
  });

  it('ignores a benefit type the front does not know yet', () => {
    expect(toValidatedCoupon({ ...dto, benefitType: 'NUEVO_TIPO' }).benefitType).toBeNull();
  });
});
