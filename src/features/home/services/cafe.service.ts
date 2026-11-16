import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cafe, CreateCafeAccountRequest, UserResponse } from '../model/cafe.model';

@Injectable({
  providedIn: 'root',
})
export class CafeService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/cafes`;

  getAll(): Observable<Cafe[]> {
    return this.http.get<Cafe[]>(this.url);
  }

  getByExternalId(externalId: string): Observable<Cafe | undefined> {
    return this.http.get<Cafe>(`${this.url}/${externalId}`);
  }

  register(request: CreateCafeAccountRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.url}/register`, request);
  }
}
