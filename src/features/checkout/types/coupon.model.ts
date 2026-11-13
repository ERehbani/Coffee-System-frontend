export type CouponsStatus = 'loading' | 'ready' | 'failed';

export interface CouponProduct {
  readonly id: string;
  readonly name: string;
  readonly price: number;
}

export type CouponBenefit =
  | { readonly kind: 'percentage-discount'; readonly percentage: number }
  | { readonly kind: 'two-for-one'; readonly product: CouponProduct }
  | { readonly kind: 'free-product'; readonly product: CouponProduct };

export interface CheckoutCoupon {
  readonly id: string;
  readonly validationCode: string;
  readonly name: string;
  readonly cafeId: string | null;
  readonly cafeName: string | null;
  readonly expiresAt: Date | null;
  readonly isActive: boolean;
  readonly benefit: CouponBenefit | null;
}

export interface ApplicableCoupon extends CheckoutCoupon {
  readonly benefit: CouponBenefit;
}

export interface CouponEffect {
  readonly discount: number;
  readonly gift: CouponProduct | null;
}

export interface CouponPreview extends CouponEffect {
  readonly couponName: string;
  readonly subtotal: number;
  readonly total: number;
}
