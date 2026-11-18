import { CheckoutSummary, ServerCart } from '../types/checkout.model';
import { ApplicableCoupon, CheckoutCoupon, CouponProduct } from '../types/coupon.model';

function cartProductOf(
  catalogProductId: string,
  summary: CheckoutSummary,
  cart: ServerCart | null,
): CouponProduct | null {
  // El carrito local no conoce los productos del catálogo; el del backend sí, por id de producto.
  const productId = cart?.lines.find((line) => line.catalogProductId === catalogProductId)?.productId;
  const line = summary.lines.find((candidate) => candidate.productId === productId);
  return line ? { id: line.productId, name: line.productName, price: line.unitPrice } : null;
}

// Atajo: no se ofrecen los regalos de productos que no están en el carrito; cargar los productos de la cafetería si deben verse.
export function withCartProducts(
  coupons: readonly CheckoutCoupon[],
  summary: CheckoutSummary,
  cart: ServerCart | null,
): readonly CheckoutCoupon[] {
  return coupons.map((coupon) => {
    const target = coupon.catalogBenefit;
    const product = target && cartProductOf(target.catalogProductId, summary, cart);
    return target && product ? { ...coupon, benefit: { kind: target.kind, product } } : coupon;
  });
}

function isExpired(coupon: CheckoutCoupon, now: Date): boolean {
  return coupon.expiresAt !== null && coupon.expiresAt.getTime() < now.getTime();
}

function isValidInCafe(coupon: CheckoutCoupon, cafeId: string): boolean {
  return coupon.cafeId === null || coupon.cafeId === cafeId;
}

export function isCouponApplicable(
  coupon: CheckoutCoupon,
  cafeId: string,
  now: Date,
): coupon is ApplicableCoupon {
  return (
    coupon.isActive &&
    coupon.benefit !== null &&
    !isExpired(coupon, now) &&
    isValidInCafe(coupon, cafeId)
  );
}

export function findApplicableCoupons(
  coupons: readonly CheckoutCoupon[],
  cafeId: string,
  now: Date,
): readonly ApplicableCoupon[] {
  return coupons.filter((coupon): coupon is ApplicableCoupon =>
    isCouponApplicable(coupon, cafeId, now),
  );
}
