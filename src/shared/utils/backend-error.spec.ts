import { HttpErrorResponse } from '@angular/common/http';
import { backendErrorMessage } from './backend-error';

describe('backendErrorMessage', () => {
  it('reads the detail of a problem response', () => {
    const error = new HttpErrorResponse({ status: 409, error: { title: 'Conflicto', detail: 'El beneficio está agotado' } });

    expect(backendErrorMessage(error)).toBe('El beneficio está agotado');
  });

  it('prefers the field messages of a validation error', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { detail: 'La solicitud tiene campos inválidos', errors: { name: 'El nombre es obligatorio', price: 'El precio es muy bajo' } },
    });

    expect(backendErrorMessage(error)).toBe('El nombre es obligatorio. El precio es muy bajo');
  });

  it('returns null when the backend sent no readable message', () => {
    expect(backendErrorMessage(new HttpErrorResponse({ status: 500, error: 'falló' }))).toBeNull();
    expect(backendErrorMessage(new Error('sin conexión'))).toBeNull();
  });
});
