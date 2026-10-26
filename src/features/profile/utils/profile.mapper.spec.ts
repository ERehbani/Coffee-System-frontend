import { RedemptionDto, TierBenefitDto, TierDetailDto } from '../types/profile.dto';
import { buildProfileDashboardFixture, buildTierDetailFixture } from './profile.fixture';
import {
  toProfileDashboard,
  toRedeemedBenefit,
  toTierBenefits,
  toTierDetail,
  toUsedBenefits,
} from './profile.mapper';

const redemption = (overrides: Partial<RedemptionDto>): RedemptionDto => ({
  externalId: 'redemption',
  date: '2026-10-01T10:00:00',
  usedPoints: 100,
  state: false,
  validationCode: 'CODE',
  benefitName: 'Beneficio',
  cafeName: 'Cafe Central',
  ...overrides,
});

describe('toUsedBenefits', () => {
  it('keeps only used redemptions, newest first', () => {
    const result = toUsedBenefits([
      redemption({ externalId: 'old', date: '2026-09-01T10:00:00' }),
      redemption({ externalId: 'active', state: true }),
      redemption({ externalId: 'new', date: '2026-10-10T10:00:00', cafeName: null }),
    ]);

    expect(result.map((benefit) => benefit.id)).toEqual(['new', 'old']);
    expect(result[0].cafeName).toBeNull();
    expect(result[0].redeemedAt).toEqual(new Date('2026-10-10T10:00:00'));
  });
});

describe('toProfileDashboard', () => {
  const now = new Date(2026, 9, 21, 12, 0);

  it('maps the conditions of active redemptions', () => {
    const dashboard = toProfileDashboard(buildProfileDashboardFixture(now));

    expect(dashboard.activeRedemptions[0].conditions).toEqual([
      'Un solo uso por cliente.',
      'No acumulable con otras promociones.',
      'Presentá el código antes de pagar.',
    ]);
  });

  it('defaults to no conditions when the backend does not send them', () => {
    const dto = buildProfileDashboardFixture(now);
    const { conditions: _omitted, ...withoutConditions } = dto.activeRedemptions[0];

    const dashboard = toProfileDashboard({ ...dto, activeRedemptions: [withoutConditions] });

    expect(dashboard.activeRedemptions[0].conditions).toEqual([]);
  });
});

describe('toTierDetail', () => {
  const detailDto = (overrides: Partial<TierDetailDto> = {}): TierDetailDto => ({
    ...buildTierDetailFixture(),
    ...overrides,
  });

  it('maps the available points next to the lifetime points', () => {
    const detail = toTierDetail(detailDto({ availablePoints: 820, lifetimePoints: 1420 }));

    expect(detail.availablePoints).toBe(820);
    expect(detail.lifetimePoints).toBe(1420);
  });

  it('accepts the backend (Spanish) tier names in any letter case', () => {
    const detail = toTierDetail(
      detailDto({
        tier: 'PLATA',
        nextTier: 'oro',
        levels: [
          { tier: 'DIAMANTE', threshold: 7000, benefits: [] },
          { tier: 'BRONCE', threshold: 0, benefits: ['Café de cortesía'] },
          { tier: 'Plata', threshold: 1000, benefits: [] },
          { tier: 'ORO', threshold: 3000, benefits: [] },
        ],
      }),
    );

    expect(detail.tier).toBe('silver');
    expect(detail.nextTier).toBe('gold');
    expect(detail.levels.map((level) => level.tier)).toEqual([
      'bronze',
      'silver',
      'gold',
      'diamond',
    ]);
    expect(detail.levels[0].benefits).toEqual(['Café de cortesía']);
  });

  it('keeps accepting the English tier codes', () => {
    const detail = toTierDetail(detailDto({ tier: 'SILVER', nextTier: 'GOLD' }));

    expect(detail.tier).toBe('silver');
    expect(detail.nextTier).toBe('gold');
  });

  it('keeps a null next tier at the top of the ladder', () => {
    const detail = toTierDetail(detailDto({ tier: 'DIAMANTE', nextTier: null }));

    expect(detail.tier).toBe('diamond');
    expect(detail.nextTier).toBeNull();
  });

  it('rejects an unknown tier name', () => {
    expect(() => toTierDetail(detailDto({ tier: 'PLATINO' }))).toThrowError(
      'Unknown loyalty tier code: PLATINO',
    );
  });
});

describe('toTierBenefits', () => {
  const benefit = (overrides: Partial<TierBenefitDto> = {}): TierBenefitDto => ({
    externalId: 'benefit-1',
    name: 'Café de cortesía',
    description: 'Un café de filtro a elección',
    pointsCost: 300,
    endDate: '2026-12-31',
    cafeName: 'Cafe Central',
    tierName: 'BRONCE',
    benefitType: 'PRODUCTO_GRATIS_SOCIO',
    ...overrides,
  });

  it('maps a benefit scoped to one cafe, keeping the backend order', () => {
    const [first, second] = toTierBenefits([
      benefit(),
      benefit({ externalId: 'benefit-2', tierName: 'PLATA' }),
    ]);

    expect(first).toEqual({
      id: 'benefit-1',
      name: 'Café de cortesía',
      description: 'Un café de filtro a elección',
      pointsCost: 300,
      expiresAt: new Date(2026, 11, 31),
      cafeName: 'Cafe Central',
      tier: 'bronze',
    });
    expect(second.id).toBe('benefit-2');
    expect(second.tier).toBe('silver');
  });

  it('keeps a null cafe for benefits valid in any cafe', () => {
    const [result] = toTierBenefits([benefit({ cafeName: null })]);

    expect(result.cafeName).toBeNull();
  });

  it('keeps a null expiry for benefits without an end date', () => {
    const [result] = toTierBenefits([benefit({ endDate: null })]);

    expect(result.expiresAt).toBeNull();
  });

  it('reads the end date as a calendar day, not as a UTC instant', () => {
    const [result] = toTierBenefits([benefit({ endDate: '2026-01-01' })]);

    expect(result.expiresAt?.getFullYear()).toBe(2026);
    expect(result.expiresAt?.getMonth()).toBe(0);
    expect(result.expiresAt?.getDate()).toBe(1);
  });

  it('accepts every backend tier name', () => {
    const tiers = toTierBenefits(
      ['BRONCE', 'PLATA', 'ORO', 'DIAMANTE'].map((tierName) => benefit({ tierName })),
    ).map((result) => result.tier);

    expect(tiers).toEqual(['bronze', 'silver', 'gold', 'diamond']);
  });

  it('rejects a benefit with an invalid end date', () => {
    expect(() => toTierBenefits([benefit({ endDate: 'mañana' })])).toThrowError(
      'Invalid date: mañana',
    );
  });
});

describe('toRedeemedBenefit', () => {
  it('maps the redemption id, validation code and the points spent', () => {
    const result = toRedeemedBenefit({
      externalId: 'redemption-9',
      date: '2026-10-26T09:30:00',
      usedPoints: 300,
      state: true,
      validationCode: 'VLD-0009-ABCD',
      benefitName: 'Café de cortesía',
      cafeName: null,
    });

    expect(result).toEqual({
      id: 'redemption-9',
      validationCode: 'VLD-0009-ABCD',
      benefitName: 'Café de cortesía',
      cafeName: null,
      usedPoints: 300,
      redeemedAt: new Date('2026-10-26T09:30:00'),
    });
  });
});
