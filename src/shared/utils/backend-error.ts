import { HttpErrorResponse } from '@angular/common/http';

interface ProblemBody {
  readonly detail?: unknown;
  readonly errors?: unknown;
}

function fieldMessages(errors: unknown): string | null {
  if (!errors || typeof errors !== 'object') {
    return null;
  }
  const messages = Object.values(errors).filter((message) => typeof message === 'string');
  return messages.length > 0 ? messages.join('. ') : null;
}

export function backendErrorMessage(error: unknown): string | null {
  if (!(error instanceof HttpErrorResponse) || !error.error || typeof error.error !== 'object') {
    return null;
  }
  const body = error.error as ProblemBody;
  const fields = fieldMessages(body.errors);
  if (fields) {
    return fields;
  }
  return typeof body.detail === 'string' ? body.detail : null;
}
