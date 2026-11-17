import { Tier } from '../types/tier.model';

export const TIERS_FIXTURE: readonly Tier[] = [
  { id: 'tier-bronce', name: 'BRONCE', minPoints: 0 },
  { id: 'tier-plata', name: 'PLATA', minPoints: 1000 },
  { id: 'tier-oro', name: 'ORO', minPoints: 3000 },
  { id: 'tier-diamante', name: 'DIAMANTE', minPoints: 7000 },
];
