import { Service } from '@angular/core';
import { defer, delay, map, Observable, of } from 'rxjs';
import { ClientProfileDto, ProfileDashboardDto } from '../types/profile.dto';
import {
  ClientProfile,
  ProfileDashboard,
  TierDetail,
  UpdateClientProfileInput,
} from '../types/profile.model';
import { buildProfileDashboardFixture, buildTierDetailFixture } from '../utils/profile.fixture';
import { toClientProfile, toProfileDashboard, toTierDetail } from '../utils/profile.mapper';
import { ProfileRepository } from './profile.repository';

export const MOCK_LATENCY_MS = 400;

@Service({ autoProvided: false })
export class MockProfileRepository implements ProfileRepository {
  private currentDashboard: ProfileDashboardDto = buildProfileDashboardFixture(new Date());

  getDashboard(): Observable<ProfileDashboard> {
    return defer(() => of(this.currentDashboard)).pipe(
      delay(MOCK_LATENCY_MS),
      map(toProfileDashboard),
    );
  }

  getTierDetail(): Observable<TierDetail> {
    return defer(() => of(buildTierDetailFixture())).pipe(
      delay(MOCK_LATENCY_MS),
      map(toTierDetail),
    );
  }

  updateProfile(clientId: string, input: UpdateClientProfileInput): Observable<ClientProfile> {
    const updatedClientDto: ClientProfileDto = {
      id: clientId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phoneNumber: input.phoneNumber,
      avatarUrl: input.avatarUrl,
    };

    this.currentDashboard = {
      ...this.currentDashboard,
      client: updatedClientDto,
    };

    return defer(() => of(updatedClientDto)).pipe(
      delay(MOCK_LATENCY_MS),
      map(toClientProfile),
    );
  }
}
