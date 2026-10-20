import { LoyaltyTierCodeDto, ProfileDashboardDto, TierDetailDto } from '../types/profile.dto';
import { LoyaltyTier, ProfileDashboard, TierDetail } from '../types/profile.model';

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

export function toProfileDashboard(dto: ProfileDashboardDto): ProfileDashboard {
  const { client, loyalty } = dto;
  return {
    profile: {
      id: client.id,
      firstName: client.firstName,
      avatarUrl: client.avatarUrl ?? null,
    },
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
