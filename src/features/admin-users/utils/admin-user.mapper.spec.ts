import { toAdminUser } from './admin-user.mapper';

describe('toAdminUser', () => {
  const backendUser = {
    externalId: 'user-1',
    email: 'cliente@test.com',
    state: true,
  };

  it('uses the creation date sent by the backend', () => {
    const user = toAdminUser({ ...backendUser, creationDate: '2025-03-10T14:30:00.000+00:00' });

    expect(user.createdAt).toEqual(new Date('2025-03-10T14:30:00.000Z'));
  });

  it('leaves the creation date empty instead of using today when the backend does not send it', () => {
    const user = toAdminUser(backendUser);

    expect(user.createdAt).toBeNull();
  });
});
