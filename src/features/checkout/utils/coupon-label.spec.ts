import { CouponBenefit } from '../types/coupon.model';
import { describeCouponReward } from './coupon-label';

const PRODUCT = { id: 'p', name: 'Cookie Red Velvet', price: 2500 };

describe('describeCouponReward', () => {
  it.each<[CouponBenefit, string]>([
    [{ kind: 'percentage-discount', percentage: 15 }, '15% de descuento'],
    [{ kind: 'percentage-discount', percentage: 12.5 }, '12,5% de descuento'],
    [{ kind: 'two-for-one', product: PRODUCT }, '2x1 en Cookie Red Velvet'],
    [{ kind: 'free-product', product: PRODUCT }, 'Cookie Red Velvet gratis'],
  ])('describes %j as "%s"', (benefit, label) => {
    expect(describeCouponReward(benefit)).toBe(label);
  });
});
