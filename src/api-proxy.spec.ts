import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import type { IncomingHttpHeaders } from 'node:http';
import { createApiProxy, resolveApiUrl } from './api-proxy';

describe('resolveApiUrl', () => {
  it('uses API_URL when it is set', () => {
    expect(resolveApiUrl({ API_URL: 'https://api.test', NODE_ENV: 'production' })).toBe('https://api.test');
  });

  it('falls back to the local back outside production', () => {
    expect(resolveApiUrl({})).toBe('http://localhost:8080');
  });

  it('fails in production when API_URL is missing', () => {
    expect(() => resolveApiUrl({ NODE_ENV: 'production' })).toThrow('API_URL es obligatoria en producción');
  });
});

describe('createApiProxy', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('does not forward the expect header to the api', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const res = fakeResponse();

    const request = fakeRequest({ expect: '100-continue', 'content-type': 'application/json' });
    createApiProxy('http://api.test')(request, res as unknown as ExpressResponse);

    await vi.waitFor(() => expect(res.send).toHaveBeenCalled());
    const sentHeaders: Headers = fetchMock.mock.calls[0][1].headers;
    expect(sentHeaders.has('expect')).toBe(false);
    expect(sentHeaders.get('content-type')).toBe('application/json');
  });
});

function fakeRequest(headers: IncomingHttpHeaders): ExpressRequest {
  return { method: 'POST', url: '/auth/login', headers, body: Buffer.from('{}') } as unknown as ExpressRequest;
}

function fakeResponse() {
  const res = { setHeader: vi.fn(), status: vi.fn(), send: vi.fn(), end: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}
