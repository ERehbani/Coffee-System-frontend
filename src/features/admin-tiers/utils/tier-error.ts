import { HttpErrorResponse } from '@angular/common/http';
import { TierFormErrors } from '../types/tier.model';

export const TIER_SAVE_ERROR_MESSAGE = 'No pudimos guardar el nivel. Intentalo de nuevo.';

const NAME_REQUIRED = 'El nombre es obligatorio.';
const NAME_TOO_LONG = 'El nombre puede tener hasta 50 caracteres.';
const POINTS_REQUIRED = 'Los puntos son obligatorios.';
const POINTS_NEGATIVE = 'Los puntos no pueden ser negativos.';
const DUPLICATE_NAME = 'Ya existe un nivel con ese nombre.';
const DUPLICATE_POINTS = 'Ya existe un nivel con esa cantidad de puntos.';
const BASE_TIER_POINTS = 'El nivel base debe mantener 0 puntos.';

const GENERIC: TierFormErrors = { form: TIER_SAVE_ERROR_MESSAGE };

function stringOf(body: unknown, key: string): string | null {
  if (typeof body !== 'object' || body === null || !(key in body)) {
    return null;
  }
  const value = (body as Record<string, unknown>)[key];
  return typeof value === 'string' ? value.trim().toLowerCase() : null;
}

function fieldErrorsOf(body: unknown): Record<string, unknown> | null {
  if (typeof body !== 'object' || body === null || !('errors' in body)) {
    return null;
  }
  const errors = body.errors;
  return typeof errors === 'object' && errors !== null ? (errors as Record<string, unknown>) : null;
}

function nameError(message: string): string {
  return /blank|empty|null|required/.test(message) ? NAME_REQUIRED : NAME_TOO_LONG;
}

function pointsError(message: string): string {
  return /null|required|blank|empty/.test(message) ? POINTS_REQUIRED : POINTS_NEGATIVE;
}

function validationErrors(body: unknown): TierFormErrors | null {
  const errors = fieldErrorsOf(body);
  if (!errors) {
    return null;
  }
  const name = typeof errors['name'] === 'string' ? nameError(errors['name'].toLowerCase()) : null;
  const points =
    typeof errors['minPoints'] === 'string' ? pointsError(errors['minPoints'].toLowerCase()) : null;
  if (!name && !points) {
    return null;
  }
  return { ...(name && { name }), ...(points && { minPoints: points }) };
}

export function toTierFormErrors(error: unknown): TierFormErrors {
  if (!(error instanceof HttpErrorResponse)) {
    return GENERIC;
  }
  if (error.status === 422 && stringOf(error.error, 'detail') === 'the base tier must keep 0 points') {
    return { form: BASE_TIER_POINTS };
  }
  if (error.status === 400) {
    return validationErrors(error.error) ?? GENERIC;
  }
  const message = stringOf(error.error, 'detail');
  if (error.status === 409 && message) {
    if (/^a tier named .+ already exists$/.test(message)) {
      return { name: DUPLICATE_NAME };
    }
    if (/^a tier with .+ points already exists$/.test(message)) {
      return { minPoints: DUPLICATE_POINTS };
    }
  }
  return GENERIC;
}
