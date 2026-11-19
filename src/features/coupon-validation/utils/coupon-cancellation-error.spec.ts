import { HttpErrorResponse } from '@angular/common/http';
import { CANCELLATION_ERROR_MESSAGE, toCancellationFailure } from './coupon-cancellation-error';

describe('toCancellationFailure', () => {
  const failureFor = (status: number) =>
    toCancellationFailure(
      new HttpErrorResponse({ status, error: { detail: 'Any text of the backend' } }),
    );

  it('says the coupon does not exist when the backend cannot find it', () => {
    expect(failureFor(404)).toEqual({ kind: 'not-found' });
  });

  it('explains in Spanish why a coupon cannot be cancelled, without repeating the text of the backend', () => {
    expect(failureFor(409)).toEqual({
      kind: 'not-cancelled',
      message: 'Este canje ya se usó o ya estaba cancelado, así que no se puede cancelar.',
    });
    expect(failureFor(422)).toEqual({
      kind: 'not-cancelled',
      message: 'El cupón está vencido: ya no se puede cancelar.',
    });
    expect(failureFor(403)).toEqual({
      kind: 'not-cancelled',
      message: 'Este cupón es de otra cafetería: no lo podés cancelar.',
    });
  });

  it('falls back to a generic message for any other failure', () => {
    expect(failureFor(500)).toEqual({ kind: 'not-cancelled', message: CANCELLATION_ERROR_MESSAGE });
    expect(toCancellationFailure(new Error('boom'))).toEqual({
      kind: 'not-cancelled',
      message: CANCELLATION_ERROR_MESSAGE,
    });
  });
});
