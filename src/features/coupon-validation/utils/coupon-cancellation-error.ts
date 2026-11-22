import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ValidationFailure } from '../types/coupon-validation.model';

export const CANCELLATION_ERROR_MESSAGE = 'No pudimos cancelar el canje. Probá de nuevo.';

const MESSAGES_BY_STATUS: ReadonlyMap<number, string> = new Map([
  [
    0,
    'No pudimos confirmar la cancelación por un problema de conexión. Volvé a intentarlo: si ya se había cancelado, te lo vamos a avisar.',
  ],
  [HttpStatusCode.Unauthorized, 'Tu sesión expiró. Volvé a iniciar sesión.'],
  [HttpStatusCode.Forbidden, 'Este cupón es de otra cafetería: no lo podés cancelar.'],
  [
    HttpStatusCode.Conflict,
    'Este canje ya se usó o ya estaba cancelado, así que no se puede cancelar.',
  ],
  [HttpStatusCode.UnprocessableEntity, 'El cupón está vencido: ya no se puede cancelar.'],
]);

export function toCancellationFailure(error: unknown): ValidationFailure {
  if (!(error instanceof HttpErrorResponse)) {
    return { kind: 'not-cancelled', message: CANCELLATION_ERROR_MESSAGE };
  }
  if (error.status === HttpStatusCode.NotFound) {
    return { kind: 'not-found' };
  }
  return {
    kind: 'not-cancelled',
    message: MESSAGES_BY_STATUS.get(error.status) ?? CANCELLATION_ERROR_MESSAGE,
  };
}
