export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface ClientProfile {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly avatarUrl: string | null;
}

export interface UpdateClientProfileInput {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly avatarUrl: string | null;
}

export interface LoyaltyStatus {
  readonly tier: LoyaltyTier;
  readonly availablePoints: number;
  readonly lifetimePoints: number;
  readonly nextTier: LoyaltyTier | null;
  readonly nextTierThreshold: number | null;
  readonly progressPercent: number;
  readonly pointsToNextTier: number;
}

export interface TierLevel {
  readonly tier: LoyaltyTier;
  readonly threshold: number;
  readonly benefits: readonly string[];
}

export interface TierDetail {
  readonly tier: LoyaltyTier;
  readonly availablePoints: number;
  readonly lifetimePoints: number;
  readonly currentTierThreshold: number;
  readonly nextTier: LoyaltyTier | null;
  readonly nextTierThreshold: number | null;
  readonly progressPercent: number;
  readonly pointsToNextTier: number;
  readonly levels: readonly TierLevel[];
}

export interface ActiveRedemption {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly code: string;
  /** null when the redeemed benefit never ends */
  readonly expiresAt: Date | null;
  /** false when the backend sent a calendar day only: `expiresAt` is then its end, not a time */
  readonly expiresAtHasTime: boolean;
  /** null for global benefits that are valid in any cafe */
  readonly cafeName: string | null;
  readonly conditions: readonly string[];
}

export interface NearbyCafe {
  readonly id: string;
  readonly name: string;
  /** null when the cafe has no photo */
  readonly imageUrl: string | null;
  readonly rating: number;
  readonly reviewCount: number;
  readonly isOpenNow: boolean;
  readonly distanceMeters: number | null;
  readonly maxPointsPerProduct: number | null;
  readonly tagline: string;
}

export interface FeaturedBenefit {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  /** null when the benefit has no photo */
  readonly imageUrl: string | null;
  readonly pointsCost: number;
}

export interface ProfileDashboard {
  readonly profile: ClientProfile;
  readonly loyalty: LoyaltyStatus;
  readonly activeRedemptions: readonly ActiveRedemption[];
  readonly nearbyCafes: readonly NearbyCafe[];
  readonly featuredBenefits: readonly FeaturedBenefit[];
}


/** A benefit enabled for the client's tier that can be redeemed with points. */
export interface TierBenefit {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly pointsCost: number;
  /** null when the benefit never ends */
  readonly expiresAt: Date | null;
  /** null for global benefits that are valid in any cafe */
  readonly cafeName: string | null;
  readonly tier: LoyaltyTier;
}

/** Result of redeeming a benefit: the redemption to show at the cafe. */
export interface RedeemedBenefit {
  readonly id: string;
  readonly validationCode: string;
  readonly benefitName: string;
  readonly cafeName: string | null;
  readonly usedPoints: number;
  readonly redeemedAt: Date;
}
