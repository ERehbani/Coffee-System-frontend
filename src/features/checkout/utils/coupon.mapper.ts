import { CheckoutCouponDto } from '../types/coupon.dto';
import { CheckoutCoupon, CouponBenefit, CouponProduct } from '../types/coupon.model';

const CALENDAR_DAY = /^\d{4}-\d{2}-\d{2}$/;

function toProduct(dto: CheckoutCouponDto): CouponProduct | null {
  if (dto.productId === null || dto.productName === null || dto.productPrice === null) {
    return null;
  }
  return { id: dto.productId, name: dto.productName, price: dto.productPrice };
}

function toPercentageDiscount(dto: CheckoutCouponDto): CouponBenefit | null {
  if (dto.discountPercentage === null) {
    return null;
  }
  return { kind: 'percentage-discount', percentage: dto.discountPercentage };
}

function toTwoForOne(dto: CheckoutCouponDto): CouponBenefit | null {
  const product = toProduct(dto);
  return product && { kind: 'two-for-one', product };
}

function toFreeProduct(dto: CheckoutCouponDto): CouponBenefit | null {
  const product = toProduct(dto);
  return product && { kind: 'free-product', product };
}

const BENEFIT_BUILDERS: ReadonlyMap<string, (dto: CheckoutCouponDto) => CouponBenefit | null> =
  new Map([
    ['CODIGO_DESCUENTO', toPercentageDiscount],
    ['DOS_POR_UNO', toTwoForOne],
    ['PRODUCTO_POR_PUNTOS', toFreeProduct],
    ['PRODUCTO_GRATIS_SOCIO', toFreeProduct],
  ]);

function toBenefit(dto: CheckoutCouponDto): CouponBenefit | null {
  const build = dto.benefitType === null ? undefined : BENEFIT_BUILDERS.get(dto.benefitType);
  return build ? build(dto) : null;
}

function toExpirationDate(value: string | null): Date | null {
  if (value === null) {
    return null;
  }
  if (!CALENDAR_DAY.test(value)) {
    return new Date(value);
  }
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
}

export function toCheckoutCoupon(dto: CheckoutCouponDto): CheckoutCoupon {
  return {
    id: dto.externalId,
    validationCode: dto.validationCode,
    name: dto.benefitName,
    cafeId: dto.cafeId,
    cafeName: dto.cafeId === null ? null : dto.cafeName,
    expiresAt: toExpirationDate(dto.expiresAt),
    isActive: dto.state,
    benefit: toBenefit(dto),
  };
}

export function toCheckoutCoupons(dtos: readonly CheckoutCouponDto[]): readonly CheckoutCoupon[] {
  return dtos.map(toCheckoutCoupon);
}
