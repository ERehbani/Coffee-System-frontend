import { HttpErrorResponse } from '@angular/common/http';

export const REDEEM_ERROR_MESSAGE = 'No pudimos activar este beneficio. Inténtalo de nuevo.';

const NOT_FOUND_MESSAGE = 'No encontramos este beneficio.';
const CLIENT_NOT_FOUND_MESSAGE =
  'No pudimos identificar tu cuenta. Vuelve a iniciar sesión e inténtalo de nuevo.';

/**
 * Backend messages of `POST /redemption` (RedemptionService), lower-cased. They arrive as
 * `{ error, status }` in a 400 body (IllegalStateException).
 */
const MESSAGES_BY_BACKEND_ERROR: ReadonlyMap<string, string> = new Map([
  ['client does not have enough points', 'No tienes puntos suficientes para este beneficio.'],
  ['benefit has no available redemptions', 'Este beneficio ya no tiene canjes disponibles.'],
  ['benefit has expired', 'Este beneficio venció.'],
  ['benefit is not available yet', 'Este beneficio todavía no está disponible.'],
  ['benefit requires a higher tier', 'Este beneficio es para un nivel superior.'],
  ['benefit is not enabled', 'Este beneficio no está disponible por el momento.'],
]);

/**
 * The backend message of an error body, trimmed and lower-cased. It is `{ error, status }` for a
 * 400 and a plain string for a 404 (EntityNotFoundException).
 */
function backendError(body: unknown): string | null {
  if (typeof body === 'string') {
    return body.trim().toLowerCase();
  }
  if (typeof body !== 'object' || body === null || !('error' in body)) {
    return null;
  }
  return typeof body.error === 'string' ? body.error.trim().toLowerCase() : null;
}

/** Spanish copy for a rejected redemption; anything unrecognised gets the generic message. */
export function toRedeemErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return REDEEM_ERROR_MESSAGE;
  }
  if (error.status === 404) {
    return backendError(error.error) === 'client not found'
      ? CLIENT_NOT_FOUND_MESSAGE
      : NOT_FOUND_MESSAGE;
  }
  const message = error.status === 400 ? backendError(error.error) : null;
  return (message && MESSAGES_BY_BACKEND_ERROR.get(message)) ?? REDEEM_ERROR_MESSAGE;
}
