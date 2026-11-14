import {
  COOKIE_FIXTURE as COOKIE,
  CROISSANT_FIXTURE as CROISSANT,
  ESPRESSO_FIXTURE as ESPRESSO,
} from '../../catalog/utils/product.fixture';
import { CheckoutCouponDto } from '../types/coupon.dto';
import { CHECKOUT_CAFE_FIXTURE } from './checkout.fixture';

export const OTHER_CAFE_ID = 'cafe-norte-002';

function baseCoupon(id: string, benefitName: string): CheckoutCouponDto {
  return {
    externalId: id,
    date: '2026-11-01T10:00:00',
    usedPoints: 100,
    state: true,
    validationCode: `VLD-${id}`,
    benefitName,
    cafeName: CHECKOUT_CAFE_FIXTURE.name,
    description: null,
    expiresAt: '2099-12-31',
    conditions: null,
    usedDate: null,
    cafeId: CHECKOUT_CAFE_FIXTURE.externalId,
    benefitType: null,
    discountPercentage: null,
    productId: null,
    productName: null,
    productPrice: null,
  };
}

export const DISCOUNT_COUPON_DTO: CheckoutCouponDto = {
  ...baseCoupon('coupon-discount', '15% de descuento'),
  benefitType: 'CODIGO_DESCUENTO',
  discountPercentage: 15,
};

export const TWO_FOR_ONE_COUPON_DTO: CheckoutCouponDto = {
  ...baseCoupon('coupon-two-for-one', '2x1 en Espresso Doble'),
  expiresAt: null,
  benefitType: 'DOS_POR_UNO',
  productId: ESPRESSO.externalId,
  productName: ESPRESSO.name,
  productPrice: ESPRESSO.price,
};

export const POINTS_PRODUCT_COUPON_DTO: CheckoutCouponDto = {
  ...baseCoupon('coupon-points-product', 'Cookie Red Velvet por puntos'),
  benefitType: 'PRODUCTO_POR_PUNTOS',
  productId: COOKIE.externalId,
  productName: COOKIE.name,
  productPrice: COOKIE.price,
};

export const MEMBER_PRODUCT_COUPON_DTO: CheckoutCouponDto = {
  ...baseCoupon('coupon-member-product', 'Croissant gratis para socios'),
  cafeName: 'Global',
  cafeId: null,
  benefitType: 'PRODUCTO_GRATIS_SOCIO',
  productId: CROISSANT.externalId,
  productName: CROISSANT.name,
  productPrice: CROISSANT.price,
};

export const OTHER_CAFE_COUPON_DTO: CheckoutCouponDto = {
  ...baseCoupon('coupon-other-cafe', '20% en Cafe Norte'),
  cafeName: 'Cafe Norte',
  cafeId: OTHER_CAFE_ID,
  benefitType: 'CODIGO_DESCUENTO',
  discountPercentage: 20,
};

export const USED_COUPON_DTO: CheckoutCouponDto = {
  ...baseCoupon('coupon-used', '10% ya usado'),
  state: false,
  usedDate: '2026-11-05T12:00:00',
  benefitType: 'CODIGO_DESCUENTO',
  discountPercentage: 10,
};

export const EXPIRED_COUPON_DTO: CheckoutCouponDto = {
  ...baseCoupon('coupon-expired', '25% vencido'),
  expiresAt: '2020-01-01',
  benefitType: 'CODIGO_DESCUENTO',
  discountPercentage: 25,
};

export const CHECKOUT_COUPON_DTOS_FIXTURE: readonly CheckoutCouponDto[] = [
  DISCOUNT_COUPON_DTO,
  TWO_FOR_ONE_COUPON_DTO,
  POINTS_PRODUCT_COUPON_DTO,
  MEMBER_PRODUCT_COUPON_DTO,
  OTHER_CAFE_COUPON_DTO,
  USED_COUPON_DTO,
  EXPIRED_COUPON_DTO,
];
