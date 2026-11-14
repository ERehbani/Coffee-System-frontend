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
  readonly lastName?: string | null;
  readonly email?: string | null;
  readonly phoneNumber?: string | null;
  readonly avatarUrl?: string | null;
}

export interface UpdateClientProfileDto {
  readonly name: string;
  readonly lastName: string;
  readonly phone: string;
  readonly profilePhoto: string;
}

export interface UpdatedClientDto {
  readonly externalId: string;
  readonly name: string;
  readonly lastName: string | null;
  readonly phone: string | null;
  readonly profilePhoto: string | null;
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
  readonly availablePoints: number;
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
  readonly expiresAt: string | null;
  readonly cafeName?: string | null;
  readonly conditions?: readonly string[];
}

export interface NearbyCafeDto {
  readonly id: string;
  readonly name: string;
  readonly imageUrl: string | null;
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
  readonly imageUrl: string | null;
  readonly pointsCost: number;
}

export interface RedemptionDto {
  readonly externalId: string;
  readonly date: string;
  readonly usedPoints: number;
  readonly state: boolean;
  readonly validationCode: string;
  readonly benefitName: string;
  readonly cafeName: string | null;
  readonly cafeId: string | null;
}

export interface TierBenefitDto {
  readonly externalId: string;
  readonly name: string;
  readonly description: string;
  readonly pointsCost: number;
  readonly endDate: string | null;
  readonly cafeName: string | null;
  readonly tierName: LoyaltyTierCodeDto;
  readonly benefitType: string;
}
