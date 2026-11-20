import { HttpErrorResponse } from '@angular/common/http';
import {
  CartMismatchError,
  CHECKOUT_ERROR_MESSAGE,
  toCheckoutErrorMessage,
} from './checkout-error';

describe('toCheckoutErrorMessage', () => {
  const emptyCartMessage =
    'No encontramos productos en tu carrito. Volvé a agregarlos desde el catálogo e intentá de nuevo.';

  function problem(status: number, detail: string): HttpErrorResponse {
    return new HttpErrorResponse({ status, error: { title: 'Error', status, detail } });
  }

  it('explains an empty cart, sent by the backend as a 400 problem detail', () => {
    const error = problem(400, 'El carrito no puede estar vacío');

    expect(toCheckoutErrorMessage(error)).toBe(emptyCartMessage);
  });

  it('ignores the letter case and the spaces of the backend message', () => {
    const error = problem(400, '  EL CARRITO NO PUEDE ESTAR VACÍO ');

    expect(toCheckoutErrorMessage(error)).toBe(emptyCartMessage);
  });

  it('explains a purchase rejected because the cafe is closed', () => {
    const error = problem(422, 'The cafe is closed right now');

    expect(toCheckoutErrorMessage(error)).toBe(
      'La cafetería está cerrada en este momento. Vas a poder pagar tu pedido cuando vuelva a abrir.',
    );
  });

  it('falls back for a rule with an unknown message', () => {
    const error = problem(422, 'Otro mensaje');

    expect(toCheckoutErrorMessage(error)).toBe(CHECKOUT_ERROR_MESSAGE);
  });

  describe('coupon rejections', () => {
    const retryHint = 'Quitalo para pagar sin cupón o elegí otro.';

    it('explains a code the backend does not know, sent as a 404', () => {
      const error = problem(404, 'Código inválido');

      expect(toCheckoutErrorMessage(error)).toBe(`No encontramos ese cupón. ${retryHint}`);
    });

    it('does not mistake an invalid code for a missing cart', () => {
      const error = problem(404, 'Código inválido');

      expect(toCheckoutErrorMessage(error)).not.toContain('carrito');
    });

    it('explains a coupon that was already used', () => {
      const error = problem(422, 'El código ya fue usado');

      expect(toCheckoutErrorMessage(error)).toBe(`Ese cupón ya fue usado. ${retryHint}`);
    });

    it('explains a coupon of another cafe', () => {
      const error = problem(422, 'Este código no pertenece a esta cafetería');

      expect(toCheckoutErrorMessage(error)).toBe(
        `Ese cupón es de otra cafetería y no se puede usar acá. ${retryHint}`,
      );
    });

    it('explains a coupon type that cannot be applied to a purchase', () => {
      const error = problem(422, 'El tipo de beneficio CODIGO_DESCUENTO no se puede aplicar');

      expect(toCheckoutErrorMessage(error)).toBe(
        `Ese tipo de cupón no se puede aplicar a una compra. ${retryHint}`,
      );
    });

    it.each([
      [403, 'Este código pertenece a otro cliente', `Ese cupón es de otra cuenta. ${retryHint}`],
      [422, 'El código está vencido', `Ese cupón está vencido. ${retryHint}`],
      [
        422,
        'El 2x1 necesita al menos dos unidades del producto en el carrito',
        `El 2x1 necesita al menos dos unidades del producto en el carrito. ${retryHint}`,
      ],
      [
        422,
        'Esta cafetería no vende Espresso',
        `Esta cafetería no vende el producto de ese cupón. ${retryHint}`,
      ],
      [
        409,
        'El producto del cupón Espresso está agotado por hoy',
        `El producto de regalo de ese cupón se agotó por hoy. ${retryHint}`,
      ],
    ])('explains the backend %s "%s"', (status, detail, expected) => {
      expect(toCheckoutErrorMessage(problem(status, detail))).toBe(expected);
    });
  });

  it.each([
    'El producto Espresso Doble está agotado por hoy',
    'El producto Espresso Doble no está disponible',
  ])('explains an unavailable product, "%s"', (detail) => {
    expect(toCheckoutErrorMessage(problem(409, detail))).toBe(
      'Alguno de los productos de tu carrito se agotó por hoy o ya no está disponible. Quitalo e intentá de nuevo.',
    );
  });

  it('explains a missing client profile', () => {
    expect(
      toCheckoutErrorMessage(problem(403, 'El usuario actual no tiene perfil de cliente')),
    ).toBe(
      'No pudimos identificar tu cuenta de cliente. Volvé a iniciar sesión e intentá de nuevo.',
    );
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
    for (const detail of [
      'Carrito no encontrado',
      'Producto no encontrado en el carrito',
      'Cliente no encontrado',
    ]) {
      expect(toCheckoutErrorMessage(problem(404, detail))).toBe(
        'No encontramos tu carrito o alguno de sus productos. Revisá tu pedido e intentá de nuevo.',
      );
    }
  });

  it('explains a cart that belongs to another client', () => {
    const error = problem(
      403,
      'Acceso denegado: solo puedes crear compras desde tu propio carrito',
    );

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
