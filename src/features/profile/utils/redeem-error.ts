import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { backendErrorMessage } from '../../../shared/utils/backend-error';

export const REDEEM_ERROR_MESSAGE = 'No pudimos activar este beneficio. Inténtalo de nuevo.';

const NOT_FOUND_MESSAGE = 'No encontramos este beneficio.';
const CLIENT_NOT_FOUND_MESSAGE =
  'No pudimos identificar tu cuenta. Vuelve a iniciar sesión e inténtalo de nuevo.';

/**
 * ProblemDetail `detail` of `POST /redemption` (RedemptionService, BenefitEntity), lower-cased:
 * 404 not found, 403 no client profile, 409 sold out, 422 business rules.
 */
const MESSAGES_BY_BACKEND_DETAIL: ReadonlyMap<string, string> = new Map([
  ['the current user has no client profile', CLIENT_NOT_FOUND_MESSAGE],
  ['client does not have enough points', 'No tienes puntos suficientes para este beneficio.'],
  ['benefit is sold out', 'Este beneficio ya no tiene canjes disponibles.'],
  ['benefit has expired', 'Este beneficio venció.'],
  ['benefit is not available yet', 'Este beneficio todavía no está disponible.'],
  ['benefit requires a higher tier', 'Este beneficio es para un nivel superior.'],
  ['benefit is not enabled', 'Este beneficio no está disponible por el momento.'],
  [
    'you already used this benefit the maximum number of times',
    'Ya usaste este beneficio la cantidad máxima de veces permitida.',
  ],
]);

/** Spanish copy for a rejected redemption; anything unrecognised gets the generic message. */
export function toRedeemErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return REDEEM_ERROR_MESSAGE;
  }
  const detail = backendErrorMessage(error)?.trim().toLowerCase();
  const message = detail ? MESSAGES_BY_BACKEND_DETAIL.get(detail) : undefined;
  if (message) {
    return message;
  }
  return error.status === HttpStatusCode.NotFound ? NOT_FOUND_MESSAGE : REDEEM_ERROR_MESSAGE;
}
