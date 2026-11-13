import { BenefitFormatCode } from '../../admin-benefit-types/types/benefit-format.model';

export interface ValidatedCoupon {
  readonly id: string;
  readonly code: string;
  readonly benefitName: string;
  readonly description: string | null;
  readonly conditions: readonly string[];
  readonly benefitType: BenefitFormatCode | null;
  readonly discountPercentage: number | null;
  readonly productName: string | null;
  readonly productPrice: number | null;
  readonly usedAt: string | null;
}

export type ValidationFailure =
  | { readonly kind: 'used' }
  | { readonly kind: 'not-found' }
  | { readonly kind: 'rejected'; readonly message: string };

export type ValidationResult =
  { readonly kind: 'valid'; readonly coupon: ValidatedCoupon } | ValidationFailure;

export type ValidationOutcome = ValidationResult & { readonly code: string };
