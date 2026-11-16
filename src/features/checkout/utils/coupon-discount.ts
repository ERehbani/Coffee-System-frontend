import { CheckoutLine, CheckoutSummary } from '../types/checkout.model';
import {
  ApplicableCoupon,
  CouponBenefit,
  CouponEffect,
  CouponPreview,
  CouponProduct,
} from '../types/coupon.model';

const NO_DISCOUNT = 0;

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function percentageDiscount(subtotal: number, percentage: number): number {
  const validPercentage = Math.min(Math.max(percentage, 0), 100);
  const total = roundMoney(subtotal * (1 - validPercentage / 100));
  return roundMoney(subtotal - total);
}

function twoForOneDiscount(lines: readonly CheckoutLine[], product: CouponProduct): number {
  const freeUnits = lines
    .filter((line) => line.productId === product.id)
    .reduce((units, line) => units + Math.floor(line.quantity / 2), 0);
  return roundMoney(product.price * freeUnits);
}

export function calculateCouponEffect(
  benefit: CouponBenefit,
  summary: CheckoutSummary,
): CouponEffect {
  switch (benefit.kind) {
    case 'percentage-discount':
      return { discount: percentageDiscount(summary.total, benefit.percentage), gift: null };
    case 'two-for-one':
      return { discount: twoForOneDiscount(summary.lines, benefit.product), gift: null };
    case 'free-product':
      return { discount: NO_DISCOUNT, gift: benefit.product };
  }
}

export function toCouponPreview(coupon: ApplicableCoupon, summary: CheckoutSummary): CouponPreview {
  const effect = calculateCouponEffect(coupon.benefit, summary);
  const discount = Math.min(effect.discount, summary.total);
  return {
    couponName: coupon.name,
    subtotal: summary.total,
    discount,
    gift: effect.gift,
    total: roundMoney(summary.total - discount),
  };
}
