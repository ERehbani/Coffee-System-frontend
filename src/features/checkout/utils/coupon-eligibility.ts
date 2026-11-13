import { ApplicableCoupon, CheckoutCoupon } from '../types/coupon.model';

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
