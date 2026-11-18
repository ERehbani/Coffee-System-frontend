import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ALL_ITEMS, Page } from '../../../shared/types/page';
import {
  ProfileDashboardDto,
  RedemptionDto,
  TierBenefitDto,
  TierDetailDto,
  UpdatedClientDto,
} from '../types/profile.dto';
import {
  ProfileDashboard,
  RedeemedBenefit,
  SavedClientProfile,
  TierBenefit,
  TierDetail,
  UpdateClientProfileInput,
  UsedBenefit,
} from '../types/profile.model';
import {
  toProfileDashboard,
  toRedeemedBenefit,
  toSavedClientProfile,
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
    // The status filter takes one value and the history shows used and expired coupons.
    return this.http
      .get<Page<RedemptionDto>>(`${environment.apiBaseUrl}/redemption`, { params: ALL_ITEMS })
      .pipe(map((page) => toUsedBenefits(page.content)));
  }

  updateProfile(
    clientId: string,
    input: UpdateClientProfileInput,
  ): Observable<SavedClientProfile> {
    const payload = toUpdateClientProfileDto(input);
    return this.http
      .put<UpdatedClientDto>(`${environment.apiBaseUrl}/clients/${clientId}`, payload)
      .pipe(map(toSavedClientProfile));
  }
}
