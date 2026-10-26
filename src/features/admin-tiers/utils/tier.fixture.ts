import { Tier } from '../types/tier.model';

/** Mirrors the tiers the backend seeds. BRONCE (0 points) is the base tier every client starts on. */
export const TIERS_FIXTURE: readonly Tier[] = [
  { id: 'tier-bronce', name: 'BRONCE', minPoints: 0 },
  { id: 'tier-plata', name: 'PLATA', minPoints: 1000 },
  { id: 'tier-oro', name: 'ORO', minPoints: 3000 },
  { id: 'tier-diamante', name: 'DIAMANTE', minPoints: 7000 },
];
