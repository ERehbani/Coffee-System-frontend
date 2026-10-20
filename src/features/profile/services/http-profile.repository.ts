import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClientProfileDto, ProfileDashboardDto, TierDetailDto } from '../types/profile.dto';
import {
  ClientProfile,
  ProfileDashboard,
  TierDetail,
  UpdateClientProfileInput,
} from '../types/profile.model';
import {
  toClientProfile,
  toProfileDashboard,
  toTierDetail,
  toUpdateClientProfileDto,
} from '../utils/profile.mapper';
import { ProfileRepository } from './profile.repository';

@Service({ autoProvided: false })
export class HttpProfileRepository implements ProfileRepository {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<ProfileDashboard> {
    return this.http
      .get<ProfileDashboardDto>(`${environment.apiBaseUrl}/clients/me/dashboard`)
      .pipe(map(toProfileDashboard));
  }

  getTierDetail(): Observable<TierDetail> {
    return this.http
      .get<TierDetailDto>(`${environment.apiBaseUrl}/clients/me/tier`)
      .pipe(map(toTierDetail));
  }

  updateProfile(clientId: string, input: UpdateClientProfileInput): Observable<ClientProfile> {
    const payload = toUpdateClientProfileDto(input);
    return this.http
      .put<ClientProfileDto>(`${environment.apiBaseUrl}/clients/${clientId}`, payload)
      .pipe(map(toClientProfile));
  }
}
