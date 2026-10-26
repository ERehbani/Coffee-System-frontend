import { HttpErrorResponse } from '@angular/common/http';
import {
  BENEFIT_FORMAT_SAVE_ERROR_MESSAGE,
  toBenefitFormatFormErrors,
} from './benefit-format-error';

const validation = (errors: Record<string, string>) =>
  new HttpErrorResponse({ status: 400, error: { errors, status: 400 } });

describe('toBenefitFormatFormErrors', () => {
  it('maps the missing format to the code field', () => {
    expect(toBenefitFormatFormErrors(validation({ code: 'The format is required' }))).toEqual({
      code: 'Elige un formato.',
    });
  });

  it.each([
    ['The name is required', 'El nombre es obligatorio.'],
    ['must not be blank', 'El nombre es obligatorio.'],
    ['The name must have at most 40 characters', 'El nombre puede tener hasta 40 caracteres.'],
    ['size must be between 0 and 40', 'El nombre puede tener hasta 40 caracteres.'],
  ])('maps the name validation "%s"', (message, expected) => {
    expect(toBenefitFormatFormErrors(validation({ displayName: message }))).toEqual({
      displayName: expected,
    });
  });

  it.each([
    ['The description is required', 'La descripción es obligatoria.'],
    ['must not be empty', 'La descripción es obligatoria.'],
    [
      'The description must have at most 200 characters',
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
          code: 'The format is required',
          displayName: 'The name is required',
          description: 'The description is required',
        }),
      ),
    ).toEqual({
      code: 'Elige un formato.',
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
      error: 'The format DOS_POR_UNO is already in the catalog',
    });

    expect(toBenefitFormatFormErrors(error)).toEqual({
      code: 'Ese formato ya está en el catálogo.',
    });
  });

  it('puts a duplicate name on the name field', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: 'A benefit type named Descuento already exists',
    });

    expect(toBenefitFormatFormErrors(error)).toEqual({
      displayName: 'Ya existe un tipo con ese nombre.',
    });
  });

  it('ignores the letter case and the spacing of a conflict message', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: '  A BENEFIT TYPE NAMED 2x1 ALREADY EXISTS ',
    });

    expect(toBenefitFormatFormErrors(error)).toEqual({
      displayName: 'Ya existe un tipo con ese nombre.',
    });
  });

  it('falls back for an unknown conflict, a missing format or a bad request', () => {
    const generic = { form: 'No pudimos guardar el tipo de beneficio. Inténtalo de nuevo.' };

    expect(
      toBenefitFormatFormErrors(new HttpErrorResponse({ status: 409, error: 'Something new' })),
    ).toEqual(generic);
    expect(
      toBenefitFormatFormErrors(
        new HttpErrorResponse({ status: 404, error: 'Benefit format not found' }),
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
