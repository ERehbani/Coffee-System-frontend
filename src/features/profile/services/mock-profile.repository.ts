import { Service } from '@angular/core';
import { defer, delay, map, Observable, of } from 'rxjs';
import { ProfileDashboard } from '../types/profile.model';
import { buildProfileDashboardFixture } from '../utils/profile.fixture';
import { toProfileDashboard } from '../utils/profile.mapper';
import { ProfileRepository } from './profile.repository';

export const MOCK_LATENCY_MS = 400;

@Service({ autoProvided: false })
export class MockProfileRepository implements ProfileRepository {
  getDashboard(): Observable<ProfileDashboard> {
    return defer(() => of(buildProfileDashboardFixture(new Date()))).pipe(
      delay(MOCK_LATENCY_MS),
      map(toProfileDashboard),
    );
  }
}
