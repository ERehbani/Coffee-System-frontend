import { ValidatedCoupon } from '../types/coupon-validation.model';
import { toRewardLabel } from './coupon-reward';

const coupon: ValidatedCoupon = {
  id: 'redemption-1',
  code: 'code-1',
  benefitName: 'Beneficio',
  description: null,
  conditions: [],
  benefitType: null,
  discountPercentage: null,
  productName: null,
  productPrice: null,
  usedAt: null,
};

describe('toRewardLabel', () => {
  it('shows the percentage of a discount coupon', () => {
    expect(
      toRewardLabel({ ...coupon, benefitType: 'CODIGO_DESCUENTO', discountPercentage: 15 }),
    ).toBe('15% de descuento');
  });

  it('formats a fractional percentage with the es-AR separator', () => {
    expect(
      toRewardLabel({ ...coupon, benefitType: 'CODIGO_DESCUENTO', discountPercentage: 12.5 }),
    ).toBe('12,5% de descuento');
  });

  it('names the product of a 2x1, a product for points and a free product', () => {
    const withProduct = { ...coupon, productName: 'Medialuna' };

    expect(toRewardLabel({ ...withProduct, benefitType: 'DOS_POR_UNO' })).toBe('2x1 en Medialuna');
    expect(toRewardLabel({ ...withProduct, benefitType: 'PRODUCTO_POR_PUNTOS' })).toBe('Medialuna');
    expect(toRewardLabel({ ...withProduct, benefitType: 'PRODUCTO_GRATIS_SOCIO' })).toBe(
      'Medialuna gratis',
    );
  });

  it('falls back to the kind of benefit when the backend sends no detail', () => {
    expect(toRewardLabel({ ...coupon, benefitType: 'CODIGO_DESCUENTO' })).toBe('Descuento');
    expect(toRewardLabel({ ...coupon, benefitType: 'DOS_POR_UNO' })).toBe('2x1');
    expect(toRewardLabel({ ...coupon, benefitType: 'PRODUCTO_POR_PUNTOS' })).toBe(
      'Producto canjeado con puntos',
    );
    expect(toRewardLabel({ ...coupon, benefitType: 'PRODUCTO_GRATIS_SOCIO' })).toBe(
      'Producto gratis',
    );
  });

  it('has nothing to add for a benefit without type', () => {
    expect(toRewardLabel(coupon)).toBeNull();
  });
});
