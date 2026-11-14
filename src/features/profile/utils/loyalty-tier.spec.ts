import { toTierLabel, toTierTextClass } from './loyalty-tier';

describe('loyalty tier', () => {
  it('labels the four original tiers in Spanish', () => {
    expect(['bronze', 'silver', 'gold', 'diamond'].map(toTierLabel)).toEqual([
      'BRONCE',
      'PLATA',
      'ORO',
      'DIAMANTE',
    ]);
  });

  it('gives each original tier its own color', () => {
    expect(['bronze', 'silver', 'gold', 'diamond'].map(toTierTextClass)).toEqual([
      'text-bronze',
      'text-silver',
      'text-gold',
      'text-diamond',
    ]);
  });

  it('labels a tier created by the admin with its own name', () => {
    expect(toTierLabel('Platino')).toBe('PLATINO');
  });

  it('falls back to the primary color for a tier created by the admin', () => {
    expect(toTierTextClass('Platino')).toBe('text-primary');
  });
});
