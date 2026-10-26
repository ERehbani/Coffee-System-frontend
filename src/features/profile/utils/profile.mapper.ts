import {
  ClientProfileDto,
  LoyaltyTierCodeDto,
  ProfileDashboardDto,
  RedemptionDto,
  TierBenefitDto,
  TierDetailDto,
  UpdateClientProfileDto,
} from '../types/profile.dto';
import {
  ClientProfile,
  LoyaltyTier,
  ProfileDashboard,
  RedeemedBenefit,
  TierBenefit,
  TierDetail,
  UpdateClientProfileInput,
  UsedBenefit,
} from '../types/profile.model';

/** Accepts the backend tier names (Spanish) and the English codes, in any letter case. */
const LOYALTY_TIERS_BY_CODE: ReadonlyMap<string, LoyaltyTier> = new Map<string, LoyaltyTier>([
  ['bronce', 'bronze'],
  ['plata', 'silver'],
  ['oro', 'gold'],
  ['diamante', 'diamond'],
  ['bronze', 'bronze'],
  ['silver', 'silver'],
  ['gold', 'gold'],
  ['diamond', 'diamond'],
]);

function toLoyaltyTier(code: LoyaltyTierCodeDto): LoyaltyTier {
  const tier = LOYALTY_TIERS_BY_CODE.get(code.toLowerCase());
  if (!tier) {
    throw new Error(`Unknown loyalty tier code: ${code}`);
  }
  return tier;
}

function toDate(isoDate: string): Date {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${isoDate}`);
  }
  return date;
}

const CALENDAR_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A yyyy-MM-dd day is read in local time: `new Date('2026-12-31')` would be UTC midnight. */
function toCalendarDay(isoDay: string): Date {
  const match = CALENDAR_DAY.exec(isoDay);
  if (!match) {
    return toDate(isoDay);
  }
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${isoDay}`);
  }
  return date;
}

export function toClientProfile(dto: ClientProfileDto): ClientProfile {
  return {
    id: dto.id,
    firstName: dto.firstName,
    lastName: dto.lastName ?? '',
    email: dto.email ?? '',
    phoneNumber: dto.phoneNumber ?? '',
    avatarUrl: dto.avatarUrl ?? null,
  };
}

export function toUpdateClientProfileDto(input: UpdateClientProfileInput): UpdateClientProfileDto {
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phoneNumber: input.phoneNumber,
    avatarUrl: input.avatarUrl,
  };
}

export function toProfileDashboard(dto: ProfileDashboardDto): ProfileDashboard {
  const { client, loyalty } = dto;
  return {
    profile: toClientProfile(client),
    loyalty: {
      tier: toLoyaltyTier(loyalty.tier),
      availablePoints: loyalty.availablePoints,
      lifetimePoints: loyalty.lifetimePoints,
      nextTier: loyalty.nextTier === null ? null : toLoyaltyTier(loyalty.nextTier),
      nextTierThreshold: loyalty.nextTierThreshold,
      progressPercent: loyalty.progressPercent,
      pointsToNextTier: loyalty.pointsToNextTier,
    },
    activeRedemptions: dto.activeRedemptions.map((redemption) => ({
      id: redemption.id,
      title: redemption.title,
      description: redemption.description,
      code: redemption.code,
      expiresAt: toDate(redemption.expiresAt),
      conditions: redemption.conditions ?? [],
    })),
    nearbyCafes: dto.nearbyCafes.map((cafe) => ({
      id: cafe.id,
      name: cafe.name,
      imageUrl: cafe.imageUrl,
      rating: cafe.rating,
      reviewCount: cafe.reviewCount,
      isOpenNow: cafe.isOpenNow,
      distanceMeters: cafe.distanceMeters,
      maxPointsPerProduct: cafe.maxPointsPerProduct,
      tagline: cafe.tagline,
    })),
    featuredBenefits: dto.featuredBenefits.map((benefit) => ({
      id: benefit.id,
      title: benefit.title,
      description: benefit.description,
      imageUrl: benefit.imageUrl,
      pointsCost: benefit.pointsCost,
    })),
  };
}

export function toTierDetail(dto: TierDetailDto): TierDetail {
  return {
    tier: toLoyaltyTier(dto.tier),
    availablePoints: dto.availablePoints,
    lifetimePoints: dto.lifetimePoints,
    currentTierThreshold: dto.currentTierThreshold,
    nextTier: dto.nextTier === null ? null : toLoyaltyTier(dto.nextTier),
    nextTierThreshold: dto.nextTierThreshold,
    progressPercent: dto.progressPercent,
    pointsToNextTier: dto.pointsToNextTier,
    levels: dto.levels
      .map((level) => ({
        tier: toLoyaltyTier(level.tier),
        threshold: level.threshold,
        benefits: [...level.benefits],
      }))
      .sort((a, b) => a.threshold - b.threshold),
  };
}

export function toUsedBenefits(dtos: readonly RedemptionDto[]): readonly UsedBenefit[] {
  return dtos
    .filter((dto) => !dto.state)
    .map((dto) => ({
      id: dto.externalId,
      benefitName: dto.benefitName,
      cafeName: dto.cafeName,
      redeemedAt: toDate(dto.date),
      usedPoints: dto.usedPoints,
    }))
    .sort((a, b) => b.redeemedAt.getTime() - a.redeemedAt.getTime());
}

export function toTierBenefits(dtos: readonly TierBenefitDto[]): readonly TierBenefit[] {
  return dtos.map((dto) => ({
    id: dto.externalId,
    name: dto.name,
    description: dto.description,
    pointsCost: dto.pointsCost,
    expiresAt: dto.endDate === null ? null : toCalendarDay(dto.endDate),
    cafeName: dto.cafeName,
    tier: toLoyaltyTier(dto.tierName),
  }));
}

export function toRedeemedBenefit(dto: RedemptionDto): RedeemedBenefit {
  return {
    id: dto.externalId,
    validationCode: dto.validationCode,
    benefitName: dto.benefitName,
    cafeName: dto.cafeName,
    usedPoints: dto.usedPoints,
    redeemedAt: toDate(dto.date),
  };
}
