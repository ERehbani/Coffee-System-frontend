import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BenefitFormatCode } from '../../admin-benefit-types/types/benefit-format.model';
import { AvailableBenefit } from '../model/available-benefit.model';

@Injectable({
  providedIn: 'root',
})
export class AvailableBenefitService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/benefits/available`;

  getAvailable(cafeId: string, type: BenefitFormatCode | ''): Observable<AvailableBenefit[]> {
    let params = new HttpParams();
    if (cafeId) {
      params = params.set('cafeId', cafeId);
    }
    if (type) {
      params = params.set('type', type);
    }
    return this.http.get<AvailableBenefit[]>(this.url, { params });
  }
}
