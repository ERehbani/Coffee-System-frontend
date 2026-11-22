import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BenefitFormatCode } from '../../admin-benefit-types/types/benefit-format.model';
import { AvailableBenefit } from '../model/available-benefit.model';

@Injectable({
  providedIn: 'root',
})
export class AvailableBenefitService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/benefits`;
  private readonly loaded = new Map<string, AvailableBenefit>();

  getAvailable(cafeId: string, type: BenefitFormatCode | ''): Observable<AvailableBenefit[]> {
    let params = new HttpParams();
    if (cafeId) {
      params = params.set('cafeId', cafeId);
    }
    if (type) {
      params = params.set('type', type);
    }
    return this.http
      .get<AvailableBenefit[]>(`${this.baseUrl}/available`, { params })
      .pipe(tap((benefits) => benefits.forEach((benefit) => this.loaded.set(benefit.externalId, benefit))));
  }

  /** The benefit as the last list or detail request loaded it, so the detail page opens without asking again. */
  findLoaded(externalId: string): AvailableBenefit | undefined {
    return this.loaded.get(externalId);
  }

  getById(externalId: string): Observable<AvailableBenefit> {
    return this.http
      .get<AvailableBenefit>(`${this.baseUrl}/${externalId}`)
      .pipe(tap((benefit) => this.loaded.set(benefit.externalId, benefit)));
  }
}
