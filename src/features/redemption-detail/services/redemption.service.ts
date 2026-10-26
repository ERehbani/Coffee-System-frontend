import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MOCK_REDEMPTIONS } from '../data/redemptions.mock';
import { Redemption } from '../model/redemption.model';

@Injectable({
  providedIn: 'root',
})
export class RedemptionService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/redemption`;

  getById(externalId: string): Observable<Redemption | undefined> {
    if (environment.useMockApi) {
      return of(MOCK_REDEMPTIONS.find((r) => r.externalId === externalId));
    }

    return this.http.get<Redemption>(`${this.url}/${externalId}`);
  }
}
