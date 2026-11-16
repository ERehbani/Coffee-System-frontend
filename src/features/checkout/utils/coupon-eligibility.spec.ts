import { CheckoutCoupon } from '../types/coupon.model';
import { findApplicableCoupons, isCouponApplicable } from './coupon-eligibility';
import {
  CHECKOUT_COUPON_DTOS_FIXTURE,
  DISCOUNT_COUPON_DTO,
  EXPIRED_COUPON_DTO,
  OTHER_CAFE_COUPON_DTO,
  USED_COUPON_DTO,
} from './coupon.fixture';
import { toCheckoutCoupon, toCheckoutCoupons } from './coupon.mapper';

const CAFE_ID = 'cafe-central-001';
const NOW = new Date(2026, 10, 13, 12, 0, 0);

function couponOf(overrides: Partial<CheckoutCoupon>): CheckoutCoupon {
  return { ...toCheckoutCoupon(DISCOUNT_COUPON_DTO), ...overrides };
}

describe('isCouponApplicable', () => {
  it('accepts an active coupon of the cafe that has not expired', () => {
    expect(isCouponApplicable(toCheckoutCoupon(DISCOUNT_COUPON_DTO), CAFE_ID, NOW)).toBe(true);
  });

  it('accepts a global coupon in any cafe', () => {
    const global = couponOf({ cafeId: null, cafeName: null });

    expect(isCouponApplicable(global, 'another-cafe', NOW)).toBe(true);
  });

  it('rejects a coupon of another cafe', () => {
    expect(isCouponApplicable(toCheckoutCoupon(OTHER_CAFE_COUPON_DTO), CAFE_ID, NOW)).toBe(false);
  });

  it('rejects a coupon that was already used', () => {
    expect(isCouponApplicable(toCheckoutCoupon(USED_COUPON_DTO), CAFE_ID, NOW)).toBe(false);
  });

  it('rejects an expired coupon', () => {
    expect(isCouponApplicable(toCheckoutCoupon(EXPIRED_COUPON_DTO), CAFE_ID, NOW)).toBe(false);
  });

  it('still accepts a coupon on the last day it is valid', () => {
    const lastDay = couponOf({ expiresAt: new Date(2026, 10, 13, 23, 59, 59, 999) });

    expect(isCouponApplicable(lastDay, CAFE_ID, NOW)).toBe(true);
  });

  it('rejects a coupon the moment after it expires', () => {
    const expired = couponOf({ expiresAt: new Date(2026, 10, 13, 11, 59, 59, 999) });

    expect(isCouponApplicable(expired, CAFE_ID, NOW)).toBe(false);
  });

  it('rejects a coupon of a type that cannot be applied to a purchase', () => {
    expect(isCouponApplicable(couponOf({ benefit: null }), CAFE_ID, NOW)).toBe(false);
  });
});

describe('findApplicableCoupons', () => {
  it('keeps only the coupons that can be used in this purchase, in the same order', () => {
    const coupons = toCheckoutCoupons(CHECKOUT_COUPON_DTOS_FIXTURE);

    const applicable = findApplicableCoupons(coupons, CAFE_ID, NOW);

    expect(applicable.map((coupon) => coupon.id)).toEqual([
      'coupon-discount',
      'coupon-two-for-one',
      'coupon-points-product',
      'coupon-member-product',
    ]);
  });

  it('returns nothing when there are no coupons', () => {
    expect(findApplicableCoupons([], CAFE_ID, NOW)).toEqual([]);
  });
});
