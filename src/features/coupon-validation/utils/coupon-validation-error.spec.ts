import { HttpErrorResponse } from '@angular/common/http';
import { toValidationFailure, VALIDATION_ERROR_MESSAGE } from './coupon-validation-error';

function problem(status: number, detail: string): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: { title: 'Error', status, detail } });
}

describe('toValidationFailure', () => {
  it('detects a code that was already used', () => {
    expect(toValidationFailure(problem(409, 'A redemption cannot go from USED to USED'))).toEqual({
      kind: 'used',
    });
  });

  it('detects a code that does not exist', () => {
    expect(toValidationFailure(problem(404, 'Redemption not found'))).toEqual({ kind: 'not-found' });
  });

  it('ignores the letter case and the spaces of the backend message', () => {
    expect(toValidationFailure(problem(409, '  a redemption CANNOT go from used to used '))).toEqual({
      kind: 'used',
    });
    expect(toValidationFailure(problem(404, ' redemption NOT found '))).toEqual({ kind: 'not-found' });
  });

  it('explains a coupon that was cancelled', () => {
    expect(toValidationFailure(problem(409, 'A redemption cannot go from CANCELLED to USED'))).toEqual({
      kind: 'rejected',
      message: 'Este cupón fue cancelado y ya no se puede canjear.',
    });
  });

  it('explains a coupon whose product is sold out for today', () => {
    const failure = toValidationFailure(
      problem(409, 'The product of this benefit is sold out for today, cancel the redemption to give the points back'),
    );

    expect(failure.kind === 'rejected' && failure.message).toContain('agotado hoy');
  });

  it('explains a coupon of another cafe', () => {
    expect(toValidationFailure(problem(403, 'This redemption does not belong to your cafe'))).toEqual({
      kind: 'rejected',
      message: 'Este cupón es de otra cafetería, no se puede canjear en este local.',
    });
  });

  it('explains a cafe user without a cafe instead of calling the coupon missing', () => {
    expect(toValidationFailure(problem(403, 'The current user has no cafe'))).toEqual({
      kind: 'rejected',
      message: 'Tu usuario no tiene una cafetería asociada. Consultá con el administrador.',
    });
  });

  it('does not take any other 404 for a missing coupon', () => {
    for (const error of [
      problem(404, 'User not found'),
      problem(404, 'Benefit not found'),
      new HttpErrorResponse({ status: 404, error: null }),
    ]) {
      expect(toValidationFailure(error)).toEqual({ kind: 'rejected', message: VALIDATION_ERROR_MESSAGE });
    }
  });

  it('does not take a used message with another status for a used coupon', () => {
    expect(toValidationFailure(problem(400, 'A redemption cannot go from USED to USED')).kind).toBe('rejected');
  });

  it('falls back to the generic message for an unknown 400', () => {
    for (const error of [
      problem(400, 'Something new'),
      new HttpErrorResponse({ status: 400, error: 'Plain text' }),
      new HttpErrorResponse({ status: 400, error: null }),
    ]) {
      expect(toValidationFailure(error)).toEqual({ kind: 'rejected', message: VALIDATION_ERROR_MESSAGE });
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
    expect(toValidationFailure(new Error('boom'))).toEqual({ kind: 'rejected', message: VALIDATION_ERROR_MESSAGE });
    expect(toValidationFailure(undefined)).toEqual({ kind: 'rejected', message: VALIDATION_ERROR_MESSAGE });
  });
});
