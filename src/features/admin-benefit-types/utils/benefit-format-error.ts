import { HttpErrorResponse } from '@angular/common/http';
import { BenefitFormatFormErrors } from '../types/benefit-format.model';

export const BENEFIT_FORMAT_SAVE_ERROR_MESSAGE =
  'No pudimos guardar el tipo de beneficio. Inténtalo de nuevo.';

const CODE_REQUIRED = 'Elige un formato.';
const NAME_REQUIRED = 'El nombre es obligatorio.';
const NAME_TOO_LONG = 'El nombre puede tener hasta 40 caracteres.';
const DESCRIPTION_REQUIRED = 'La descripción es obligatoria.';
const DESCRIPTION_TOO_LONG = 'La descripción puede tener hasta 200 caracteres.';
const CODE_TAKEN = 'Ese formato ya está en el catálogo.';
const DUPLICATE_NAME = 'Ya existe un tipo con ese nombre.';

const GENERIC: BenefitFormatFormErrors = { form: BENEFIT_FORMAT_SAVE_ERROR_MESSAGE };

function detailOf(body: unknown): string | null {
  if (typeof body !== 'object' || body === null || !('detail' in body)) {
    return null;
  }
  return typeof body.detail === 'string' ? body.detail.trim().toLowerCase() : null;
}

function fieldErrorsOf(body: unknown): Record<string, unknown> | null {
  if (typeof body !== 'object' || body === null || !('errors' in body)) {
    return null;
  }
  const errors = body.errors;
  return typeof errors === 'object' && errors !== null ? (errors as Record<string, unknown>) : null;
}

function isMissing(message: string): boolean {
  return /blank|empty|null|required/.test(message);
}

function fieldError(
  errors: Record<string, unknown>,
  field: string,
  missing: string,
  tooLong: string | null,
): string | null {
  const message = errors[field];
  if (typeof message !== 'string') {
    return null;
  }
  const lowered = message.toLowerCase();
  return isMissing(lowered) || tooLong === null ? missing : tooLong;
}

function validationErrors(body: unknown): BenefitFormatFormErrors | null {
  const errors = fieldErrorsOf(body);
  if (!errors) {
    return null;
  }
  const code = fieldError(errors, 'code', CODE_REQUIRED, null);
  const displayName = fieldError(errors, 'displayName', NAME_REQUIRED, NAME_TOO_LONG);
  const description = fieldError(errors, 'description', DESCRIPTION_REQUIRED, DESCRIPTION_TOO_LONG);
  if (!code && !displayName && !description) {
    return null;
  }
  return {
    ...(code && { code }),
    ...(displayName && { displayName }),
    ...(description && { description }),
  };
}

export function toBenefitFormatFormErrors(error: unknown): BenefitFormatFormErrors {
  if (!(error instanceof HttpErrorResponse)) {
    return GENERIC;
  }
  if (error.status === 400) {
    return validationErrors(error.error) ?? GENERIC;
  }
  const message = detailOf(error.error);
  if (error.status === 409 && message) {
    if (/^the format .+ is already in the catalog$/.test(message)) {
      return { code: CODE_TAKEN };
    }
    if (/^a benefit type named .+ already exists$/.test(message)) {
      return { displayName: DUPLICATE_NAME };
    }
  }
  return GENERIC;
}
