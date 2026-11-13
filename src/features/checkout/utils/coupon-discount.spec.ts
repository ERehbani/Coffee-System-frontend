import { CheckoutLine, CheckoutSummary } from '../types/checkout.model';
import { ApplicableCoupon, CouponBenefit, CouponProduct } from '../types/coupon.model';
import { calculateCouponEffect, toCouponPreview } from './coupon-discount';

const ESPRESSO: CouponProduct = { id: 'espresso', name: 'Espresso', price: 2800 };
const COOKIE: CouponProduct = { id: 'cookie', name: 'Cookie', price: 2500 };

function lineOf(product: CouponProduct, quantity: number): CheckoutLine {
  return {
    productId: product.id,
    productName: product.name,
    quantity,
    unitPrice: product.price,
    subtotal: product.price * quantity,
  };
}

function summaryOf(...lines: CheckoutLine[]): CheckoutSummary {
  return {
    cafeId: 'cafe',
    cafeName: 'Cafe',
    lines,
    total: lines.reduce((total, line) => total + line.subtotal, 0),
  };
}

function couponOf(benefit: CouponBenefit): ApplicableCoupon {
  return {
    id: 'coupon',
    validationCode: 'VLD',
    name: 'Cupón de prueba',
    cafeId: 'cafe',
    cafeName: 'Cafe',
    expiresAt: null,
    isActive: true,
    benefit,
  };
}

describe('calculateCouponEffect', () => {
  describe('percentage discount', () => {
    it.each([
      [15, 9200, 1380],
      [10, 9200, 920],
      [100, 9200, 9200],
      [0, 9200, 0],
      [33.33, 1000, 333.3],
      [12.5, 999, 124.87],
    ])('takes %s%% off a %s subtotal giving a %s discount', (percentage, price, discount) => {
      const summary = summaryOf(lineOf({ id: 'any', name: 'Any', price }, 1));

      const effect = calculateCouponEffect({ kind: 'percentage-discount', percentage }, summary);

      expect(effect).toEqual({ discount, gift: null });
    });

    it('never discounts more than the subtotal when the percentage is above 100', () => {
      const summary = summaryOf(lineOf(ESPRESSO, 1));

      const effect = calculateCouponEffect(
        { kind: 'percentage-discount', percentage: 150 },
        summary,
      );

      expect(effect.discount).toBe(2800);
    });

    it('gives no discount for a negative percentage', () => {
      const summary = summaryOf(lineOf(ESPRESSO, 1));

      const effect = calculateCouponEffect(
        { kind: 'percentage-discount', percentage: -5 },
        summary,
      );

      expect(effect.discount).toBe(0);
    });
  });

  describe('two for one', () => {
    it.each([
      [1, 0],
      [2, 2800],
      [3, 2800],
      [4, 5600],
      [5, 5600],
    ])('with %s units of the product the discount is %s', (quantity, discount) => {
      const summary = summaryOf(lineOf(ESPRESSO, quantity), lineOf(COOKIE, 2));

      const effect = calculateCouponEffect({ kind: 'two-for-one', product: ESPRESSO }, summary);

      expect(effect).toEqual({ discount, gift: null });
    });

    it('gives no discount when the product is not in the order', () => {
      const summary = summaryOf(lineOf(COOKIE, 4));

      const effect = calculateCouponEffect({ kind: 'two-for-one', product: ESPRESSO }, summary);

      expect(effect.discount).toBe(0);
    });

    it('adds up the free units of every line of the product', () => {
      const summary = summaryOf(lineOf(ESPRESSO, 2), lineOf(ESPRESSO, 3));

      const effect = calculateCouponEffect({ kind: 'two-for-one', product: ESPRESSO }, summary);

      expect(effect.discount).toBe(5600);
    });
  });

  describe('free product', () => {
    it('gives the product as a gift without touching the price', () => {
      const summary = summaryOf(lineOf(ESPRESSO, 2));

      const effect = calculateCouponEffect({ kind: 'free-product', product: COOKIE }, summary);

      expect(effect).toEqual({ discount: 0, gift: COOKIE });
    });
  });
});

describe('toCouponPreview', () => {
  it('shows the subtotal, the discount and the final total of a percentage coupon', () => {
    const summary = summaryOf(lineOf(ESPRESSO, 2), lineOf(COOKIE, 1));
    const coupon = couponOf({ kind: 'percentage-discount', percentage: 10 });

    expect(toCouponPreview(coupon, summary)).toEqual({
      couponName: 'Cupón de prueba',
      subtotal: 8100,
      discount: 810,
      gift: null,
      total: 7290,
    });
  });

  it('keeps the total of a free product coupon and shows the gift', () => {
    const summary = summaryOf(lineOf(ESPRESSO, 2));
    const coupon = couponOf({ kind: 'free-product', product: COOKIE });

    expect(toCouponPreview(coupon, summary)).toEqual({
      couponName: 'Cupón de prueba',
      subtotal: 5600,
      discount: 0,
      gift: COOKIE,
      total: 5600,
    });
  });

  it('lowers the total by the free units of a two for one', () => {
    const summary = summaryOf(lineOf(ESPRESSO, 3), lineOf(COOKIE, 1));
    const coupon = couponOf({ kind: 'two-for-one', product: ESPRESSO });

    const preview = toCouponPreview(coupon, summary);

    expect(preview.discount).toBe(2800);
    expect(preview.total).toBe(8100);
  });

  it('never leaves a negative total', () => {
    const summary = summaryOf(lineOf(ESPRESSO, 1));
    const coupon = couponOf({ kind: 'percentage-discount', percentage: 200 });

    expect(toCouponPreview(coupon, summary).total).toBe(0);
  });

  it('rounds the total to cents', () => {
    const summary = summaryOf(lineOf({ id: 'odd', name: 'Odd', price: 333 }, 1));
    const coupon = couponOf({ kind: 'percentage-discount', percentage: 33.33 });

    const preview = toCouponPreview(coupon, summary);

    expect(preview.total).toBe(222.01);
    expect(preview.discount).toBe(110.99);
  });
});
