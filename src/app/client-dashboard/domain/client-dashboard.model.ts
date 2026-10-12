export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface ClientProfile {
  readonly id: string;
  readonly firstName: string;
  readonly avatarUrl: string | null;
}

export interface LoyaltyStatus {
  readonly tier: LoyaltyTier;
  readonly availablePoints: number;
  readonly lifetimePoints: number;
  /** `null` when the client already holds the highest tier. */
  readonly nextTier: LoyaltyTier | null;
  /** Lifetime points required to reach `nextTier`; `null` at the highest tier. */
  readonly nextTierThreshold: number | null;
}

export interface ActiveRedemption {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly code: string;
  readonly expiresAt: Date;
}

export interface NearbyCafe {
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

export interface FeaturedBenefit {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly pointsCost: number;
}

export interface ClientDashboard {
  readonly profile: ClientProfile;
  readonly loyalty: LoyaltyStatus;
  readonly activeRedemptions: readonly ActiveRedemption[];
  readonly nearbyCafes: readonly NearbyCafe[];
  readonly featuredBenefits: readonly FeaturedBenefit[];
}
