import { HttpErrorResponse } from '@angular/common/http';
import { REDEEM_ERROR_MESSAGE, toRedeemErrorMessage } from './redeem-error';

/** The ProblemDetail GlobalExceptionHandler sends for a domain exception. */
function problem(status: number, detail: string): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: { title: 'Error', status, detail } });
}

describe('toRedeemErrorMessage', () => {
  it.each([
    [422, 'Client does not have enough points', 'No tienes puntos suficientes para este beneficio.'],
    [409, 'Benefit is sold out', 'Este beneficio ya no tiene canjes disponibles.'],
    [422, 'Benefit has expired', 'Este beneficio venció.'],
    [422, 'Benefit is not available yet', 'Este beneficio todavía no está disponible.'],
    [422, 'Benefit requires a higher tier', 'Este beneficio es para un nivel superior.'],
    [422, 'Benefit is not enabled', 'Este beneficio no está disponible por el momento.'],
  ])('explains the backend %s "%s"', (status, message, expected) => {
    expect(toRedeemErrorMessage(problem(status, message))).toBe(expected);
  });

  it('ignores the letter case of the backend message', () => {
    expect(toRedeemErrorMessage(problem(422, 'BENEFIT HAS EXPIRED'))).toBe('Este beneficio venció.');
  });

  it('explains a 404 for a missing benefit', () => {
    const error = problem(404, 'Benefit not found');

    expect(toRedeemErrorMessage(error)).toBe('No encontramos este beneficio.');
  });

  it('tells a missing client apart from a missing benefit', () => {
    const expected =
      'No pudimos identificar tu cuenta. Vuelve a iniciar sesión e inténtalo de nuevo.';

    expect(toRedeemErrorMessage(problem(403, 'The current user has no client profile'))).toBe(
      expected,
    );
    expect(toRedeemErrorMessage(problem(403, '  THE CURRENT USER HAS NO CLIENT PROFILE '))).toBe(
      expected,
    );
    expect(toRedeemErrorMessage(problem(404, 'Benefit not found'))).not.toBe(expected);
  });

  it('keeps the benefit message for any other 404 body', () => {
    for (const error of [{ detail: 'Redemption not found' }, { detail: '' }, null, 'Cafe not found', { x: 1 }]) {
      expect(toRedeemErrorMessage(new HttpErrorResponse({ status: 404, error }))).toBe(
        'No encontramos este beneficio.',
      );
    }
  });

  it('falls back for a rule with an unknown message', () => {
    expect(toRedeemErrorMessage(problem(422, 'Something new'))).toBe(REDEEM_ERROR_MESSAGE);
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
