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
  readonly expiresAt: Date;
  readonly conditions: readonly string[];
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

export interface ProfileDashboard {
  readonly profile: ClientProfile;
  readonly loyalty: LoyaltyStatus;
  readonly activeRedemptions: readonly ActiveRedemption[];
  readonly nearbyCafes: readonly NearbyCafe[];
  readonly featuredBenefits: readonly FeaturedBenefit[];
}

export interface UsedBenefit {
  readonly id: string;
  readonly benefitName: string;
  readonly cafeName: string | null;
  readonly redeemedAt: Date;
  readonly usedPoints: number;
}
