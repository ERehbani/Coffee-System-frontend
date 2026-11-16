import { LoyaltyTier } from '../types/profile.model';

const DEFAULT_TIER_TEXT_CLASS = 'text-primary';

const KNOWN_TIER_LABELS: ReadonlyMap<LoyaltyTier, string> = new Map([
  ['bronze', 'BRONCE'],
  ['silver', 'PLATA'],
  ['gold', 'ORO'],
  ['diamond', 'DIAMANTE'],
]);

const KNOWN_TIER_TEXT_CLASSES: ReadonlyMap<LoyaltyTier, string> = new Map([
  ['bronze', 'text-bronze'],
  ['silver', 'text-silver'],
  ['gold', 'text-gold'],
  ['diamond', 'text-diamond'],
]);

export function toTierLabel(tier: LoyaltyTier): string {
  return KNOWN_TIER_LABELS.get(tier) ?? tier.toUpperCase();
}

export function toTierTextClass(tier: LoyaltyTier): string {
  return KNOWN_TIER_TEXT_CLASSES.get(tier) ?? DEFAULT_TIER_TEXT_CLASS;
}
