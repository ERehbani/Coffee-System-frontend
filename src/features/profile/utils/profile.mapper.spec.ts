import { RedemptionDto } from '../types/profile.dto';
import { toUsedBenefits } from './profile.mapper';

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
