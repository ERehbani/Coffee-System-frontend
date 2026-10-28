import { BenefitFormatCode } from '../../admin-benefit-types/types/benefit-format.model';

export interface AvailableBenefit {
  externalId: string;
  name: string;
  description: string | null;
  conditions: string | null;
  pointsCost: number;
  cafeEntity: string | null;
  benefitType: BenefitFormatCode | null;
  tierName: string | null;
  tierMinPoints: number | null;
  endDate: string | null;
}
