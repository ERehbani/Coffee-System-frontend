import {
  BENEFIT_FORMAT_CODES,
  BenefitFormatCode,
} from '../../admin-benefit-types/types/benefit-format.model';
import { RedemptionResponseDto } from '../types/coupon-validation.dto';
import { ValidatedCoupon } from '../types/coupon-validation.model';

function toBenefitType(value: string | null): BenefitFormatCode | null {
  return BENEFIT_FORMAT_CODES.find((code) => code === value) ?? null;
}

function toConditions(text: string | null): readonly string[] {
  return (text ?? '')
    .split('\n')
    .map((condition) => condition.trim())
    .filter((condition) => condition !== '');
}

function toOptionalText(text: string | null): string | null {
  return text?.trim() || null;
}

export function toValidatedCoupon(dto: RedemptionResponseDto): ValidatedCoupon {
  return {
    id: dto.externalId,
    code: dto.validationCode,
    benefitName: dto.benefitName,
    description: toOptionalText(dto.description),
    conditions: toConditions(dto.conditions),
    benefitType: toBenefitType(dto.benefitType),
    discountPercentage: dto.discountPercentage ?? null,
    productName: toOptionalText(dto.productName),
    productPrice: dto.productPrice ?? null,
    usedAt: dto.usedDate ?? null,
  };
}
