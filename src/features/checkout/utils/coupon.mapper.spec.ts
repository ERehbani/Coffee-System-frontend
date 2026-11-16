import {
  CHECKOUT_COUPON_DTOS_FIXTURE,
  DISCOUNT_COUPON_DTO,
  EXPIRED_COUPON_DTO,
  MEMBER_PRODUCT_COUPON_DTO,
  POINTS_PRODUCT_COUPON_DTO,
  TWO_FOR_ONE_COUPON_DTO,
  USED_COUPON_DTO,
} from './coupon.fixture';
import { toCheckoutCoupon, toCheckoutCoupons } from './coupon.mapper';

describe('toCheckoutCoupon', () => {
  it('maps the identity, the code and the cafe of a coupon', () => {
    const coupon = toCheckoutCoupon(DISCOUNT_COUPON_DTO);

    expect(coupon.id).toBe('coupon-discount');
    expect(coupon.validationCode).toBe('VLD-coupon-discount');
    expect(coupon.name).toBe('15% de descuento');
    expect(coupon.cafeId).toBe('cafe-central-001');
    expect(coupon.cafeName).toBe('Cafe Central');
    expect(coupon.isActive).toBe(true);
  });

  it('treats a coupon without cafe id as global and drops the placeholder cafe name', () => {
    const coupon = toCheckoutCoupon(MEMBER_PRODUCT_COUPON_DTO);

    expect(coupon.cafeId).toBeNull();
    expect(coupon.cafeName).toBeNull();
  });

  it('keeps a used coupon inactive', () => {
    expect(toCheckoutCoupon(USED_COUPON_DTO).isActive).toBe(false);
  });

  describe('benefit by type', () => {
    it.each([
      ['CODIGO_DESCUENTO', DISCOUNT_COUPON_DTO, { kind: 'percentage-discount', percentage: 15 }],
      [
        'DOS_POR_UNO',
        TWO_FOR_ONE_COUPON_DTO,
        {
          kind: 'two-for-one',
          product: { id: 'prod-central-001', name: 'Espresso Doble', price: 2800 },
        },
      ],
      [
        'PRODUCTO_POR_PUNTOS',
        POINTS_PRODUCT_COUPON_DTO,
        {
          kind: 'free-product',
          product: { id: 'prod-central-005', name: 'Cookie Red Velvet', price: 2500 },
        },
      ],
      [
        'PRODUCTO_GRATIS_SOCIO',
        MEMBER_PRODUCT_COUPON_DTO,
        {
          kind: 'free-product',
          product: { id: 'prod-central-004', name: 'Croissant de Almendras', price: 3400 },
        },
      ],
    ])('builds the benefit of %s', (_type, dto, expected) => {
      expect(toCheckoutCoupon(dto).benefit).toEqual(expected);
    });

    it('has no benefit for an unknown type', () => {
      const dto = { ...DISCOUNT_COUPON_DTO, benefitType: 'NUEVO_TIPO' };

      expect(toCheckoutCoupon(dto).benefit).toBeNull();
    });

    it('has no benefit when the type is missing', () => {
      const dto = { ...DISCOUNT_COUPON_DTO, benefitType: null };

      expect(toCheckoutCoupon(dto).benefit).toBeNull();
    });

    it('does not mistake an inherited object key for a type', () => {
      const dto = { ...DISCOUNT_COUPON_DTO, benefitType: 'constructor' };

      expect(toCheckoutCoupon(dto).benefit).toBeNull();
    });

    it('has no benefit when the data the type needs is missing', () => {
      const withoutPercentage = { ...DISCOUNT_COUPON_DTO, discountPercentage: null };
      const withoutProduct = { ...TWO_FOR_ONE_COUPON_DTO, productId: null };
      const withoutPrice = { ...MEMBER_PRODUCT_COUPON_DTO, productPrice: null };

      expect(toCheckoutCoupon(withoutPercentage).benefit).toBeNull();
      expect(toCheckoutCoupon(withoutProduct).benefit).toBeNull();
      expect(toCheckoutCoupon(withoutPrice).benefit).toBeNull();
    });
  });

  describe('expiration', () => {
    it('never expires without an expiration date', () => {
      expect(toCheckoutCoupon(TWO_FOR_ONE_COUPON_DTO).expiresAt).toBeNull();
    });

    it('lasts until the end of the calendar day', () => {
      const { expiresAt } = toCheckoutCoupon({ ...DISCOUNT_COUPON_DTO, expiresAt: '2026-11-13' });

      expect(expiresAt).toEqual(new Date(2026, 10, 13, 23, 59, 59, 999));
    });

    it('keeps the exact instant when the date comes with a time', () => {
      const { expiresAt } = toCheckoutCoupon({
        ...DISCOUNT_COUPON_DTO,
        expiresAt: '2026-11-13T18:30:00Z',
      });

      expect(expiresAt?.toISOString()).toBe('2026-11-13T18:30:00.000Z');
    });

    it('maps an expired coupon with a past date', () => {
      expect(toCheckoutCoupon(EXPIRED_COUPON_DTO).expiresAt?.getFullYear()).toBe(2020);
    });
  });
});

describe('toCheckoutCoupons', () => {
  it('maps the whole list keeping the order', () => {
    const coupons = toCheckoutCoupons(CHECKOUT_COUPON_DTOS_FIXTURE);

    expect(coupons.map((coupon) => coupon.id)).toEqual(
      CHECKOUT_COUPON_DTOS_FIXTURE.map((dto) => dto.externalId),
    );
  });
});
