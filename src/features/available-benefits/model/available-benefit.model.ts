import { BenefitFormatCode } from '../../admin-benefit-types/types/benefit-format.model';

export interface AvailableBenefit {
  readonly externalId: string;
  readonly name: string;
  readonly description: string | null;
  readonly conditions: string | null;
  readonly pointsCost: number;
  readonly cafeEntity: string | null;
  readonly global: boolean;
  readonly benefitType: BenefitFormatCode | null;
  readonly tierName: string | null;
  readonly tierMinPoints: number | null;
  readonly endDate: string | null;
  readonly productName: string | null;
  readonly soldOut: boolean;
}
