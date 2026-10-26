import { HttpErrorResponse } from '@angular/common/http';
import { TierFormErrors } from '../types/tier.model';

export const TIER_SAVE_ERROR_MESSAGE = 'No pudimos guardar el tier. Inténtalo de nuevo.';

const NAME_REQUIRED = 'El nombre es obligatorio.';
const NAME_TOO_LONG = 'El nombre puede tener hasta 50 caracteres.';
const POINTS_REQUIRED = 'Los puntos son obligatorios.';
const POINTS_NEGATIVE = 'Los puntos no pueden ser negativos.';
const DUPLICATE_NAME = 'Ya existe un tier con ese nombre.';
const DUPLICATE_POINTS = 'Ya existe un tier con esa cantidad de puntos.';
const BASE_TIER_POINTS = 'El tier base debe mantener 0 puntos.';

const GENERIC: TierFormErrors = { form: TIER_SAVE_ERROR_MESSAGE };

/** Reads a string property of an error body, trimmed and lower-cased. */
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

/**
 * Bean Validation messages of `name` (`@NotBlank`, `@Size(max = 50)`): anything that is not about
 * a missing value is the length limit.
 */
function nameError(message: string): string {
  return /blank|empty|null|required/.test(message) ? NAME_REQUIRED : NAME_TOO_LONG;
}

/** Bean Validation messages of `minPoints` (`@NotNull`, `@Min(0)`): anything not null is negative. */
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

/**
 * Maps a failed `POST /tiers` or `PUT /tiers/{id}` to Spanish copy placed on the field it is
 * about: 400 `{ errors: { name | minPoints } }`, 409 plain text for a duplicate name or points,
 * 400 `{ error }` for the base tier. Anything unrecognised gets the generic form message.
 */
export function toTierFormErrors(error: unknown): TierFormErrors {
  if (!(error instanceof HttpErrorResponse)) {
    return GENERIC;
  }
  if (error.status === 400) {
    if (stringOf(error.error, 'error') === 'the base tier must keep 0 points') {
      return { form: BASE_TIER_POINTS };
    }
    return validationErrors(error.error) ?? GENERIC;
  }
  if (error.status === 409 && typeof error.error === 'string') {
    const message = error.error.trim().toLowerCase();
    if (/^a tier named .+ already exists$/.test(message)) {
      return { name: DUPLICATE_NAME };
    }
    if (/^a tier with .+ points already exists$/.test(message)) {
      return { minPoints: DUPLICATE_POINTS };
    }
  }
  return GENERIC;
}
