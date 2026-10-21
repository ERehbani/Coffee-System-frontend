import {
  ClientProfileDto,
  LoyaltyTierCodeDto,
  ProfileDashboardDto,
  RedemptionDto,
  TierDetailDto,
  UpdateClientProfileDto,
} from '../types/profile.dto';
import {
  ClientProfile,
  LoyaltyTier,
  ProfileDashboard,
  TierDetail,
  UpdateClientProfileInput,
  UsedBenefit,
} from '../types/profile.model';

const LOYALTY_TIERS: readonly LoyaltyTier[] = ['bronze', 'silver', 'gold', 'diamond'];

function toLoyaltyTier(code: LoyaltyTierCodeDto): LoyaltyTier {
  const tier = LOYALTY_TIERS.find((candidate) => candidate === code.toLowerCase());
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
