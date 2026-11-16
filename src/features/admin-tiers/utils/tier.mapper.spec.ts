import { TierDto } from '../types/tier.dto';
import { toTier, toTierList, toTierRequestDto } from './tier.mapper';

const dto = (externalId: string, name: string, minPoints: number): TierDto => ({
  externalId,
  name,
  minPoints,
});

describe('tier mapper', () => {
  it('maps the external id to the tier id', () => {
    expect(toTier(dto('abc-1', 'ORO', 3000))).toEqual({
      id: 'abc-1',
      name: 'ORO',
      minPoints: 3000,
    });
  });

  it('lists the tiers from the fewest points to the most', () => {
    const tiers = toTierList([
      dto('3', 'ORO', 3000),
      dto('1', 'BRONCE', 0),
      dto('2', 'PLATA', 1000),
    ]);

    expect(tiers.map((tier) => tier.name)).toEqual(['BRONCE', 'PLATA', 'ORO']);
  });

  it('builds the request body with a trimmed name', () => {
    expect(toTierRequestDto({ name: '  Platino  ', minPoints: 5000 })).toEqual({
      name: 'Platino',
      minPoints: 5000,
    });
  });
});
