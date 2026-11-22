import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

const MESSAGES_BY_STATUS: ReadonlyMap<number, string> = new Map([
  [HttpStatusCode.BadRequest, 'Revisá los datos: algún campo no tiene el formato correcto.'],
  [HttpStatusCode.Forbidden, 'Tu usuario no tiene permiso para cambiar esta cafetería.'],
  [HttpStatusCode.NotFound, 'La cafetería ya no existe. Recargá la página.'],
  [
    HttpStatusCode.Conflict,
    'La cafetería cambió mientras tanto. Recargá la página y probá de nuevo.',
  ],
]);

export function toCafeAdminErrorMessage(error: unknown, fallback: string): string {
  const status = error instanceof HttpErrorResponse ? error.status : null;
  return (status !== null && MESSAGES_BY_STATUS.get(status)) || fallback;
}
