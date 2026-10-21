import { RedemptionDto } from '../types/profile.dto';
import { buildProfileDashboardFixture } from './profile.fixture';
import { toProfileDashboard, toUsedBenefits } from './profile.mapper';

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
