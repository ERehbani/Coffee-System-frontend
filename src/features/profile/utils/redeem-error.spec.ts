import { HttpErrorResponse } from '@angular/common/http';
import { REDEEM_ERROR_MESSAGE, toRedeemErrorMessage } from './redeem-error';

/** The shape GlobalExceptionHandler gives to IllegalStateException: 400 `{ error, status }`. */
function badRequest(message: string): HttpErrorResponse {
  return new HttpErrorResponse({ status: 400, error: { error: message, status: 400 } });
}

describe('toRedeemErrorMessage', () => {
  it.each([
    ['Client does not have enough points', 'No tienes puntos suficientes para este beneficio.'],
    ['Benefit has no available redemptions', 'Este beneficio ya no tiene canjes disponibles.'],
    ['Benefit has expired', 'Este beneficio venció.'],
    ['Benefit is not available yet', 'Este beneficio todavía no está disponible.'],
    ['Benefit requires a higher tier', 'Este beneficio es para un nivel superior.'],
    ['Benefit is not enabled', 'Este beneficio no está disponible por el momento.'],
  ])('explains the backend message "%s"', (message, expected) => {
    expect(toRedeemErrorMessage(badRequest(message))).toBe(expected);
  });

  it('ignores the letter case of the backend message', () => {
    expect(toRedeemErrorMessage(badRequest('BENEFIT HAS EXPIRED'))).toBe('Este beneficio venció.');
  });

  it('explains a 404 whatever its plain-text body says', () => {
    const error = new HttpErrorResponse({ status: 404, error: 'Benefit not found' });

    expect(toRedeemErrorMessage(error)).toBe('No encontramos este beneficio.');
  });

  it('falls back for a 400 with an unknown message', () => {
    expect(toRedeemErrorMessage(badRequest('Something new'))).toBe(REDEEM_ERROR_MESSAGE);
  });

  it('falls back for a 400 with a plain-text or empty body', () => {
    expect(
      toRedeemErrorMessage(new HttpErrorResponse({ status: 400, error: 'Cart has no products' })),
    ).toBe(REDEEM_ERROR_MESSAGE);
    expect(toRedeemErrorMessage(new HttpErrorResponse({ status: 400, error: null }))).toBe(
      REDEEM_ERROR_MESSAGE,
    );
  });

  it('falls back for network failures and server errors', () => {
    expect(toRedeemErrorMessage(new HttpErrorResponse({ status: 0 }))).toBe(REDEEM_ERROR_MESSAGE);
    expect(toRedeemErrorMessage(new HttpErrorResponse({ status: 500 }))).toBe(REDEEM_ERROR_MESSAGE);
  });

  it('falls back for anything that is not an HTTP error', () => {
    expect(toRedeemErrorMessage(new Error('boom'))).toBe(REDEEM_ERROR_MESSAGE);
    expect(toRedeemErrorMessage(undefined)).toBe(REDEEM_ERROR_MESSAGE);
    expect(toRedeemErrorMessage('Benefit has expired')).toBe(REDEEM_ERROR_MESSAGE);
  });

  it('uses a generic message that does not blame the points', () => {
    expect(REDEEM_ERROR_MESSAGE).toBe('No pudimos activar este beneficio. Inténtalo de nuevo.');
  });
});
