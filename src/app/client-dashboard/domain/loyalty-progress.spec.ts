import { calculateLoyaltyProgress, calendarDaysUntil } from './loyalty-progress';

describe('calculateLoyaltyProgress', () => {
  it('reports the percentage towards the next tier with one decimal and the points left', () => {
    expect(
      calculateLoyaltyProgress({ lifetimePoints: 1420, nextTier: 'gold', nextTierThreshold: 3000 }),
    ).toEqual({ percent: 47.3, remainingPoints: 1580, isMaxTier: false });
  });

  it('rounds down so it never reports the tier as complete before the threshold', () => {
    expect(
      calculateLoyaltyProgress({ lifetimePoints: 2999, nextTier: 'gold', nextTierThreshold: 3000 }),
    ).toEqual({ percent: 99.9, remainingPoints: 1, isMaxTier: false });
  });

  it('clamps to 100% and no remaining points once the threshold is reached or passed', () => {
    expect(
      calculateLoyaltyProgress({ lifetimePoints: 3500, nextTier: 'gold', nextTierThreshold: 3000 }),
    ).toEqual({ percent: 100, remainingPoints: 0, isMaxTier: false });
  });

  it('clamps to 0% for a negative balance', () => {
    expect(
      calculateLoyaltyProgress({ lifetimePoints: -20, nextTier: 'gold', nextTierThreshold: 3000 }),
    ).toEqual({ percent: 0, remainingPoints: 3000, isMaxTier: false });
  });

  it('reports the maximum tier when there is no next tier', () => {
    expect(
      calculateLoyaltyProgress({ lifetimePoints: 9000, nextTier: null, nextTierThreshold: null }),
    ).toEqual({ percent: 100, remainingPoints: 0, isMaxTier: true });
  });

  it('treats a missing or non-positive threshold as the maximum tier', () => {
    expect(
      calculateLoyaltyProgress({ lifetimePoints: 100, nextTier: 'gold', nextTierThreshold: null }),
    ).toEqual({ percent: 100, remainingPoints: 0, isMaxTier: true });
    expect(
      calculateLoyaltyProgress({ lifetimePoints: 100, nextTier: 'gold', nextTierThreshold: 0 }),
    ).toEqual({ percent: 100, remainingPoints: 0, isMaxTier: true });
  });
});

describe('calendarDaysUntil', () => {
  const now = new Date(2026, 9, 12, 8, 0);

  it('counts the calendar days between now and the target date', () => {
    expect(calendarDaysUntil(new Date(2026, 9, 17, 8, 0), now)).toBe(5);
  });

  it('ignores the time of day', () => {
    expect(calendarDaysUntil(new Date(2026, 9, 17, 7, 59), now)).toBe(5);
    expect(calendarDaysUntil(new Date(2026, 9, 13, 0, 30), new Date(2026, 9, 12, 23, 0))).toBe(1);
  });

  it('returns 0 for a target later today', () => {
    expect(calendarDaysUntil(new Date(2026, 9, 12, 23, 59), now)).toBe(0);
  });

  it('returns 0 for a target in the past', () => {
    expect(calendarDaysUntil(new Date(2026, 9, 1, 8, 0), now)).toBe(0);
  });

  it('crosses month boundaries', () => {
    expect(calendarDaysUntil(new Date(2026, 10, 2, 12, 0), new Date(2026, 9, 30, 12, 0))).toBe(3);
  });
});
