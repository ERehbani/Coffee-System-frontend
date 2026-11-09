import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import type { IncomingHttpHeaders } from 'node:http';

const SKIPPED_HEADERS = ['host', 'connection', 'content-length', 'transfer-encoding', 'content-encoding'];
const BAD_GATEWAY = 502;
const LOCAL_API_URL = 'http://localhost:8080';

export function resolveApiUrl(env: NodeJS.ProcessEnv): string {
  const apiUrl = env['API_URL'];
  if (apiUrl) {
    return apiUrl;
  }
  if (env['NODE_ENV'] === 'production') {
    throw new Error('API_URL is required in production');
  }
  return LOCAL_API_URL;
}

export function createApiProxy(apiUrl: string) {
  return (req: ExpressRequest, res: ExpressResponse): void => {
    forwardToApi(apiUrl, req, res).catch(() => res.status(BAD_GATEWAY).end());
  };
}

async function forwardToApi(apiUrl: string, req: ExpressRequest, res: ExpressResponse): Promise<void> {
  const response = await fetch(`${apiUrl}${req.url}`, {
    method: req.method,
    headers: toRequestHeaders(req.headers),
    body: readBody(req),
    redirect: 'manual',
  });
  copyResponseHeaders(response, res);
  res.status(response.status).send(Buffer.from(await response.arrayBuffer()));
}

function toRequestHeaders(incoming: IncomingHttpHeaders): Headers {
  const headers = new Headers();
  for (const [name, value] of Object.entries(incoming)) {
    if (value !== undefined && !SKIPPED_HEADERS.includes(name)) {
      headers.set(name, Array.isArray(value) ? value.join(', ') : value);
    }
  }
  return headers;
}

function readBody(req: ExpressRequest): ArrayBuffer | undefined {
  return Buffer.isBuffer(req.body) && req.body.length > 0 ? new Uint8Array(req.body).buffer : undefined;
}

function copyResponseHeaders(response: Response, res: ExpressResponse): void {
  response.headers.forEach((value, name) => {
    if (name !== 'set-cookie' && !SKIPPED_HEADERS.includes(name)) {
      res.setHeader(name, value);
    }
  });
  const cookies = response.headers.getSetCookie();
  if (cookies.length > 0) {
    res.setHeader('set-cookie', cookies);
  }
}
