import { HttpErrorResponse } from '@angular/common/http';
import { toValidationFailure, VALIDATION_ERROR_MESSAGE } from './coupon-validation-error';

function badRequest(message: string): HttpErrorResponse {
  return new HttpErrorResponse({ status: 400, error: { error: message, status: 400 } });
}

function notFound(body: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ status: 404, error: body });
}

describe('toValidationFailure', () => {
  it('detects a code that was already used', () => {
    expect(toValidationFailure(badRequest('This code has already been used'))).toEqual({
      kind: 'used',
    });
  });

  it('detects a code that does not exist', () => {
    expect(toValidationFailure(notFound('Redemption not found'))).toEqual({ kind: 'not-found' });
  });

  it('ignores the letter case and the spaces of the backend message', () => {
    expect(toValidationFailure(badRequest('  THIS CODE HAS ALREADY BEEN USED '))).toEqual({
      kind: 'used',
    });
    expect(toValidationFailure(notFound(' redemption NOT found '))).toEqual({ kind: 'not-found' });
  });

  it('explains a coupon of another cafe', () => {
    expect(toValidationFailure(badRequest('This redemption does not belong to your cafe'))).toEqual(
      {
        kind: 'rejected',
        message: 'Este cupón es de otra cafetería, no se puede canjear en este local.',
      },
    );
  });

  it('explains a global coupon, which only an admin can validate', () => {
    expect(toValidationFailure(badRequest('Only admin can validate global benefits'))).toEqual({
      kind: 'rejected',
      message: 'Este cupón es de un beneficio global y solo lo puede validar un administrador.',
    });
  });

  it('explains a cafe user without a cafe instead of calling the coupon missing', () => {
    expect(toValidationFailure(notFound('Cafe not found'))).toEqual({
      kind: 'rejected',
      message: 'Tu usuario no tiene una cafetería asociada. Consultá con el administrador.',
    });
  });

  it('does not take any other 404 for a missing coupon', () => {
    for (const body of ['User not found', '', null, { error: 'Benefit not found' }]) {
      expect(toValidationFailure(notFound(body))).toEqual({
        kind: 'rejected',
        message: VALIDATION_ERROR_MESSAGE,
      });
    }
  });

  it('does not take a used message with another status for a used coupon', () => {
    const conflict = new HttpErrorResponse({
      status: 409,
      error: { error: 'This code has already been used' },
    });

    expect(toValidationFailure(conflict).kind).toBe('rejected');
  });

  it('falls back to the generic message for an unknown 400', () => {
    for (const error of [
      badRequest('Something new'),
      new HttpErrorResponse({ status: 400, error: 'Plain text' }),
      new HttpErrorResponse({ status: 400, error: null }),
    ]) {
      expect(toValidationFailure(error)).toEqual({
        kind: 'rejected',
        message: VALIDATION_ERROR_MESSAGE,
      });
    }
  });

  it('explains a missing permission and an expired session', () => {
    expect(toValidationFailure(new HttpErrorResponse({ status: 403 }))).toEqual({
      kind: 'rejected',
      message: 'Tu usuario no tiene permiso para validar cupones.',
    });
    expect(toValidationFailure(new HttpErrorResponse({ status: 401 }))).toEqual({
      kind: 'rejected',
      message: 'Tu sesión expiró. Volvé a iniciar sesión.',
    });
  });

  it('warns that a lost connection may have validated the coupon anyway', () => {
    const failure = toValidationFailure(new HttpErrorResponse({ status: 0 }));

    expect(failure.kind).toBe('rejected');
    expect(failure.kind === 'rejected' && failure.message).toContain('va a aparecer como usado');
  });

  it('explains a server error', () => {
    expect(toValidationFailure(new HttpErrorResponse({ status: 500 }))).toEqual({
      kind: 'rejected',
      message: 'El servidor no pudo validar el cupón. Probá de nuevo en unos minutos.',
    });
  });

  it('falls back to the generic message for anything that is not an HTTP error', () => {
    expect(toValidationFailure(new Error('boom'))).toEqual({
      kind: 'rejected',
      message: VALIDATION_ERROR_MESSAGE,
    });
    expect(toValidationFailure(undefined)).toEqual({
      kind: 'rejected',
      message: VALIDATION_ERROR_MESSAGE,
    });
  });
});
