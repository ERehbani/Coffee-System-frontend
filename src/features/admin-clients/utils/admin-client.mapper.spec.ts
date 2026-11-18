import { AdminClientDto } from '../types/admin-client.dto';
import { toAdminClient } from './admin-client.mapper';

describe('toAdminClient', () => {
  const backendClient: AdminClientDto = {
    externalId: 'client-1',
    name: 'Ana',
    lastName: 'Pérez',
    phone: '1155551234',
    profilePhoto: null,
    currentPoints: 320,
    historicalPoints: 1250,
    tierExternalId: 'tier-1',
    tierName: 'PLATA',
    userExternalId: 'user-1',
    state: true,
    email: 'ana@test.com',
    creationDate: '2026-11-14T19:32:30',
  };

  it('joins the first and last name as the display name', () => {
    const client = toAdminClient(backendClient);

    expect(client.displayName).toBe('Ana Pérez');
    expect(client.initials).toBe('AP');
  });

  it('uses the email as the display name when the client has no name', () => {
    const client = toAdminClient({ ...backendClient, name: null, lastName: '  ' });

    expect(client.displayName).toBe('ana@test.com');
    expect(client.firstName).toBeNull();
    expect(client.lastName).toBeNull();
  });

  it('uses a generic name when the client has no name or email', () => {
    const client = toAdminClient({ ...backendClient, name: null, lastName: null, email: null });

    expect(client.displayName).toBe('Cliente sin nombre');
  });

  it('calculates the points used in redemptions', () => {
    const client = toAdminClient(backendClient);

    expect(client.currentPoints).toBe(320);
    expect(client.historicalPoints).toBe(1250);
    expect(client.spentPoints).toBe(930);
  });

  it('treats missing points as zero', () => {
    const client = toAdminClient({ ...backendClient, currentPoints: null, historicalPoints: null });

    expect(client.currentPoints).toBe(0);
    expect(client.historicalPoints).toBe(0);
    expect(client.spentPoints).toBe(0);
  });

  it('maps the state, tier and creation date', () => {
    const client = toAdminClient(backendClient);

    expect(client.status).toBe('active');
    expect(client.tierName).toBe('PLATA');
    expect(client.createdAt).toEqual(new Date('2026-11-14T19:32:30'));
  });

  it('marks the client as inactive when the backend state is false', () => {
    expect(toAdminClient({ ...backendClient, state: false }).status).toBe('inactive');
  });

  it('leaves the creation date empty when the backend does not send it', () => {
    expect(toAdminClient({ ...backendClient, creationDate: null }).createdAt).toBeNull();
  });
});
