import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CafeResponseDto } from '../types/cafe-profile.dto';
import { CafeProfile, UpdateCafeProfileInput } from '../types/cafe-profile.model';
import { toCafeProfile, toUpdateCafeRequestDto } from '../utils/cafe-profile.mapper';
import { CafeProfileRepository } from './cafe-profile.repository';

@Injectable()
export class HttpCafeProfileRepository implements CafeProfileRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getProfile(externalId?: string): Observable<CafeProfile> {
    const url = externalId ? `${this.baseUrl}/cafes/${externalId}` : `${this.baseUrl}/cafes/me`;
    return this.http
      .get<CafeResponseDto>(url)
      .pipe(map(toCafeProfile));
  }

  updateProfile(externalId: string, input: UpdateCafeProfileInput): Observable<CafeProfile> {
    const payload = toUpdateCafeRequestDto(input);
    return this.http
      .put<CafeResponseDto>(`${this.baseUrl}/cafes/${externalId}`, payload)
      .pipe(map(toCafeProfile));
  }
}
