import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { MOCK_LATENCY_MS, MockProfileRepository } from './mock-profile.repository';

describe('MockProfileRepository benefits', () => {
  let repository: MockProfileRepository;

  beforeEach(() => {
    vi.useFakeTimers();
    repository = new MockProfileRepository();
  });

  afterEach(() => vi.useRealTimers());

  /** Subscribes, lets the simulated latency elapse and resolves with the first emission. */
  function settle<T>(source: Observable<T>): Promise<T> {
    const result = firstValueFrom(source);
    vi.advanceTimersByTime(MOCK_LATENCY_MS);
    return result;
  }

  async function firstAffordableBenefitId(): Promise<string> {
    const [{ availablePoints }, benefits] = await Promise.all([
      settle(repository.getTierDetail()),
      settle(repository.getTierBenefits()),
    ]);
    const affordable = benefits.find((benefit) => benefit.pointsCost <= availablePoints);
    return affordable!.id;
  }

  it('lists the benefits of the client tier and the tiers below it, never higher ones', async () => {
    const [detail, benefits] = await Promise.all([
      settle(repository.getTierDetail()),
      settle(repository.getTierBenefits()),
    ]);

    expect(detail.tier).toBe('silver');
    expect(new Set(benefits.map((benefit) => benefit.tier))).toEqual(new Set(['bronze', 'silver']));
  });

  it('offers global and cafe specific benefits, with and without an end date', async () => {
    const benefits = await settle(repository.getTierBenefits());

    expect(benefits.some((benefit) => benefit.cafeName === null)).toBe(true);
    expect(benefits.some((benefit) => benefit.cafeName !== null)).toBe(true);
    expect(benefits.some((benefit) => benefit.expiresAt === null)).toBe(true);
    expect(benefits.some((benefit) => benefit.expiresAt !== null)).toBe(true);
  });

  it('includes a benefit the client cannot afford yet', async () => {
    const [{ availablePoints }, benefits] = await Promise.all([
      settle(repository.getTierDetail()),
      settle(repository.getTierBenefits()),
    ]);

    expect(benefits.some((benefit) => benefit.pointsCost > availablePoints)).toBe(true);
  });

  it('exposes the same available points in the tier detail and in the dashboard', async () => {
    const [detail, dashboard] = await Promise.all([
      settle(repository.getTierDetail()),
      settle(repository.getDashboard()),
    ]);

    expect(detail.availablePoints).toBe(dashboard.loyalty.availablePoints);
  });

  it('redeeming deducts the benefit cost from the available points', async () => {
    const benefitId = await firstAffordableBenefitId();
    const before = (await settle(repository.getTierDetail())).availablePoints;
    const benefits = await settle(repository.getTierBenefits());
    const cost = benefits.find((benefit) => benefit.id === benefitId)!.pointsCost;

    const redeemed = await settle(repository.redeemBenefit(benefitId));

    expect(redeemed.usedPoints).toBe(cost);
    expect((await settle(repository.getTierDetail())).availablePoints).toBe(before - cost);
    expect((await settle(repository.getDashboard())).loyalty.availablePoints).toBe(before - cost);
  });

  it('redeeming returns a validation code and the benefit name', async () => {
    const benefitId = await firstAffordableBenefitId();
    const benefits = await settle(repository.getTierBenefits());

    const redeemed = await settle(repository.redeemBenefit(benefitId));

    expect(redeemed.validationCode).toMatch(/^VLD-/);
    expect(redeemed.benefitName).toBe(benefits.find((benefit) => benefit.id === benefitId)!.name);
  });

  it('registers the redemption as an active redemption the coupon detail can find', async () => {
    const benefitId = await firstAffordableBenefitId();
    const before = await settle(repository.getDashboard());

    const redeemed = await settle(repository.redeemBenefit(benefitId));

    const after = await settle(repository.getDashboard());
    expect(after.activeRedemptions.length).toBe(before.activeRedemptions.length + 1);
    const registered = after.activeRedemptions.find((redemption) => redemption.id === redeemed.id);
    expect(registered?.code).toBe(redeemed.validationCode);
    expect(registered?.title).toBe(redeemed.benefitName);
    expect(registered!.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('gives every redemption its own id and code', async () => {
    const benefitId = await firstAffordableBenefitId();

    const first = await settle(repository.redeemBenefit(benefitId));
    const second = await settle(repository.redeemBenefit(benefitId));

    expect(second.id).not.toBe(first.id);
    expect(second.validationCode).not.toBe(first.validationCode);
  });

  it('fails with a descriptive error and keeps the points when they are not enough', async () => {
    const [{ availablePoints }, benefits] = await Promise.all([
      settle(repository.getTierDetail()),
      settle(repository.getTierBenefits()),
    ]);
    const expensive = benefits.find((benefit) => benefit.pointsCost > availablePoints)!;
    const activeBefore = (await settle(repository.getDashboard())).activeRedemptions.length;

    await expect(settle(repository.redeemBenefit(expensive.id))).rejects.toMatchObject({
      status: 400,
      error: { error: 'Client does not have enough points', status: 400 },
    });

    expect((await settle(repository.getTierDetail())).availablePoints).toBe(availablePoints);
    expect((await settle(repository.getDashboard())).activeRedemptions.length).toBe(activeBefore);
  });

  it('fails when the benefit does not exist', async () => {
    await expect(settle(repository.redeemBenefit('unknown'))).rejects.toMatchObject({
      status: 404,
      error: 'Benefit not found',
    });
  });

  it('stops redeeming once the points run out', async () => {
    const benefitId = await firstAffordableBenefitId();

    let failure: unknown = null;
    for (let attempt = 0; attempt < 50 && failure === null; attempt++) {
      try {
        await settle(repository.redeemBenefit(benefitId));
      } catch (error) {
        failure = error;
      }
    }

    expect(failure).toBeInstanceOf(HttpErrorResponse);
    const { availablePoints } = await settle(repository.getTierDetail());
    expect(availablePoints).toBeGreaterThanOrEqual(0);
  });
});
