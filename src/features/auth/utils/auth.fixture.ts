import { TOKEN_KEY } from '../services/auth.service';
import { TokenPayload } from '../types/auth.model';

const ONE_HOUR_IN_SECONDS = 60 * 60;

function toBase64Url(value: object): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function createTestToken(overrides: Partial<TokenPayload> = {}): string {
  const payload: TokenPayload = {
    sub: 'user@test.com',
    roles: ['ROLE_CLIENTE'],
    exp: Math.floor(Date.now() / 1000) + ONE_HOUR_IN_SECONDS,
    ...overrides,
  };
  return `${toBase64Url({ alg: 'HS256' })}.${toBase64Url(payload)}.signature`;
}

export function storeTestSession(roles: string[]): void {
  localStorage.setItem(TOKEN_KEY, createTestToken({ roles }));
}

export function clearTestSession(): void {
  localStorage.removeItem(TOKEN_KEY);
}
