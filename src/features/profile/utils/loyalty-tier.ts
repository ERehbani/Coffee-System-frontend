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

// Tint and border carry the tier color; the text stays on the theme color so it is readable in both themes.
const DEFAULT_TIER_BADGE_CLASS = 'border border-primary/40 bg-accent-light text-text';

const KNOWN_TIER_BADGE_CLASSES: ReadonlyMap<LoyaltyTier, string> = new Map([
  ['bronze', 'border border-bronze/70 bg-bronze/20 text-text'],
  ['silver', 'border border-silver/80 bg-silver/25 text-text'],
  ['gold', 'border border-gold/80 bg-gold/20 text-text'],
  ['diamond', 'border border-diamond/80 bg-diamond/20 text-text'],
]);

export function toTierBadgeClass(tier: LoyaltyTier): string {
  return KNOWN_TIER_BADGE_CLASSES.get(tier) ?? DEFAULT_TIER_BADGE_CLASS;
}

export function toTierLabel(tier: LoyaltyTier): string {
  return KNOWN_TIER_LABELS.get(tier) ?? tier.toUpperCase();
}

export function toTierTextClass(tier: LoyaltyTier): string {
  return KNOWN_TIER_TEXT_CLASSES.get(tier) ?? DEFAULT_TIER_TEXT_CLASS;
}
