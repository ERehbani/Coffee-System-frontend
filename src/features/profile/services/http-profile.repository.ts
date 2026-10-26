import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ClientProfileDto,
  ProfileDashboardDto,
  RedemptionDto,
  TierBenefitDto,
  TierDetailDto,
} from '../types/profile.dto';
import {
  ClientProfile,
  ProfileDashboard,
  RedeemedBenefit,
  TierBenefit,
  TierDetail,
  UpdateClientProfileInput,
  UsedBenefit,
} from '../types/profile.model';
import {
  toClientProfile,
  toProfileDashboard,
  toRedeemedBenefit,
  toTierBenefits,
  toTierDetail,
  toUpdateClientProfileDto,
  toUsedBenefits,
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

  getTierBenefits(): Observable<readonly TierBenefit[]> {
    return this.http
      .get<TierBenefitDto[]>(`${environment.apiBaseUrl}/clients/me/benefits`)
      .pipe(map(toTierBenefits));
  }

  redeemBenefit(benefitId: string): Observable<RedeemedBenefit> {
    return this.http
      .post<RedemptionDto>(`${environment.apiBaseUrl}/redemption`, { benefitId })
      .pipe(map(toRedeemedBenefit));
  }

  getUsedBenefits(): Observable<readonly UsedBenefit[]> {
    const params = new HttpParams().set('state', false);
    return this.http
      .get<RedemptionDto[]>(`${environment.apiBaseUrl}/redemption`, { params })
      .pipe(map(toUsedBenefits));
  }

  updateProfile(clientId: string, input: UpdateClientProfileInput): Observable<ClientProfile> {
    const payload = toUpdateClientProfileDto(input);
    return this.http
      .put<ClientProfileDto>(`${environment.apiBaseUrl}/clients/${clientId}`, payload)
      .pipe(map(toClientProfile));
  }
}
