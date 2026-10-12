/**
 * Response of `GET {apiBaseUrl}/clients/me/dashboard`.
 * Proposed contract, pending backend confirmation.
 */
export interface ClientDashboardDto {
  readonly client: ClientProfileDto;
  readonly loyalty: LoyaltyStatusDto;
  readonly activeRedemptions: readonly ActiveRedemptionDto[];
  readonly nearbyCafes: readonly NearbyCafeDto[];
  readonly featuredBenefits: readonly FeaturedBenefitDto[];
}

/** Tier codes as sent by the API: `BRONZE`, `SILVER`, `GOLD` or `DIAMOND`. */
export type LoyaltyTierCodeDto = string;

export interface ClientProfileDto {
  readonly id: string;
  readonly firstName: string;
  readonly avatarUrl?: string | null;
}

export interface LoyaltyStatusDto {
  readonly tier: LoyaltyTierCodeDto;
  readonly availablePoints: number;
  readonly lifetimePoints: number;
  readonly nextTier: LoyaltyTierCodeDto | null;
  readonly nextTierThreshold: number | null;
}

export interface ActiveRedemptionDto {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly code: string;
  /** ISO 8601 date-time. */
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
