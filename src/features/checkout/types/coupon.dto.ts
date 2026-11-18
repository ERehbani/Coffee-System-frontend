export interface CheckoutCouponDto {
  readonly externalId: string;
  readonly date: string;
  readonly usedPoints: number;
  readonly state: boolean;
  readonly validationCode: string;
  readonly benefitName: string;
  readonly cafeName: string | null;
  readonly description: string | null;
  readonly expiresAt: string | null;
  readonly conditions: string | null;
  readonly usedDate: string | null;
  readonly cafeId: string | null;
  readonly benefitType: string | null;
  readonly discountPercentage: number | null;
  readonly productId: string | null;
  readonly productName: string | null;
  readonly productPrice: number | null;
  /** Set only for a global product coupon, which then has no product id nor price. */
  readonly catalogProductId: string | null;
}
