import { LoyaltyTier } from '../types/profile.model';

export const TIER_LABELS: Record<LoyaltyTier, string> = {
  bronze: 'BRONCE',
  silver: 'PLATA',
  gold: 'ORO',
  diamond: 'DIAMANTE',
};

export const TIER_TEXT_CLASSES: Record<LoyaltyTier, string> = {
  bronze: 'text-bronze',
  silver: 'text-silver',
  gold: 'text-gold',
  diamond: 'text-diamond',
};
