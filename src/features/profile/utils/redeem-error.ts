import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { backendErrorMessage } from '../../../shared/utils/backend-error';

export const REDEEM_ERROR_MESSAGE = 'No pudimos activar este beneficio. Intentalo de nuevo.';

const NOT_FOUND_MESSAGE = 'No encontramos este beneficio.';
const CLIENT_NOT_FOUND_MESSAGE =
  'No pudimos identificar tu cuenta. Volvé a iniciar sesión e intentalo de nuevo.';

const MESSAGES_BY_BACKEND_DETAIL: ReadonlyMap<string, string> = new Map([
  ['el usuario actual no tiene perfil de cliente', CLIENT_NOT_FOUND_MESSAGE],
  ['el cliente no tiene puntos suficientes', 'No tenés puntos suficientes para este beneficio.'],
  ['el beneficio está agotado', 'Este beneficio ya no tiene canjes disponibles.'],
  ['el beneficio está vencido', 'Este beneficio venció.'],
  ['el beneficio todavía no está disponible', 'Este beneficio todavía no está disponible.'],
  ['el beneficio requiere un tier superior', 'Este beneficio es para un nivel superior.'],
  ['el beneficio no está habilitado', 'Este beneficio no está disponible por el momento.'],
  [
    'ya usaste este beneficio el máximo de veces permitido',
    'Ya usaste este beneficio la cantidad máxima de veces permitida.',
  ],
]);

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
