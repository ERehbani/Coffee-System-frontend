import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { AdminCafeDto, CreateCafeAccountRequestDto } from '../types/admin-cafe.dto';
import { AdminCafe, CreateCafeInput } from '../types/admin-cafe.model';
import { toAdminCafe, toAdminCafeList } from '../utils/admin-cafe.mapper';
import { AdminCafeRepository } from './admin-cafe.repository';

@Injectable()
export class HttpAdminCafeRepository implements AdminCafeRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/cafes';

  getCafes(): Observable<readonly AdminCafe[]> {
    return this.http.get<readonly AdminCafeDto[]>(this.baseUrl).pipe(map(toAdminCafeList));
  }

  getCafeById(externalId: string): Observable<AdminCafe | null> {
    return this.http
      .get<AdminCafeDto>(`${this.baseUrl}/${externalId}`)
      .pipe(map((dto) => (dto ? toAdminCafe(dto) : null)));
  }

  registerCafe(request: CreateCafeInput): Observable<AdminCafe> {
    const payload: CreateCafeAccountRequestDto = {
      email: request.email,
      password: request.password,
      ownerName: request.ownerName ?? null,
      name: request.name,
      address: request.address,
      description: request.description ?? null,
      phoneNumber: request.phoneNumber ?? null,
      schedule: request.schedule ?? null,
      image: request.image ?? null,
    };

    return this.http.post<{ externalId: string }>(`${this.baseUrl}/register`, payload).pipe(
      switchMap((res) =>
        this.getCafeById(res.externalId).pipe(
          map(
            (cafe) =>
              cafe ??
              toAdminCafe({
                externalId: res.externalId,
                name: request.name,
                address: request.address,
                email: request.email,
                phoneNumber: request.phoneNumber ?? null,
                description: request.description ?? null,
                state: true,
                schedule: request.schedule ?? null,
                image: request.image ?? null,
              }),
          ),
        ),
      ),
    );
  }

  updateCafeStatus(externalId: string, state: boolean): Observable<AdminCafe> {
    return this.http
      .patch<AdminCafeDto>(`${this.baseUrl}/${externalId}/status`, { state })
      .pipe(map(toAdminCafe));
  }
}
