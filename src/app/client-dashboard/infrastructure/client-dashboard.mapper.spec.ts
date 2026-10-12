import { ClientDashboardDto } from './client-dashboard.dto';
import { buildClientDashboardFixture } from './client-dashboard.fixture';
import { mapClientDashboardDto } from './client-dashboard.mapper';

describe('mapClientDashboardDto', () => {
  const now = new Date('2026-10-12T12:00:00.000Z');
  const fixture = buildClientDashboardFixture(now);

  function withLoyalty(loyalty: Partial<ClientDashboardDto['loyalty']>): ClientDashboardDto {
    return { ...fixture, loyalty: { ...fixture.loyalty, ...loyalty } };
  }

  it('maps the client profile and loyalty status', () => {
    const dashboard = mapClientDashboardDto(fixture);

    expect(dashboard.profile).toEqual({
      id: 'client-001',
      firstName: 'Juan',
      avatarUrl: fixture.client.avatarUrl,
    });
    expect(dashboard.loyalty).toEqual({
      tier: 'silver',
      availablePoints: 850,
      lifetimePoints: 1420,
      nextTier: 'gold',
      nextTierThreshold: 3000,
    });
  });

  it('parses the redemption expiry into a Date', () => {
    const [redemption] = mapClientDashboardDto(fixture).activeRedemptions;

    expect(redemption.code).toBe('VLD-8492-C0FF');
    expect(redemption.expiresAt).toBeInstanceOf(Date);
    expect(redemption.expiresAt.toISOString()).toBe('2026-10-17T12:00:00.000Z');
  });

  it('keeps cafes and benefits in API order with their optional fields', () => {
    const dashboard = mapClientDashboardDto(fixture);

    expect(dashboard.nearbyCafes.map((cafe) => [cafe.name, cafe.distanceMeters])).toEqual([
      ['Cafe Central', null],
      ['Cafe Norte', 450],
    ]);
    expect(dashboard.nearbyCafes[0].maxPointsPerProduct).toBe(80);
    expect(dashboard.featuredBenefits.map((benefit) => benefit.pointsCost)).toEqual([300, 200]);
  });

  it('normalizes a missing avatar to null', () => {
    const dashboard = mapClientDashboardDto({
      ...fixture,
      client: { id: 'client-002', firstName: 'Ana' },
    });

    expect(dashboard.profile.avatarUrl).toBeNull();
  });

  it('maps the highest tier with no next tier', () => {
    const dashboard = mapClientDashboardDto(
      withLoyalty({ tier: 'diamond', nextTier: null, nextTierThreshold: null }),
    );

    expect(dashboard.loyalty.tier).toBe('diamond');
    expect(dashboard.loyalty.nextTier).toBeNull();
  });

  it('rejects an unknown tier code', () => {
    expect(() => mapClientDashboardDto(withLoyalty({ tier: 'PLATINUM' }))).toThrowError(
      /Unknown loyalty tier/,
    );
  });

  it('rejects an invalid expiry date', () => {
    const [redemption] = fixture.activeRedemptions;
    const dto = { ...fixture, activeRedemptions: [{ ...redemption, expiresAt: 'tomorrow' }] };

    expect(() => mapClientDashboardDto(dto)).toThrowError(/Invalid date/);
  });
});
