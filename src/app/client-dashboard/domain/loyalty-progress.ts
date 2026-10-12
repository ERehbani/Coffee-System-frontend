import { LoyaltyStatus } from './client-dashboard.model';

export interface LoyaltyProgress {
  /** Progress towards the next tier, 0–100, rounded down to one decimal. */
  readonly percent: number;
  readonly remainingPoints: number;
  readonly isMaxTier: boolean;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function calculateLoyaltyProgress(
  loyalty: Pick<LoyaltyStatus, 'lifetimePoints' | 'nextTier' | 'nextTierThreshold'>,
): LoyaltyProgress {
  const { lifetimePoints, nextTier, nextTierThreshold } = loyalty;
  if (nextTier === null || nextTierThreshold === null || nextTierThreshold <= 0) {
    return { percent: 100, remainingPoints: 0, isMaxTier: true };
  }

  const points = Math.min(Math.max(lifetimePoints, 0), nextTierThreshold);
  // Integer math before flooring avoids floating point drift (e.g. 28.999… → 28.9).
  const percent = Math.floor((points * 1000) / nextTierThreshold) / 10;
  return { percent, remainingPoints: nextTierThreshold - points, isMaxTier: false };
}

/** Whole calendar days from `now` to `target` in local time; 0 when today or past. */
export function calendarDaysUntil(target: Date, now: Date): number {
  const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  // Rounding absorbs the one-hour shift of daylight saving transitions.
  const days = Math.round((startOfDay(target) - startOfDay(now)) / MS_PER_DAY);
  return Math.max(days, 0);
}
