import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MOCK_CAFES } from '../data/cafes.mock';
import { Cafe, CreateCafeAccountRequest, UserResponse } from '../model/cafe.model';

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

  register(request: CreateCafeAccountRequest): Observable<UserResponse> {
    if (environment.useMockApi) {
      const newCafe: Cafe = {
        externalId: `cafe-${Date.now()}`,
        name: request.name,
        address: request.address,
        email: request.email,
        phoneNumber: request.phoneNumber || null,
        description: request.description || null,
        schedule: request.schedule || null,
        state: true,
      };
      MOCK_CAFES.unshift(newCafe);
      return of({
        externalId: newCafe.externalId,
        email: newCafe.email,
        state: true,
      });
    }

    return this.http.post<UserResponse>(`${this.url}/register`, request);
  }
}
