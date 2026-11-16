import { resolveApiUrl } from './api-proxy';

describe('resolveApiUrl', () => {
  it('uses API_URL when it is set', () => {
    expect(resolveApiUrl({ API_URL: 'https://api.test', NODE_ENV: 'production' })).toBe('https://api.test');
  });

  it('falls back to the local back outside production', () => {
    expect(resolveApiUrl({})).toBe('http://localhost:8080');
  });

  it('fails in production when API_URL is missing', () => {
    expect(() => resolveApiUrl({ NODE_ENV: 'production' })).toThrow('API_URL is required in production');
  });
});
