import { HttpErrorResponse } from '@angular/common/http';
import {
  CartMismatchError,
  CHECKOUT_ERROR_MESSAGE,
  toCheckoutErrorMessage,
} from './checkout-error';

describe('toCheckoutErrorMessage', () => {
  const emptyCartMessage =
    'No encontramos productos en tu carrito. Volvé a agregarlos desde el catálogo e intentá de nuevo.';

  it('explains an empty cart, sent by the backend as plain text', () => {
    const error = new HttpErrorResponse({ status: 400, error: 'Cart cannot be empty' });

    expect(toCheckoutErrorMessage(error)).toBe(emptyCartMessage);
  });

  it('ignores the letter case and the spaces of the backend message', () => {
    const error = new HttpErrorResponse({ status: 400, error: '  CART CANNOT BE EMPTY ' });

    expect(toCheckoutErrorMessage(error)).toBe(emptyCartMessage);
  });

  it('falls back for a 400 with an unknown message in the { error, status } shape', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { error: 'Something else', status: 400 },
    });

    expect(toCheckoutErrorMessage(error)).toBe(CHECKOUT_ERROR_MESSAGE);
  });

  describe('coupon rejections', () => {
    const retryHint = 'Quitalo para pagar sin cupón o elegí otro.';

    it('explains a code the backend does not know, sent as a 404 with plain text', () => {
      const error = new HttpErrorResponse({ status: 404, error: 'Invalid code' });

      expect(toCheckoutErrorMessage(error)).toBe(`No encontramos ese cupón. ${retryHint}`);
    });

    it('does not mistake an invalid code for a missing cart', () => {
      const error = new HttpErrorResponse({ status: 404, error: 'Invalid code' });

      expect(toCheckoutErrorMessage(error)).not.toContain('carrito');
    });

    it('explains a coupon that was already used', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: { error: 'Code already used', status: 400 },
      });

      expect(toCheckoutErrorMessage(error)).toBe(`Ese cupón ya fue usado. ${retryHint}`);
    });

    it('explains a coupon of another cafe', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: { error: 'This code does not belong to this cafe', status: 400 },
      });

      expect(toCheckoutErrorMessage(error)).toBe(
        `Ese cupón es de otra cafetería y no se puede usar acá. ${retryHint}`,
      );
    });

    it('explains a coupon type that cannot be applied to a purchase', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: { error: 'This benefit type cannot be applied to a purchase', status: 400 },
      });

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
    for (const body of ['Cart not found', 'Product not found', 'Client not found']) {
      expect(toCheckoutErrorMessage(new HttpErrorResponse({ status: 404, error: body }))).toBe(
        'No encontramos tu carrito o alguno de sus productos. Revisá tu pedido e intentá de nuevo.',
      );
    }
  });

  it('explains a cart that belongs to another client', () => {
    const error = new HttpErrorResponse({ status: 403, error: { error: 'Access denied' } });

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
