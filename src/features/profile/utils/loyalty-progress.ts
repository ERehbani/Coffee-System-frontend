import { LoyaltyStatus } from '../types/profile.model';

export interface LoyaltyProgress {
  readonly percent: number;
  readonly remainingPoints: number;
  readonly isMaxTier: boolean;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function toLoyaltyProgress(
  source: Pick<LoyaltyStatus, 'nextTier' | 'progressPercent' | 'pointsToNextTier'>,
): LoyaltyProgress {
  if (source.nextTier === null) {
    return { percent: 100, remainingPoints: 0, isMaxTier: true };
  }

  const percent = Math.min(Math.max(source.progressPercent, 0), 100);
  return { percent, remainingPoints: Math.max(source.pointsToNextTier, 0), isMaxTier: false };
}

export function calendarDaysUntil(target: Date, now: Date): number {
  const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const days = Math.round((startOfDay(target) - startOfDay(now)) / MS_PER_DAY);
  return Math.max(days, 0);
}
