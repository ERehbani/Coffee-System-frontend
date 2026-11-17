import { HttpErrorResponse } from '@angular/common/http';
import { REDEEM_ERROR_MESSAGE, toRedeemErrorMessage } from './redeem-error';

function problem(status: number, detail: string): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: { title: 'Error', status, detail } });
}

describe('toRedeemErrorMessage', () => {
  it.each([
    [422, 'El cliente no tiene puntos suficientes', 'No tienes puntos suficientes para este beneficio.'],
    [409, 'El beneficio está agotado', 'Este beneficio ya no tiene canjes disponibles.'],
    [422, 'El beneficio está vencido', 'Este beneficio venció.'],
    [422, 'El beneficio todavía no está disponible', 'Este beneficio todavía no está disponible.'],
    [422, 'El beneficio requiere un tier superior', 'Este beneficio es para un nivel superior.'],
    [422, 'El beneficio no está habilitado', 'Este beneficio no está disponible por el momento.'],
    [
      422,
      'Ya usaste este beneficio el máximo de veces permitido',
      'Ya usaste este beneficio la cantidad máxima de veces permitida.',
    ],
  ])('explains the backend %s "%s"', (status, message, expected) => {
    expect(toRedeemErrorMessage(problem(status, message))).toBe(expected);
  });

  it('ignores the letter case of the backend message', () => {
    expect(toRedeemErrorMessage(problem(422, 'EL BENEFICIO ESTÁ VENCIDO'))).toBe('Este beneficio venció.');
  });

  it('explains a 404 for a missing benefit', () => {
    const error = problem(404, 'Beneficio no encontrado');

    expect(toRedeemErrorMessage(error)).toBe('No encontramos este beneficio.');
  });

  it('tells a missing client apart from a missing benefit', () => {
    const expected =
      'No pudimos identificar tu cuenta. Vuelve a iniciar sesión e inténtalo de nuevo.';

    expect(toRedeemErrorMessage(problem(403, 'El usuario actual no tiene perfil de cliente'))).toBe(
      expected,
    );
    expect(toRedeemErrorMessage(problem(403, '  EL USUARIO ACTUAL NO TIENE PERFIL DE CLIENTE '))).toBe(
      expected,
    );
    expect(toRedeemErrorMessage(problem(404, 'Beneficio no encontrado'))).not.toBe(expected);
  });

  it('keeps the benefit message for any other 404 body', () => {
    for (const error of [{ detail: 'Canje no encontrado' }, { detail: '' }, null, 'Cafetería no encontrada', { x: 1 }]) {
      expect(toRedeemErrorMessage(new HttpErrorResponse({ status: 404, error }))).toBe(
        'No encontramos este beneficio.',
      );
    }
  });

  it('falls back for a rule with an unknown message', () => {
    expect(toRedeemErrorMessage(problem(422, 'Mensaje nuevo'))).toBe(REDEEM_ERROR_MESSAGE);
  });

  it('falls back for a 400 with a plain-text or empty body', () => {
    expect(
      toRedeemErrorMessage(new HttpErrorResponse({ status: 400, error: 'El carrito no puede estar vacío' })),
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
    expect(toRedeemErrorMessage('El beneficio está vencido')).toBe(REDEEM_ERROR_MESSAGE);
  });

  it('uses a generic message that does not blame the points', () => {
    expect(REDEEM_ERROR_MESSAGE).toBe('No pudimos activar este beneficio. Inténtalo de nuevo.');
  });
});
