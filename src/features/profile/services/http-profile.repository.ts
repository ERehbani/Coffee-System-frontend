import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProfileDashboardDto } from '../types/profile.dto';
import { ProfileDashboard } from '../types/profile.model';
import { toProfileDashboard } from '../utils/profile.mapper';
import { ProfileRepository } from './profile.repository';

@Service({ autoProvided: false })
export class HttpProfileRepository implements ProfileRepository {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<ProfileDashboard> {
    return this.http
      .get<ProfileDashboardDto>(`${environment.apiBaseUrl}/clients/me/dashboard`)
      .pipe(map(toProfileDashboard));
  }
}
