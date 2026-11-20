import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { backendErrorMessage } from '../../../shared/utils/backend-error';

export const CHECKOUT_ERROR_MESSAGE =
  'No pudimos confirmar tu pago. Revisá tu conexión e intentá de nuevo.';

const EMPTY_CART_MESSAGE =
  'No encontramos productos en tu carrito. Volvé a agregarlos desde el catálogo e intentá de nuevo.';
const NOT_FOUND_MESSAGE =
  'No encontramos tu carrito o alguno de sus productos. Revisá tu pedido e intentá de nuevo.';
const FORBIDDEN_MESSAGE =
  'Este carrito no pertenece a tu cuenta. Volvé a iniciar sesión e intentá de nuevo.';

const CART_MISMATCH_MESSAGE =
  'Tu carrito cambió desde que lo armaste. Vacialo y volvé a agregar los productos para ver el total actualizado.';

export class CartMismatchError extends Error {}

const COUPON_RETRY_HINT = 'Quitalo para pagar sin cupón o elegí otro.';
const INVALID_COUPON_MESSAGE = `No encontramos ese cupón. ${COUPON_RETRY_HINT}`;
const USED_COUPON_MESSAGE = `Ese cupón ya fue usado. ${COUPON_RETRY_HINT}`;
const OTHER_CAFE_COUPON_MESSAGE = `Ese cupón es de otra cafetería y no se puede usar acá. ${COUPON_RETRY_HINT}`;
const NOT_APPLICABLE_COUPON_MESSAGE = `Ese tipo de cupón no se puede aplicar a una compra. ${COUPON_RETRY_HINT}`;
const OTHER_CLIENT_COUPON_MESSAGE = `Ese cupón es de otra cuenta. ${COUPON_RETRY_HINT}`;
const NO_CLIENT_PROFILE_MESSAGE =
  'No pudimos identificar tu cuenta de cliente. Volvé a iniciar sesión e intentá de nuevo.';
const TWO_FOR_ONE_MESSAGE = `El 2x1 necesita al menos dos unidades del producto en el carrito. ${COUPON_RETRY_HINT}`;
const COUPON_PRODUCT_NOT_SOLD_MESSAGE = `Esta cafetería no vende el producto de ese cupón. ${COUPON_RETRY_HINT}`;
const COUPON_PRODUCT_SOLD_OUT_MESSAGE = `El producto de regalo de ese cupón se agotó por hoy. ${COUPON_RETRY_HINT}`;
const EXPIRED_COUPON_MESSAGE = `Ese cupón está vencido. ${COUPON_RETRY_HINT}`;
const PRODUCT_UNAVAILABLE_MESSAGE =
  'Alguno de los productos de tu carrito se agotó por hoy o ya no está disponible. Quitalo e intentá de nuevo.';
const CAFE_CLOSED_MESSAGE =
  'La cafetería está cerrada en este momento. Vas a poder pagar tu pedido cuando vuelva a abrir.';

const MESSAGES_BY_BACKEND_DETAIL: readonly (readonly [RegExp, string])[] = [
  [/^the cafe is closed right now$/i, CAFE_CLOSED_MESSAGE],
  [/^el carrito no puede estar vacío$/i, EMPTY_CART_MESSAGE],
  [/^código inválido$/i, INVALID_COUPON_MESSAGE],
  [/^el código ya fue usado$/i, USED_COUPON_MESSAGE],
  [/^el código está vencido$/i, EXPIRED_COUPON_MESSAGE],
  [/^este código no pertenece a esta cafetería$/i, OTHER_CAFE_COUPON_MESSAGE],
  [/^este código pertenece a otro cliente$/i, OTHER_CLIENT_COUPON_MESSAGE],
  [/^el usuario actual no tiene perfil de cliente$/i, NO_CLIENT_PROFILE_MESSAGE],
  [/^el tipo de beneficio \S+ no se puede aplicar$/i, NOT_APPLICABLE_COUPON_MESSAGE],
  [/^el 2x1 necesita al menos dos unidades del producto en el carrito$/i, TWO_FOR_ONE_MESSAGE],
  [/^esta cafetería no vende /i, COUPON_PRODUCT_NOT_SOLD_MESSAGE],
  [/^el producto del cupón .+ está agotado por hoy$/i, COUPON_PRODUCT_SOLD_OUT_MESSAGE],
  [/^el producto .+ (está agotado por hoy|no está disponible)$/i, PRODUCT_UNAVAILABLE_MESSAGE],
];

function messageForBackendDetail(error: HttpErrorResponse): string | undefined {
  const detail = backendErrorMessage(error)?.trim();
  return detail ? MESSAGES_BY_BACKEND_DETAIL.find(([pattern]) => pattern.test(detail))?.[1] : undefined;
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
  if (error instanceof CartMismatchError) {
    return CART_MISMATCH_MESSAGE;
  }
  if (!(error instanceof HttpErrorResponse)) {
    return CHECKOUT_ERROR_MESSAGE;
  }
  return messageForBackendDetail(error) ?? messageForStatus(error.status);
}
