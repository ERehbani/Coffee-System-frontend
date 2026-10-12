import { Service } from '@angular/core';
import { defer, delay, map, Observable, of } from 'rxjs';
import { ClientDashboard } from '../domain/client-dashboard.model';
import { ClientDashboardRepository } from '../domain/client-dashboard.repository';
import { buildClientDashboardFixture } from './client-dashboard.fixture';
import { mapClientDashboardDto } from './client-dashboard.mapper';

export const MOCK_LATENCY_MS = 400;

/** Serves the design fixture through the same DTO mapping as the HTTP adapter. */
@Service({ autoProvided: false })
export class MockClientDashboardRepository implements ClientDashboardRepository {
  getDashboard(): Observable<ClientDashboard> {
    return defer(() => of(buildClientDashboardFixture(new Date()))).pipe(
      delay(MOCK_LATENCY_MS),
      map(mapClientDashboardDto),
    );
  }
}
