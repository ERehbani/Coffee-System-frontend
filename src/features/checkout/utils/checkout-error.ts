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
const TWO_FOR_ONE_MESSAGE = `El 2x1 necesita al menos dos unidades del producto en el carrito. ${COUPON_RETRY_HINT}`;
const COUPON_PRODUCT_NOT_SOLD_MESSAGE = `Esta cafetería no vende el producto de ese cupón. ${COUPON_RETRY_HINT}`;
const PRODUCT_UNAVAILABLE_MESSAGE =
  'Alguno de los productos de tu carrito se agotó por hoy o ya no está disponible. Quitalo e intentá de nuevo.';

/**
 * ProblemDetail `detail` of `POST /purchases` (PurchaseService, CartEntity, CafeProductEntity, BenefitRules):
 * 400 cart errors, 403 coupon of another client, 404 unknown code, 409 product unavailable, 422 coupon rules.
 * Some details carry a product name or a benefit type, so they are matched by pattern.
 */
const MESSAGES_BY_BACKEND_DETAIL: readonly (readonly [RegExp, string])[] = [
  [/^cart cannot be empty$/i, EMPTY_CART_MESSAGE],
  [/^invalid code$/i, INVALID_COUPON_MESSAGE],
  [/^code already used$/i, USED_COUPON_MESSAGE],
  [/^this code does not belong to this cafe$/i, OTHER_CAFE_COUPON_MESSAGE],
  [/^this code belongs to another client$/i, OTHER_CLIENT_COUPON_MESSAGE],
  [/^the benefit type \S+ cannot be applied$/i, NOT_APPLICABLE_COUPON_MESSAGE],
  [/^the 2x1 needs at least two units of the product in the cart$/i, TWO_FOR_ONE_MESSAGE],
  [/^this cafe does not sell /i, COUPON_PRODUCT_NOT_SOLD_MESSAGE],
  [/^product .+ is (sold out for today|not available)$/i, PRODUCT_UNAVAILABLE_MESSAGE],
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
