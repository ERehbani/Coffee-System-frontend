import { HttpErrorResponse } from '@angular/common/http';
import {
  BENEFIT_FORMAT_SAVE_ERROR_MESSAGE,
  toBenefitFormatFormErrors,
} from './benefit-format-error';

const validation = (errors: Record<string, string>) =>
  new HttpErrorResponse({ status: 400, error: { errors, status: 400 } });

describe('toBenefitFormatFormErrors', () => {
  it('maps the missing format to the code field', () => {
    expect(toBenefitFormatFormErrors(validation({ code: 'El formato es obligatorio' }))).toEqual({
      code: 'Elegí un formato.',
    });
  });

  it.each([
    ['El nombre es obligatorio', 'El nombre es obligatorio.'],
    ['El nombre puede tener hasta 40 caracteres', 'El nombre puede tener hasta 40 caracteres.'],
  ])('maps the name validation "%s"', (message, expected) => {
    expect(toBenefitFormatFormErrors(validation({ displayName: message }))).toEqual({
      displayName: expected,
    });
  });

  it.each([
    ['La descripción es obligatoria', 'La descripción es obligatoria.'],
    [
      'La descripción puede tener hasta 200 caracteres',
      'La descripción puede tener hasta 200 caracteres.',
    ],
  ])('maps the description validation "%s"', (message, expected) => {
    expect(toBenefitFormatFormErrors(validation({ description: message }))).toEqual({
      description: expected,
    });
  });

  it('keeps every field error of one response', () => {
    expect(
      toBenefitFormatFormErrors(
        validation({
          code: 'El formato es obligatorio',
          displayName: 'El nombre es obligatorio',
          description: 'La descripción es obligatoria',
        }),
      ),
    ).toEqual({
      code: 'Elegí un formato.',
      displayName: 'El nombre es obligatorio.',
      description: 'La descripción es obligatoria.',
    });
  });

  it('falls back to the generic message for a validation body without known fields', () => {
    const generic = { form: BENEFIT_FORMAT_SAVE_ERROR_MESSAGE };

    expect(toBenefitFormatFormErrors(validation({ other: 'x' }))).toEqual(generic);
    expect(toBenefitFormatFormErrors(validation({}))).toEqual(generic);
  });

  it('puts a format already in the catalog on the code field', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: { detail: 'El formato DOS_POR_UNO ya está en el catálogo' },
    });

    expect(toBenefitFormatFormErrors(error)).toEqual({
      code: 'Ese formato ya está en el catálogo.',
    });
  });

  it('puts a duplicate name on the name field', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: { detail: 'Ya existe un tipo de beneficio llamado Descuento' },
    });

    expect(toBenefitFormatFormErrors(error)).toEqual({
      displayName: 'Ya existe un tipo con ese nombre.',
    });
  });

  it('ignores the letter case and the spacing of a conflict message', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: { detail: '  YA EXISTE UN TIPO DE BENEFICIO LLAMADO 2x1 ' },
    });

    expect(toBenefitFormatFormErrors(error)).toEqual({
      displayName: 'Ya existe un tipo con ese nombre.',
    });
  });

  it('falls back for an unknown conflict, a missing format or a bad request', () => {
    const generic = { form: 'No pudimos guardar el tipo de beneficio. Intentalo de nuevo.' };

    expect(
      toBenefitFormatFormErrors(new HttpErrorResponse({ status: 409, error: { detail: 'Mensaje nuevo' } })),
    ).toEqual(generic);
    expect(
      toBenefitFormatFormErrors(
        new HttpErrorResponse({ status: 404, error: { detail: 'Tipo de beneficio no encontrado' } }),
      ),
    ).toEqual(generic);
    expect(toBenefitFormatFormErrors(new HttpErrorResponse({ status: 400, error: null }))).toEqual(
      generic,
    );
  });

  it('falls back for network failures, server errors and anything else', () => {
    const generic = { form: BENEFIT_FORMAT_SAVE_ERROR_MESSAGE };

    expect(toBenefitFormatFormErrors(new HttpErrorResponse({ status: 0 }))).toEqual(generic);
    expect(toBenefitFormatFormErrors(new HttpErrorResponse({ status: 500 }))).toEqual(generic);
    expect(toBenefitFormatFormErrors(new Error('boom'))).toEqual(generic);
    expect(toBenefitFormatFormErrors(undefined)).toEqual(generic);
  });
});
