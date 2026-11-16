import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Redemption } from '../model/redemption.model';

function isNotFound(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === HttpStatusCode.NotFound;
}

@Injectable({
  providedIn: 'root',
})
export class RedemptionService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/redemption`;

  getById(externalId: string): Observable<Redemption | undefined> {
    return this.http
      .get<Redemption>(`${this.url}/${externalId}`)
      .pipe(catchError((error) => (isNotFound(error) ? of(undefined) : throwError(() => error))));
  }
}
