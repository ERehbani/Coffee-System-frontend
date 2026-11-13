import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

export const CHECKOUT_ERROR_MESSAGE =
  'No pudimos confirmar tu pago. Revisá tu conexión e intentá de nuevo.';

const EMPTY_CART_MESSAGE =
  'No encontramos productos en tu carrito. Volvé a agregarlos desde el catálogo e intentá de nuevo.';
const NOT_FOUND_MESSAGE =
  'No encontramos tu carrito o alguno de sus productos. Revisá tu pedido e intentá de nuevo.';
const FORBIDDEN_MESSAGE =
  'Este carrito no pertenece a tu cuenta. Volvé a iniciar sesión e intentá de nuevo.';

const MESSAGES_BY_BACKEND_ERROR: ReadonlyMap<string, string> = new Map([
  ['cart cannot be empty', EMPTY_CART_MESSAGE],
]);

function backendError(body: unknown): string | null {
  if (typeof body === 'string') {
    return body.trim().toLowerCase();
  }
  if (typeof body !== 'object' || body === null || !('error' in body)) {
    return null;
  }
  return typeof body.error === 'string' ? body.error.trim().toLowerCase() : null;
}

function toBadRequestMessage(body: unknown): string {
  const message = backendError(body);
  return (message && MESSAGES_BY_BACKEND_ERROR.get(message)) ?? CHECKOUT_ERROR_MESSAGE;
}

export function toCheckoutErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return CHECKOUT_ERROR_MESSAGE;
  }
  if (error.status === HttpStatusCode.BadRequest) {
    return toBadRequestMessage(error.error);
  }
  if (error.status === HttpStatusCode.NotFound) {
    return NOT_FOUND_MESSAGE;
  }
  if (error.status === HttpStatusCode.Forbidden) {
    return FORBIDDEN_MESSAGE;
  }
  return CHECKOUT_ERROR_MESSAGE;
}
