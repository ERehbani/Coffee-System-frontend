import { createTestToken } from './auth.fixture';
import { decodeToken, isTokenExpired } from './jwt';

describe('decodeToken', () => {
  it('reads the email, the roles and the expiration from the token', () => {
    const token = createTestToken({ sub: 'ana@test.com', roles: ['ROLE_CAFETERIA'], exp: 2000000000 });

    expect(decodeToken(token)).toEqual({
      sub: 'ana@test.com',
      roles: ['ROLE_CAFETERIA'],
      exp: 2000000000,
    });
  });

  it('reads accents and special characters', () => {
    const token = createTestToken({ sub: 'josé@café.com' });

    expect(decodeToken(token)?.sub).toBe('josé@café.com');
  });

  it('returns null when the token has no payload', () => {
    expect(decodeToken('not-a-token')).toBeNull();
  });

  it('returns null when the payload is not valid json', () => {
    expect(decodeToken('header.@@@.signature')).toBeNull();
  });
});

describe('isTokenExpired', () => {
  const now = Date.UTC(2026, 10, 4, 12, 0, 0);
  const nowInSeconds = now / 1000;

  it('is false when the expiration is in the future', () => {
    expect(isTokenExpired({ sub: 'a', roles: [], exp: nowInSeconds + 60 }, now)).toBe(false);
  });

  it('is true when the expiration already passed', () => {
    expect(isTokenExpired({ sub: 'a', roles: [], exp: nowInSeconds - 60 }, now)).toBe(true);
  });

  it('is true when the expiration is exactly now', () => {
    expect(isTokenExpired({ sub: 'a', roles: [], exp: nowInSeconds }, now)).toBe(true);
  });
});
