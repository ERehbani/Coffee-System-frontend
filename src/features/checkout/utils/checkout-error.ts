import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

export const CHECKOUT_ERROR_MESSAGE =
  'No pudimos confirmar tu pago. Revisá tu conexión e intentá de nuevo.';

const EMPTY_CART_MESSAGE =
  'No encontramos productos en tu carrito. Volvé a agregarlos desde el catálogo e intentá de nuevo.';
const NOT_FOUND_MESSAGE =
  'No encontramos tu carrito o alguno de sus productos. Revisá tu pedido e intentá de nuevo.';
const FORBIDDEN_MESSAGE =
  'Este carrito no pertenece a tu cuenta. Volvé a iniciar sesión e intentá de nuevo.';

const COUPON_RETRY_HINT = 'Quitalo para pagar sin cupón o elegí otro.';
const INVALID_COUPON_MESSAGE = `No encontramos ese cupón. ${COUPON_RETRY_HINT}`;
const USED_COUPON_MESSAGE = `Ese cupón ya fue usado. ${COUPON_RETRY_HINT}`;
const OTHER_CAFE_COUPON_MESSAGE = `Ese cupón es de otra cafetería y no se puede usar acá. ${COUPON_RETRY_HINT}`;
const NOT_APPLICABLE_COUPON_MESSAGE = `Ese tipo de cupón no se puede aplicar a una compra. ${COUPON_RETRY_HINT}`;

const MESSAGES_BY_BACKEND_ERROR: ReadonlyMap<string, string> = new Map([
  ['cart cannot be empty', EMPTY_CART_MESSAGE],
  ['invalid code', INVALID_COUPON_MESSAGE],
  ['code already used', USED_COUPON_MESSAGE],
  ['this code does not belong to this cafe', OTHER_CAFE_COUPON_MESSAGE],
  ['this benefit type cannot be applied to a purchase', NOT_APPLICABLE_COUPON_MESSAGE],
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

function messageForBackendError(body: unknown): string | undefined {
  const message = backendError(body);
  return message ? MESSAGES_BY_BACKEND_ERROR.get(message) : undefined;
}

function messageForStatus(status: number): string {
  if (status === HttpStatusCode.NotFound) {
    return NOT_FOUND_MESSAGE;
  }
  if (status === HttpStatusCode.Forbidden) {
    return FORBIDDEN_MESSAGE;
  }
  return CHECKOUT_ERROR_MESSAGE;
}

export function toCheckoutErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return CHECKOUT_ERROR_MESSAGE;
  }
  return messageForBackendError(error.error) ?? messageForStatus(error.status);
}
