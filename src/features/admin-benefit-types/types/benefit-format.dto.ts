import { BenefitFormatCode } from './benefit-format.model';

export interface BenefitFormatDto {
  readonly externalId: string;
  readonly code: BenefitFormatCode;
  readonly displayName: string;
  readonly description: string;
  readonly active: boolean;
  readonly usageCount: number;
}

export interface CreateBenefitFormatRequestDto {
  readonly code: BenefitFormatCode | null;
  readonly displayName: string;
  readonly description: string;
  readonly active: boolean;
}

export interface UpdateBenefitFormatRequestDto {
  readonly displayName: string;
  readonly description: string;
  readonly active: boolean;
}
