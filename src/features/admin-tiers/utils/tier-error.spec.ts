import { HttpErrorResponse } from '@angular/common/http';
import { TIER_SAVE_ERROR_MESSAGE, toTierFormErrors } from './tier-error';

const validation = (errors: Record<string, string>) =>
  new HttpErrorResponse({ status: 400, error: { errors, status: 400 } });

describe('toTierFormErrors', () => {
  it.each([
    ['must not be blank', 'El nombre es obligatorio.'],
    ['must not be empty', 'El nombre es obligatorio.'],
    ['size must be between 0 and 50', 'El nombre puede tener hasta 50 caracteres.'],
    ['length must not exceed 50 characters', 'El nombre puede tener hasta 50 caracteres.'],
  ])('maps the name validation "%s"', (message, expected) => {
    expect(toTierFormErrors(validation({ name: message }))).toEqual({ name: expected });
  });

  it.each([
    ['must not be null', 'Los puntos son obligatorios.'],
    ['must be greater than or equal to 0', 'Los puntos no pueden ser negativos.'],
    ['must not be negative', 'Los puntos no pueden ser negativos.'],
  ])('maps the points validation "%s"', (message, expected) => {
    expect(toTierFormErrors(validation({ minPoints: message }))).toEqual({ minPoints: expected });
  });

  it('keeps both field errors of one response', () => {
    expect(
      toTierFormErrors(validation({ name: 'must not be blank', minPoints: 'must not be null' })),
    ).toEqual({ name: 'El nombre es obligatorio.', minPoints: 'Los puntos son obligatorios.' });
  });

  it('falls back to the generic message for a validation body without known fields', () => {
    expect(toTierFormErrors(validation({ other: 'x' }))).toEqual({ form: TIER_SAVE_ERROR_MESSAGE });
    expect(toTierFormErrors(validation({}))).toEqual({ form: TIER_SAVE_ERROR_MESSAGE });
  });

  it('puts a duplicate name on the name field', () => {
    const error = new HttpErrorResponse({ status: 409, error: 'A tier named Oro already exists' });

    expect(toTierFormErrors(error)).toEqual({ name: 'Ya existe un tier con ese nombre.' });
  });

  it('puts duplicate points on the points field', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: 'A tier with 3000 points already exists',
    });

    expect(toTierFormErrors(error)).toEqual({
      minPoints: 'Ya existe un tier con esa cantidad de puntos.',
    });
  });

  it('ignores the letter case and the spacing of a conflict message', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: '  A TIER NAMED oro ALREADY EXISTS ',
    });

    expect(toTierFormErrors(error)).toEqual({ name: 'Ya existe un tier con ese nombre.' });
  });

  it('explains that the base tier keeps 0 points', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { error: 'The base tier must keep 0 points', status: 400 },
    });

    expect(toTierFormErrors(error)).toEqual({ form: 'El tier base debe mantener 0 puntos.' });
  });

  it('falls back for an unknown conflict or bad request', () => {
    expect(
      toTierFormErrors(new HttpErrorResponse({ status: 409, error: 'Something new' })),
    ).toEqual({
      form: TIER_SAVE_ERROR_MESSAGE,
    });
    expect(
      toTierFormErrors(
        new HttpErrorResponse({ status: 400, error: { error: 'Other', status: 400 } }),
      ),
    ).toEqual({ form: TIER_SAVE_ERROR_MESSAGE });
    expect(toTierFormErrors(new HttpErrorResponse({ status: 400, error: null }))).toEqual({
      form: TIER_SAVE_ERROR_MESSAGE,
    });
  });

  it('falls back for network failures, server errors and anything else', () => {
    expect(toTierFormErrors(new HttpErrorResponse({ status: 0 }))).toEqual({
      form: TIER_SAVE_ERROR_MESSAGE,
    });
    expect(toTierFormErrors(new HttpErrorResponse({ status: 500 }))).toEqual({
      form: TIER_SAVE_ERROR_MESSAGE,
    });
    expect(toTierFormErrors(new Error('boom'))).toEqual({ form: TIER_SAVE_ERROR_MESSAGE });
    expect(toTierFormErrors(undefined)).toEqual({ form: TIER_SAVE_ERROR_MESSAGE });
  });

  it('uses the agreed generic copy', () => {
    expect(TIER_SAVE_ERROR_MESSAGE).toBe('No pudimos guardar el tier. Inténtalo de nuevo.');
  });
});
