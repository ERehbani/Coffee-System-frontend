import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CatalogProductOption,
  CreateGlobalBenefitInput,
  GlobalBenefit,
  GlobalBenefitDto,
  UpdateGlobalBenefitInput,
} from '../types/global-benefit.model';
import {
  toCreateRequestDto,
  toGlobalBenefit,
  toGlobalBenefitList,
  toUpdateRequestDto,
} from '../utils/global-benefit.mapper';
import { GlobalBenefitRepository } from './global-benefit.repository';

@Injectable()
export class HttpGlobalBenefitRepository implements GlobalBenefitRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/benefits`;
  private readonly tiersUrl = `${environment.apiBaseUrl}/tiers`;
  private readonly catalogUrl = `${environment.apiBaseUrl}/catalog-products`;

  getGlobalBenefits(): Observable<readonly GlobalBenefit[]> {
    return this.http.get<readonly GlobalBenefitDto[]>(this.baseUrl).pipe(map(toGlobalBenefitList));
  }

  getGlobalBenefitById(id: string): Observable<GlobalBenefit | null> {
    return this.http.get<GlobalBenefitDto>(`${this.baseUrl}/${id}`).pipe(map((d) => (d ? toGlobalBenefit(d) : null)));
  }

  getCatalogProducts(): Observable<readonly CatalogProductOption[]> {
    return this.http
      .get<{ externalId: string; name: string; active: boolean }[]>(this.catalogUrl)
      .pipe(map((products) => products.filter((p) => p.active).map((p) => ({ id: p.externalId, name: p.name }))));
  }

  private resolveTierId(tier: string, tierId?: string): Observable<string> {
    if (tierId && !tierId.startsWith('00000000-')) {
      return of(tierId);
    }
    return this.http.get<{ externalId: string; name: string }[]>(this.tiersUrl).pipe(
      catchError(() => of([])),
      map((tiers) => {
        const targetTier = tier === 'ALL' ? 'BRONCE' : tier;
        const found = tiers.find((t) => t.name.toUpperCase() === targetTier.toUpperCase()) || tiers[0];
        return found ? found.externalId : tierId || '';
      }),
    );
  }

  createGlobalBenefit(input: CreateGlobalBenefitInput): Observable<GlobalBenefit> {
    return this.resolveTierId(input.tier, input.tierId).pipe(
      switchMap((tierId) => this.http.post<GlobalBenefitDto>(this.baseUrl, toCreateRequestDto({ ...input, tierId }))),
      switchMap((created) => {
        if (input.isPublic) {
          return this.http.post<GlobalBenefitDto>(`${this.baseUrl}/${created.externalId}/publish`, {}).pipe(
            map(toGlobalBenefit),
            catchError(() => of(toGlobalBenefit(created))),
          );
        }
        return of(toGlobalBenefit(created));
      }),
    );
  }

  updateGlobalBenefit(input: UpdateGlobalBenefitInput): Observable<GlobalBenefit> {
    return this.resolveTierId(input.tier, input.tierId).pipe(
      switchMap((tierId) =>
        this.http.put<GlobalBenefitDto>(`${this.baseUrl}/${input.id}`, toUpdateRequestDto({ ...input, tierId })),
      ),
      map(toGlobalBenefit),
    );
  }

  deleteGlobalBenefit(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  togglePublish(id: string, isPublic: boolean): Observable<GlobalBenefit> {
    return this.http.post<GlobalBenefitDto>(`${this.baseUrl}/${id}/${isPublic ? 'publish' : 'cancel'}`, {}).pipe(map(toGlobalBenefit));
  }

  toggleStatus(id: string, status: boolean): Observable<GlobalBenefit> {
    return this.togglePublish(id, status);
  }

  changeEndDate(id: string, endDate: string): Observable<GlobalBenefit> {
    return this.http.post<GlobalBenefitDto>(`${this.baseUrl}/${id}/changeEndDate`, { endDate }).pipe(map(toGlobalBenefit));
  }
}
