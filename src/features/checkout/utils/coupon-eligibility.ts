import { CheckoutSummary, ServerCart } from '../types/checkout.model';
import { ApplicableCoupon, CheckoutCoupon, CouponProduct } from '../types/coupon.model';

/** The cart line whose product is the catalog product, priced as the cart shows it. */
function cartProductOf(
  catalogProductId: string,
  summary: CheckoutSummary,
  cart: ServerCart | null,
): CouponProduct | null {
  // The local cart does not know catalog products; the backend cart does, by product id.
  const productId = cart?.lines.find((line) => line.catalogProductId === catalogProductId)?.productId;
  const line = summary.lines.find((candidate) => candidate.productId === productId);
  return line ? { id: line.productId, name: line.productName, price: line.unitPrice } : null;
}

/**
 * Turns each global product coupon into a coupon of the matching cart line, the rule the backend
 * checkout uses; without a matching line it keeps no benefit and is not offered.
 * shortcut: the backend also gifts a free product of the cafe that is not in the cart, but only a
 * cart line tells which cafe product it is; load the cafe products if those coupons must show too.
 */
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
