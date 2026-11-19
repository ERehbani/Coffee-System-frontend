import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { backendErrorMessage } from '../../../shared/utils/backend-error';

const NOT_YOURS = 'Esta promoción no es de tu cafetería.';
const GONE = 'La promoción ya no existe. Recargá la página.';

export const VISIBILITY_ERROR_MESSAGE =
  'No se pudo cambiar el estado de la promoción. Probá de nuevo.';
export const DELETION_ERROR_MESSAGE = 'No se pudo eliminar la promoción. Probá de nuevo.';

const VISIBILITY_ERRORS: ReadonlyMap<number, string> = new Map([
  [HttpStatusCode.Forbidden, NOT_YOURS],
  [HttpStatusCode.NotFound, GONE],
  [
    HttpStatusCode.Conflict,
    'La promoción cambió mientras tanto. Recargá la página y probá de nuevo.',
  ],
]);

const DELETION_ERRORS: ReadonlyMap<number, string> = new Map([
  [HttpStatusCode.Forbidden, NOT_YOURS],
  [HttpStatusCode.NotFound, GONE],
  [
    HttpStatusCode.Conflict,
    'La promoción tiene datos asociados y no se puede eliminar. Pausala para que no se pueda canjear más.',
  ],
]);

function statusOf(error: unknown): number | null {
  return error instanceof HttpErrorResponse ? error.status : null;
}

export function toVisibilityErrorMessage(error: unknown): string {
  const status = statusOf(error);
  return (status !== null && VISIBILITY_ERRORS.get(status)) || VISIBILITY_ERROR_MESSAGE;
}

export function toDeletionErrorMessage(error: unknown): string {
  const status = statusOf(error);
  if (status === HttpStatusCode.UnprocessableEntity) {
    return backendErrorMessage(error) ?? DELETION_ERROR_MESSAGE;
  }
  return (status !== null && DELETION_ERRORS.get(status)) || DELETION_ERROR_MESSAGE;
}
