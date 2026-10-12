import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClientDashboard } from '../domain/client-dashboard.model';
import { ClientDashboardRepository } from '../domain/client-dashboard.repository';
import { ClientDashboardDto } from './client-dashboard.dto';
import { mapClientDashboardDto } from './client-dashboard.mapper';

@Service({ autoProvided: false })
export class HttpClientDashboardRepository implements ClientDashboardRepository {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<ClientDashboard> {
    return this.http
      .get<ClientDashboardDto>(`${environment.apiBaseUrl}/clients/me/dashboard`)
      .pipe(map(mapClientDashboardDto));
  }
}
