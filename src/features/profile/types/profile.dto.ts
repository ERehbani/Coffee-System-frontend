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
  /** null when the backend keeps a single name field */
  readonly lastName?: string | null;
  /** null when the client has none on file */
  readonly email?: string | null;
  /** null when the client has none on file */
  readonly phoneNumber?: string | null;
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
  /** ISO date or date-time; null when the benefit never ends */
  readonly expiresAt: string | null;
  /** Usage conditions. Not in the backend contract yet; treated as empty when missing. */
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
  /** Benefits have no image in the backend yet */
  readonly imageUrl: string | null;
  readonly pointsCost: number;
}

/** Backend RedemptionResponse (GET /redemption). `state: false` means it was already used. */
export interface RedemptionDto {
  readonly externalId: string;
  readonly date: string;
  readonly usedPoints: number;
  readonly state: boolean;
  readonly validationCode: string;
  readonly benefitName: string;
  /** null for global benefits that are valid in any cafe */
  readonly cafeName: string | null;
}

/** Backend TierBenefitResponse (GET /clients/me/benefits): a benefit the client can redeem. */
export interface TierBenefitDto {
  readonly externalId: string;
  readonly name: string;
  readonly description: string;
  readonly pointsCost: number;
  /** ISO calendar day (yyyy-MM-dd); null when the benefit never ends */
  readonly endDate: string | null;
  /** null for global benefits that are valid in any cafe */
  readonly cafeName: string | null;
  /** Backend tier name (BRONCE, PLATA, ORO, DIAMANTE) the benefit belongs to */
  readonly tierName: LoyaltyTierCodeDto;
  readonly benefitType: string;
}
