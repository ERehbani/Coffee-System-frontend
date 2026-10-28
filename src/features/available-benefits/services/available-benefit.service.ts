import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MOCK_CAFES } from '../../home/data/cafes.mock';
import { MOCK_AVAILABLE_BENEFITS } from '../data/available-benefits.mock';
import { AvailableBenefit } from '../model/available-benefit.model';

@Injectable({
  providedIn: 'root',
})
export class AvailableBenefitService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/benefits/available`;

  getAvailable(cafeId: string, type: string): Observable<AvailableBenefit[]> {
    if (environment.useMockApi) {
      return of(this.filterMock(cafeId, type));
    }

    let params = new HttpParams();
    if (cafeId) {
      params = params.set('cafeId', cafeId);
    }
    if (type) {
      params = params.set('type', type);
    }

    return this.http.get<AvailableBenefit[]>(this.url, { params });
  }

  private filterMock(cafeId: string, type: string): AvailableBenefit[] {
    const cafeName = MOCK_CAFES.find((cafe) => cafe.externalId === cafeId)?.name;

    return MOCK_AVAILABLE_BENEFITS.filter(
      (benefit) => (!cafeId || benefit.cafeEntity === cafeName) && (!type || benefit.benefitType === type)
    );
  }
}
