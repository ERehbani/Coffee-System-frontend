import { HttpErrorResponse } from '@angular/common/http';
import { backendErrorMessage } from './backend-error';

describe('backendErrorMessage', () => {
  it('reads the detail of a problem response', () => {
    const error = new HttpErrorResponse({ status: 409, error: { title: 'Conflict', detail: 'Benefit is sold out' } });

    expect(backendErrorMessage(error)).toBe('Benefit is sold out');
  });

  it('prefers the field messages of a validation error', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { detail: 'The request has invalid fields', errors: { name: 'The name is required', price: 'Too low' } },
    });

    expect(backendErrorMessage(error)).toBe('The name is required. Too low');
  });

  it('returns null when the backend sent no readable message', () => {
    expect(backendErrorMessage(new HttpErrorResponse({ status: 500, error: 'boom' }))).toBeNull();
    expect(backendErrorMessage(new Error('offline'))).toBeNull();
  });
});
