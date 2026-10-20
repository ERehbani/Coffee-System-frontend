export interface ProfileDashboardDto {
  readonly client: ClientProfileDto;
  readonly loyalty: LoyaltyStatusDto;
  readonly activeRedemptions: readonly ActiveRedemptionDto[];
  readonly nearbyCafes: readonly NearbyCafeDto[];
  readonly featuredBenefits: readonly FeaturedBenefitDto[];
}

export type LoyaltyTierCodeDto = string;

export interface ClientProfileDto {
  readonly id: string;
  readonly firstName: string;
  readonly lastName?: string;
  readonly email?: string;
  readonly phoneNumber?: string;
  readonly avatarUrl?: string | null;
}

export interface UpdateClientProfileDto {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly avatarUrl?: string | null;
}

export interface LoyaltyStatusDto {
  readonly tier: LoyaltyTierCodeDto;
  readonly availablePoints: number;
  readonly lifetimePoints: number;
  readonly nextTier: LoyaltyTierCodeDto | null;
  readonly nextTierThreshold: number | null;
  readonly progressPercent: number;
  readonly pointsToNextTier: number;
}

export interface TierDetailDto {
  readonly tier: LoyaltyTierCodeDto;
  readonly lifetimePoints: number;
  readonly currentTierThreshold: number;
  readonly nextTier: LoyaltyTierCodeDto | null;
  readonly nextTierThreshold: number | null;
  readonly progressPercent: number;
  readonly pointsToNextTier: number;
  readonly levels: readonly TierLevelDto[];
}

export interface TierLevelDto {
  readonly tier: LoyaltyTierCodeDto;
  readonly threshold: number;
  readonly benefits: readonly string[];
}

export interface ActiveRedemptionDto {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly code: string;
  readonly expiresAt: string;
}

export interface NearbyCafeDto {
  readonly id: string;
  readonly name: string;
  readonly imageUrl: string;
  readonly rating: number;
  readonly reviewCount: number;
  readonly isOpenNow: boolean;
  readonly distanceMeters: number | null;
  readonly maxPointsPerProduct: number | null;
  readonly tagline: string;
}

export interface FeaturedBenefitDto {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly pointsCost: number;
}
