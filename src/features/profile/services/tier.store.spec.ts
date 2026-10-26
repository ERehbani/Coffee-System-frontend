import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { ProfileDashboard, RedeemedBenefit, TierBenefit, TierDetail } from '../types/profile.model';
import { buildProfileDashboardFixture, buildTierDetailFixture } from '../utils/profile.fixture';
import { toProfileDashboard, toTierDetail } from '../utils/profile.mapper';
import { MOCK_LATENCY_MS, MockProfileRepository } from './mock-profile.repository';
import { ProfileRepository } from './profile.repository';
import { ProfileStore } from './profile.store';
import { REDEEM_ERROR_MESSAGE, TierStore } from './tier.store';

const coffee: TierBenefit = {
  id: 'benefit-coffee',
  name: 'Café de cortesía',
  description: 'Un café a elección',
  pointsCost: 300,
  expiresAt: null,
  cafeName: null,
  tier: 'bronze',
};

const mug: TierBenefit = {
  id: 'benefit-mug',
  name: 'Taza de edición limitada',
  description: 'Taza de cerámica',
  pointsCost: 1200,
  expiresAt: new Date(2026, 11, 31),
  cafeName: 'Cafe Central',
  tier: 'silver',
};

const redeemed: RedeemedBenefit = {
  id: 'redemption-9',
  validationCode: 'VLD-0009-MOCK',
  benefitName: coffee.name,
  cafeName: null,
  usedPoints: coffee.pointsCost,
  redeemedAt: new Date(2026, 9, 26, 9, 30),
};

function detailWith(availablePoints: number): TierDetail {
  return toTierDetail({ ...buildTierDetailFixture(), availablePoints });
}

describe('TierStore', () => {
  let points: number;
  let benefits: readonly TierBenefit[];
  let getTierDetail: Mock<() => Observable<TierDetail>>;
  let getTierBenefits: Mock<() => Observable<readonly TierBenefit[]>>;
  let redeemBenefit: Mock<(id: string) => Observable<RedeemedBenefit>>;
  let getDashboard: Mock<() => Observable<ProfileDashboard>>;

  function createStore(...extraProviders: Type<unknown>[]): TierStore {
    TestBed.configureTestingModule({
      providers: [
        TierStore,
        ...extraProviders,
        {
          provide: ProfileRepository,
          useValue: { getTierDetail, getTierBenefits, redeemBenefit, getDashboard },
        },
      ],
    });
    const store = TestBed.inject(TierStore);
    TestBed.flushEffects();
    return store;
  }

  /** Lets the resources triggered by a reload run and settle. */
  async function settle(): Promise<void> {
    TestBed.flushEffects();
    await Promise.resolve();
    TestBed.flushEffects();
  }

  beforeEach(() => {
    points = 850;
    benefits = [coffee, mug];
    getTierDetail = vi.fn(() => of(detailWith(points)));
    getTierBenefits = vi.fn(() => of(benefits));
    redeemBenefit = vi.fn(() => {
      points -= coffee.pointsCost;
      return of(redeemed);
    });
    getDashboard = vi.fn(() => of(toProfileDashboard(buildProfileDashboardFixture(new Date()))));
  });

  describe('benefits', () => {
    it('lists the benefits with the points still missing to afford them', () => {
      const store = createStore();

      expect(store.benefitsStatus()).toBe('ready');
      expect(store.benefits().map((benefit) => [benefit.id, benefit.missingPoints])).toEqual([
        ['benefit-coffee', 0],
        ['benefit-mug', 350],
      ]);
      expect(store.availablePoints()).toBe(850);
    });

    it('starts with every benefit idle, unlocked and without error', () => {
      const store = createStore();

      for (const benefit of store.benefits()) {
        expect(benefit.phase).toBe('idle');
        expect(benefit.locked).toBe(false);
        expect(benefit.errorMessage).toBeNull();
      }
    });

    it('reports loading until the benefits arrive', () => {
      const pending = new Subject<readonly TierBenefit[]>();
      getTierBenefits = vi.fn(() => pending);
      const store = createStore();

      expect(store.benefitsStatus()).toBe('loading');
      expect(store.benefits()).toEqual([]);
    });

    it('reports an empty list as ready', () => {
      benefits = [];
      const store = createStore();

      expect(store.benefitsStatus()).toBe('ready');
      expect(store.benefits()).toEqual([]);
    });

    it('reports an error and retries with reloadBenefits', async () => {
      let calls = 0;
      getTierBenefits = vi.fn(() =>
        ++calls === 1 ? throwError(() => new Error('500')) : of(benefits),
      );
      const store = createStore();
      expect(store.benefitsStatus()).toBe('error');

      store.reloadBenefits();
      await settle();

      expect(calls).toBe(2);
      expect(store.benefitsStatus()).toBe('ready');
      expect(store.benefits().length).toBe(2);
    });

    it('keeps the tier detail ready when only the benefits fail', () => {
      getTierBenefits = vi.fn(() => throwError(() => new Error('500')));
      const store = createStore();

      expect(store.status()).toBe('ready');
      expect(store.benefitsStatus()).toBe('error');
    });
  });

  describe('confirm step', () => {
    it('asks for confirmation on the requested benefit only', () => {
      const store = createStore();

      store.requestRedeem('benefit-coffee');

      const [first, second] = store.benefits();
      expect(first.phase).toBe('confirming');
      expect(second.phase).toBe('idle');
      expect(redeemBenefit).not.toHaveBeenCalled();
    });

    it('goes back to idle when the confirmation is cancelled', () => {
      const store = createStore();
      store.requestRedeem('benefit-coffee');

      store.cancelRedeem();

      expect(store.benefits().every((benefit) => benefit.phase === 'idle')).toBe(true);
    });

    it('moves the confirmation to the last requested benefit', () => {
      points = 5000;
      const store = createStore();
      store.requestRedeem('benefit-coffee');

      store.requestRedeem('benefit-mug');

      expect(store.benefits().map((benefit) => benefit.phase)).toEqual(['idle', 'confirming']);
    });

    it('ignores a benefit the client cannot afford', () => {
      const store = createStore();

      store.requestRedeem('benefit-mug');

      expect(store.benefits().every((benefit) => benefit.phase === 'idle')).toBe(true);
    });

    it('ignores a benefit that is not listed', () => {
      const store = createStore();

      store.requestRedeem('unknown');

      expect(store.benefits().every((benefit) => benefit.phase === 'idle')).toBe(true);
    });

    it('does not redeem without a prior confirmation request', () => {
      const store = createStore();

      store.confirmRedeem();

      expect(redeemBenefit).not.toHaveBeenCalled();
    });
  });

  describe('redeeming', () => {
    it('redeems the confirmed benefit and locks the rest while it is in progress', () => {
      const pending = new Subject<RedeemedBenefit>();
      redeemBenefit = vi.fn(() => pending);
      const store = createStore();
      store.requestRedeem('benefit-coffee');

      store.confirmRedeem();

      expect(redeemBenefit).toHaveBeenCalledExactlyOnceWith('benefit-coffee');
      const [first, second] = store.benefits();
      expect(first.phase).toBe('redeeming');
      expect(second.locked).toBe(true);
      expect(store.redeemed()).toBeNull();
    });

    it('does not redeem twice while a redemption is in progress', () => {
      redeemBenefit = vi.fn(() => new Subject<RedeemedBenefit>());
      const store = createStore();
      store.requestRedeem('benefit-coffee');
      store.confirmRedeem();

      store.confirmRedeem();
      store.requestRedeem('benefit-coffee');

      expect(redeemBenefit).toHaveBeenCalledTimes(1);
    });

    it('on success exposes the redemption and refreshes the available points', async () => {
      const store = createStore();
      store.requestRedeem('benefit-coffee');

      store.confirmRedeem();
      await settle();

      expect(store.redeemed()).toEqual(redeemed);
      expect(store.availablePoints()).toBe(550);
      expect(store.detail()?.availablePoints).toBe(550);
      expect(store.benefits().every((benefit) => benefit.phase === 'idle')).toBe(true);
      expect(store.benefits().every((benefit) => !benefit.locked)).toBe(true);
      expect(getTierDetail).toHaveBeenCalledTimes(2);
      expect(getTierBenefits).toHaveBeenCalledTimes(2);
    });

    it('recomputes the missing points with the refreshed balance', async () => {
      const store = createStore();
      store.requestRedeem('benefit-coffee');

      store.confirmRedeem();
      await settle();

      expect(store.benefits().find((benefit) => benefit.id === 'benefit-mug')?.missingPoints).toBe(
        650,
      );
    });

    it('keeps the tier page ready while the points refresh', async () => {
      const store = createStore();
      store.requestRedeem('benefit-coffee');

      store.confirmRedeem();

      expect(store.status()).toBe('ready');
      expect(store.benefitsStatus()).toBe('ready');
      await settle();
      expect(store.status()).toBe('ready');
    });

    it('dismisses the success message', async () => {
      const store = createStore();
      store.requestRedeem('benefit-coffee');
      store.confirmRedeem();
      await settle();

      store.dismissRedeemed();

      expect(store.redeemed()).toBeNull();
    });

    it('clears the previous success message when another confirmation starts', async () => {
      points = 5000;
      const store = createStore();
      store.requestRedeem('benefit-coffee');
      store.confirmRedeem();
      await settle();
      expect(store.redeemed()).not.toBeNull();

      store.requestRedeem('benefit-coffee');

      expect(store.redeemed()).toBeNull();
    });

    it('on failure keeps the points and shows an error on that benefit only', async () => {
      redeemBenefit = vi.fn(() => throwError(() => new Error('400')));
      const store = createStore();
      store.requestRedeem('benefit-coffee');

      store.confirmRedeem();
      await settle();

      const [first, second] = store.benefits();
      expect(first.phase).toBe('idle');
      expect(first.errorMessage).toBe(REDEEM_ERROR_MESSAGE);
      expect(second.errorMessage).toBeNull();
      expect(second.locked).toBe(false);
      expect(store.redeemed()).toBeNull();
      expect(store.availablePoints()).toBe(850);
      expect(getTierDetail).toHaveBeenCalledTimes(1);
    });

    it('clears the error when the client tries again', () => {
      redeemBenefit = vi.fn(() => throwError(() => new Error('400')));
      const store = createStore();
      store.requestRedeem('benefit-coffee');
      store.confirmRedeem();
      expect(store.benefits()[0].errorMessage).toBe(REDEEM_ERROR_MESSAGE);

      store.requestRedeem('benefit-coffee');

      expect(store.benefits()[0].errorMessage).toBeNull();
      expect(store.benefits()[0].phase).toBe('confirming');
    });

    it('refreshes the profile dashboard so the coupon detail finds the new redemption', async () => {
      const store = createStore(ProfileStore);
      const profileStore = TestBed.inject(ProfileStore);
      TestBed.flushEffects();
      expect(profileStore.dashboard()).not.toBeNull();
      expect(getDashboard).toHaveBeenCalledTimes(1);
      store.requestRedeem('benefit-coffee');

      store.confirmRedeem();
      await settle();

      expect(getDashboard).toHaveBeenCalledTimes(2);
    });

    it('works without a profile store in the injector', async () => {
      const store = createStore();
      store.requestRedeem('benefit-coffee');

      store.confirmRedeem();
      await settle();

      expect(store.redeemed()).toEqual(redeemed);
    });
  });

  describe('leaving the page', () => {
    it('drops an open confirm step', () => {
      const store = createStore();
      store.requestRedeem('benefit-coffee');

      store.leave();
      store.enter();

      expect(store.benefits().every((benefit) => benefit.phase === 'idle')).toBe(true);
    });

    it('drops the success message', async () => {
      const store = createStore();
      store.requestRedeem('benefit-coffee');
      store.confirmRedeem();
      await settle();
      expect(store.redeemed()).not.toBeNull();

      store.leave();
      store.enter();

      expect(store.redeemed()).toBeNull();
    });

    it('drops a failed attempt', () => {
      redeemBenefit = vi.fn(() => throwError(() => new Error('400')));
      const store = createStore();
      store.requestRedeem('benefit-coffee');
      store.confirmRedeem();
      expect(store.benefits()[0].errorMessage).not.toBeNull();

      store.leave();
      store.enter();

      expect(store.benefits().every((benefit) => benefit.errorMessage === null)).toBe(true);
    });

    it('keeps a redemption in flight and shows its code when it lands while the page is away', async () => {
      const pending = new Subject<RedeemedBenefit>();
      redeemBenefit = vi.fn(() => pending);
      const store = createStore();
      store.requestRedeem('benefit-coffee');
      store.confirmRedeem();

      store.leave();
      expect(store.benefits()[0].phase).toBe('redeeming');
      points -= coffee.pointsCost;
      pending.next(redeemed);
      pending.complete();
      await settle();
      store.enter();

      expect(store.redeemed()).toEqual(redeemed);
      expect(store.availablePoints()).toBe(550);
      expect(store.benefits().every((benefit) => benefit.phase === 'idle')).toBe(true);
    });

    it('does not show an error for a redemption that failed while the page was away', () => {
      const pending = new Subject<RedeemedBenefit>();
      redeemBenefit = vi.fn(() => pending);
      const store = createStore();
      store.requestRedeem('benefit-coffee');
      store.confirmRedeem();

      store.leave();
      pending.error(new Error('400'));
      store.enter();

      expect(store.benefits().every((benefit) => benefit.errorMessage === null)).toBe(true);
      expect(store.benefits().every((benefit) => benefit.phase === 'idle')).toBe(true);
    });

    it('still reports a failure that happens while the page is open', () => {
      const pending = new Subject<RedeemedBenefit>();
      redeemBenefit = vi.fn(() => pending);
      const store = createStore();
      store.leave();
      store.enter();
      store.requestRedeem('benefit-coffee');
      store.confirmRedeem();

      pending.error(new Error('400'));

      expect(store.benefits()[0].errorMessage).toBe(REDEEM_ERROR_MESSAGE);
    });
  });
});

describe('TierStore with the mock repository', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function elapse(): Promise<void> {
    TestBed.flushEffects();
    await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
    TestBed.flushEffects();
  }

  it('makes the redeemed benefit available to the coupon detail of an already loaded profile', async () => {
    TestBed.configureTestingModule({
      providers: [
        TierStore,
        ProfileStore,
        { provide: ProfileRepository, useClass: MockProfileRepository },
      ],
    });
    const store = TestBed.inject(TierStore);
    const profileStore = TestBed.inject(ProfileStore);
    await elapse();
    const pointsBefore = store.availablePoints();
    const activeBefore = profileStore.activeRedemptions().length;
    const coffee = store.benefits().find((benefit) => benefit.missingPoints === 0)!;
    store.requestRedeem(coffee.id);

    store.confirmRedeem();
    await elapse();
    await elapse();

    const redeemedId = store.redeemed()!.id;
    expect(store.availablePoints()).toBe(pointsBefore - coffee.pointsCost);
    expect(profileStore.activeRedemptions().length).toBe(activeBefore + 1);
    expect(profileStore.activeRedemptions().some(({ id }) => id === redeemedId)).toBe(true);
    expect(profileStore.dashboard()?.loyalty.availablePoints).toBe(store.availablePoints());
  });
});
