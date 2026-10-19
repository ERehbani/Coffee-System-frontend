import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MOCK_CAFES } from '../data/cafes.mock';
import { Cafe } from '../model/cafe.model';

@Injectable({
  providedIn: 'root',
})
export class CafeService {
  private readonly url = `${environment.apiBaseUrl}/cafes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Cafe[]> {
    if (environment.useMockApi) {
      return of(MOCK_CAFES);
    }

    return this.http.get<Cafe[]>(this.url).pipe(
      catchError(() => of(MOCK_CAFES))
    );
  }

  getByExternalId(externalId: string): Observable<Cafe | undefined> {
    if (environment.useMockApi) {
      return of(MOCK_CAFES.find((c) => c.externalId === externalId));
    }

    return this.http.get<Cafe>(`${this.url}/${externalId}`).pipe(
      catchError(() => of(MOCK_CAFES.find((c) => c.externalId === externalId)))
    );
  }
}
