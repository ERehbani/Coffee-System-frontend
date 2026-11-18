import { AdminClient } from '../types/admin-client.model';

export function buildAdminClient(overrides: Partial<AdminClient> = {}): AdminClient {
  return {
    id: 'client-1',
    displayName: 'Ana Pérez',
    initials: 'AP',
    firstName: 'Ana',
    lastName: 'Pérez',
    email: 'ana@test.com',
    phone: null,
    photoUrl: null,
    currentPoints: 0,
    historicalPoints: 0,
    spentPoints: 0,
    tierName: 'BRONCE',
    status: 'active',
    createdAt: new Date('2026-11-14T19:32:30'),
    ...overrides,
  };
}
