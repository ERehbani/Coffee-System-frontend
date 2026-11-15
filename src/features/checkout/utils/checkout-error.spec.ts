import { HttpErrorResponse } from '@angular/common/http';
import {
  CartMismatchError,
  CHECKOUT_ERROR_MESSAGE,
  toCheckoutErrorMessage,
} from './checkout-error';

describe('toCheckoutErrorMessage', () => {
  const emptyCartMessage =
    'No encontramos productos en tu carrito. Volvé a agregarlos desde el catálogo e intentá de nuevo.';

  /** The ProblemDetail GlobalExceptionHandler sends for a domain exception. */
  function problem(status: number, detail: string): HttpErrorResponse {
    return new HttpErrorResponse({ status, error: { title: 'Error', status, detail } });
  }

  it('explains an empty cart, sent by the backend as a 400 problem detail', () => {
    const error = problem(400, 'Cart cannot be empty');

    expect(toCheckoutErrorMessage(error)).toBe(emptyCartMessage);
  });

  it('ignores the letter case and the spaces of the backend message', () => {
    const error = problem(400, '  CART CANNOT BE EMPTY ');

    expect(toCheckoutErrorMessage(error)).toBe(emptyCartMessage);
  });

  it('falls back for a rule with an unknown message', () => {
    const error = problem(422, 'Something else');

    expect(toCheckoutErrorMessage(error)).toBe(CHECKOUT_ERROR_MESSAGE);
  });

  describe('coupon rejections', () => {
    const retryHint = 'Quitalo para pagar sin cupón o elegí otro.';

    it('explains a code the backend does not know, sent as a 404', () => {
      const error = problem(404, 'Invalid code');

      expect(toCheckoutErrorMessage(error)).toBe(`No encontramos ese cupón. ${retryHint}`);
    });

    it('does not mistake an invalid code for a missing cart', () => {
      const error = problem(404, 'Invalid code');

      expect(toCheckoutErrorMessage(error)).not.toContain('carrito');
    });

    it('explains a coupon that was already used', () => {
      const error = problem(422, 'Code already used');

      expect(toCheckoutErrorMessage(error)).toBe(`Ese cupón ya fue usado. ${retryHint}`);
    });

    it('explains a coupon of another cafe', () => {
      const error = problem(422, 'This code does not belong to this cafe');

      expect(toCheckoutErrorMessage(error)).toBe(
        `Ese cupón es de otra cafetería y no se puede usar acá. ${retryHint}`,
      );
    });

    it('explains a coupon type that cannot be applied to a purchase', () => {
      const error = problem(422, 'The benefit type CODIGO_DESCUENTO cannot be applied');

      expect(toCheckoutErrorMessage(error)).toBe(
        `Ese tipo de cupón no se puede aplicar a una compra. ${retryHint}`,
      );
    });
  });

  it('falls back for a 400 without a readable body', () => {
    expect(toCheckoutErrorMessage(new HttpErrorResponse({ status: 400, error: null }))).toBe(
      CHECKOUT_ERROR_MESSAGE,
    );
    expect(toCheckoutErrorMessage(new HttpErrorResponse({ status: 400, error: { x: 1 } }))).toBe(
      CHECKOUT_ERROR_MESSAGE,
    );
  });

  it('explains a missing cart, client or product', () => {
    for (const detail of ['Cart not found', 'Product not found in cart', 'Client not found']) {
      expect(toCheckoutErrorMessage(problem(404, detail))).toBe(
        'No encontramos tu carrito o alguno de sus productos. Revisá tu pedido e intentá de nuevo.',
      );
    }
  });

  it('explains a cart that belongs to another client', () => {
    const error = problem(403, 'Access denied: You can only create purchases from your own cart');

    expect(toCheckoutErrorMessage(error)).toBe(
      'Este carrito no pertenece a tu cuenta. Volvé a iniciar sesión e intentá de nuevo.',
    );
  });

  it('falls back for network failures and server errors', () => {
    expect(toCheckoutErrorMessage(new HttpErrorResponse({ status: 0 }))).toBe(
      CHECKOUT_ERROR_MESSAGE,
    );
    expect(toCheckoutErrorMessage(new HttpErrorResponse({ status: 500 }))).toBe(
      CHECKOUT_ERROR_MESSAGE,
    );
  });

  it('explains a local cart that no longer matches the cart of the backend', () => {
    expect(toCheckoutErrorMessage(new CartMismatchError())).toBe(
      'Tu carrito cambió desde que lo armaste. Vacialo y volvé a agregar los productos para ver el total actualizado.',
    );
  });

  it('falls back for anything that is not an HTTP error', () => {
    expect(toCheckoutErrorMessage(new Error('boom'))).toBe(CHECKOUT_ERROR_MESSAGE);
    expect(toCheckoutErrorMessage(undefined)).toBe(CHECKOUT_ERROR_MESSAGE);
  });

  it('uses a generic message in Spanish', () => {
    expect(CHECKOUT_ERROR_MESSAGE).toBe(
      'No pudimos confirmar tu pago. Revisá tu conexión e intentá de nuevo.',
    );
  });
});
