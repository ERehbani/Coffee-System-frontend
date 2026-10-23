import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CreateGlobalBenefitInput, GlobalBenefit, GlobalBenefitDto, UpdateGlobalBenefitInput } from '../types/global-benefit.model';
import { toCreateRequestDto, toGlobalBenefit, toGlobalBenefitList } from '../utils/global-benefit.mapper';
import { GlobalBenefitRepository } from './global-benefit.repository';

@Injectable()
export class HttpGlobalBenefitRepository implements GlobalBenefitRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/benefits';

  getGlobalBenefits(): Observable<readonly GlobalBenefit[]> {
    return this.http.get<readonly GlobalBenefitDto[]>(this.baseUrl).pipe(map(toGlobalBenefitList));
  }

  getGlobalBenefitById(id: string): Observable<GlobalBenefit | null> {
    return this.http.get<GlobalBenefitDto>(`${this.baseUrl}/${id}`).pipe(map((d) => (d ? toGlobalBenefit(d) : null)));
  }

  createGlobalBenefit(input: CreateGlobalBenefitInput): Observable<GlobalBenefit> {
    return this.http.post<GlobalBenefitDto>(this.baseUrl, toCreateRequestDto(input)).pipe(map(toGlobalBenefit));
  }

  updateGlobalBenefit(input: UpdateGlobalBenefitInput): Observable<GlobalBenefit> {
    return this.http.put<GlobalBenefitDto>(`${this.baseUrl}/${input.id}`, input).pipe(map(toGlobalBenefit));
  }

  deleteGlobalBenefit(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  togglePublish(id: string, isPublic: boolean): Observable<GlobalBenefit> {
    return this.http.post<GlobalBenefitDto>(`${this.baseUrl}/${id}/${isPublic ? 'publish' : 'cancel'}`, {}).pipe(map(toGlobalBenefit));
  }

  toggleStatus(id: string, status: boolean): Observable<GlobalBenefit> {
    return this.http.post<GlobalBenefitDto>(`${this.baseUrl}/${id}/${status ? 'publish' : 'cancel'}`, {}).pipe(map(toGlobalBenefit));
  }

  changeEndDate(id: string, endDate: string): Observable<GlobalBenefit> {
    return this.http.post<GlobalBenefitDto>(`${this.baseUrl}/${id}/changeEndDate`, { endDate }).pipe(map(toGlobalBenefit));
  }
}
