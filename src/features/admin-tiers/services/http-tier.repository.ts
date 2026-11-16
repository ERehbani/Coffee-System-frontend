import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TierDto } from '../types/tier.dto';
import { SaveTierInput, Tier } from '../types/tier.model';
import { toTier, toTierList, toTierRequestDto } from '../utils/tier.mapper';
import { TierRepository } from './tier.repository';

@Injectable()
export class HttpTierRepository implements TierRepository {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/tiers`;

  getTiers(): Observable<readonly Tier[]> {
    return this.http.get<readonly TierDto[]>(this.url).pipe(map(toTierList));
  }

  createTier(input: SaveTierInput): Observable<Tier> {
    return this.http.post<TierDto>(this.url, toTierRequestDto(input)).pipe(map(toTier));
  }

  updateTier(id: string, input: SaveTierInput): Observable<Tier> {
    return this.http.put<TierDto>(`${this.url}/${id}`, toTierRequestDto(input)).pipe(map(toTier));
  }
}
