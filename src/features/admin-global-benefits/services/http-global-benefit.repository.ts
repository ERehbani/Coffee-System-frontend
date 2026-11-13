import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
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
  private readonly typesUrl = `${environment.apiBaseUrl}/benefittypes`;

  getGlobalBenefits(): Observable<readonly GlobalBenefit[]> {
    return this.http.get<readonly GlobalBenefitDto[]>(this.baseUrl).pipe(map(toGlobalBenefitList));
  }

  getGlobalBenefitById(id: string): Observable<GlobalBenefit | null> {
    return this.http.get<GlobalBenefitDto>(`${this.baseUrl}/${id}`).pipe(map((d) => (d ? toGlobalBenefit(d) : null)));
  }

  private resolveIds(
    tier: string,
    tierId?: string,
    type?: string,
    typeId?: string,
  ): Observable<{ tierId: string; typeId: string }> {
    const isFakeTier = !tierId || tierId.startsWith('00000000-');
    const isFakeType = !typeId || typeId.startsWith('00000000-');

    if (!isFakeTier && !isFakeType) {
      return of({ tierId: tierId!, typeId: typeId! });
    }

    return forkJoin({
      tiers: this.http.get<{ externalId: string; name: string }[]>(this.tiersUrl).pipe(catchError(() => of([]))),
      types: this.http.get<{ externalId: string; name: string }[]>(this.typesUrl).pipe(catchError(() => of([]))),
    }).pipe(
      map(({ tiers, types }) => {
        let finalTierId = tierId;
        if (isFakeTier) {
          const targetTier = tier === 'ALL' ? 'BRONCE' : tier;
          const found = tiers.find((t) => t.name.toUpperCase() === targetTier.toUpperCase()) || tiers[0];
          finalTierId = found ? found.externalId : tierId;
        }

        let finalTypeId = typeId;
        if (isFakeType) {
          const found = types.find((t) => t.name.toUpperCase() === type?.toUpperCase()) || types[0];
          finalTypeId = found ? found.externalId : typeId;
        }

        return {
          tierId: finalTierId || '',
          typeId: finalTypeId || '',
        };
      }),
    );
  }

  createGlobalBenefit(input: CreateGlobalBenefitInput): Observable<GlobalBenefit> {
    return this.resolveIds(input.tier, input.tierId, input.type, input.typeId).pipe(
      switchMap(({ tierId, typeId }) => {
        const resolvedInput: CreateGlobalBenefitInput = {
          ...input,
          tierId,
          typeId,
        };
        return this.http.post<GlobalBenefitDto>(this.baseUrl, toCreateRequestDto(resolvedInput));
      }),
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
    return this.resolveIds(input.tier, input.tierId, input.type, input.typeId).pipe(
      switchMap(({ tierId, typeId }) => {
        const resolvedInput: UpdateGlobalBenefitInput = {
          ...input,
          tierId,
          typeId,
        };
        return this.http.put<GlobalBenefitDto>(`${this.baseUrl}/${input.id}`, toUpdateRequestDto(resolvedInput)).pipe(
          map(toGlobalBenefit),
        );
      }),
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
