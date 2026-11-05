import { TokenPayload } from '../types/auth.model';

export function decodeToken(token: string): TokenPayload | null {
  const payloadPart = token.split('.')[1];
  if (!payloadPart) {
    return null;
  }

  try {
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as TokenPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(payload: TokenPayload, now = Date.now()): boolean {
  return payload.exp * 1000 <= now;
}
