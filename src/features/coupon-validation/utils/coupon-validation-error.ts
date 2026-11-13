import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ValidationFailure } from '../types/coupon-validation.model';

export const VALIDATION_ERROR_MESSAGE = 'No pudimos validar el cupón. Probá de nuevo.';

const ALREADY_USED = 'this code has already been used';
const NOT_FOUND = 'redemption not found';
const SERVER_ERROR_MESSAGE =
  'El servidor no pudo validar el cupón. Probá de nuevo en unos minutos.';

const MESSAGES_BY_BACKEND_ERROR: ReadonlyMap<string, string> = new Map([
  [
    'this redemption does not belong to your cafe',
    'Este cupón es de otra cafetería, no se puede canjear en este local.',
  ],
  [
    'only admin can validate global benefits',
    'Este cupón es de un beneficio global y solo lo puede validar un administrador.',
  ],
  ['cafe not found', 'Tu usuario no tiene una cafetería asociada. Consultá con el administrador.'],
]);

const MESSAGES_BY_STATUS: ReadonlyMap<number, string> = new Map([
  [
    0,
    'No pudimos confirmar la validación por un problema de conexión. Volvé a escanear el cupón: si ya se había validado, va a aparecer como usado.',
  ],
  [HttpStatusCode.Unauthorized, 'Tu sesión expiró. Volvé a iniciar sesión.'],
  [HttpStatusCode.Forbidden, 'Tu usuario no tiene permiso para validar cupones.'],
]);

function backendMessage(body: unknown): string | null {
  if (typeof body === 'string') {
    return body.trim().toLowerCase();
  }
  if (typeof body !== 'object' || body === null || !('error' in body)) {
    return null;
  }
  return typeof body.error === 'string' ? body.error.trim().toLowerCase() : null;
}

function rejectionMessage(status: number, message: string | null): string {
  const byBackend = message ? MESSAGES_BY_BACKEND_ERROR.get(message) : undefined;
  const byStatus = MESSAGES_BY_STATUS.get(status);
  const fallback = status >= 500 ? SERVER_ERROR_MESSAGE : VALIDATION_ERROR_MESSAGE;
  return byBackend ?? byStatus ?? fallback;
}

export function toValidationFailure(error: unknown): ValidationFailure {
  if (!(error instanceof HttpErrorResponse)) {
    return { kind: 'rejected', message: VALIDATION_ERROR_MESSAGE };
  }
  const message = backendMessage(error.error);
  if (error.status === HttpStatusCode.NotFound && message === NOT_FOUND) {
    return { kind: 'not-found' };
  }
  if (error.status === HttpStatusCode.BadRequest && message === ALREADY_USED) {
    return { kind: 'used' };
  }
  return { kind: 'rejected', message: rejectionMessage(error.status, message) };
}
