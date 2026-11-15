import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CafeDashboard } from '../types/cafe-dashboard.model';

@Injectable({ providedIn: 'root' })
export class CafeDashboardService {
  private readonly http = inject(HttpClient);

  getMine(): Observable<CafeDashboard> {
    return this.http.get<CafeDashboard>(`${environment.apiBaseUrl}/cafes/me/dashboard`);
  }
}
