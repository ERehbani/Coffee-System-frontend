import { Injectable } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';
import { CafeProfile, UpdateCafeProfileInput } from '../types/cafe-profile.model';
import { CAFE_PROFILE_FIXTURE } from '../utils/cafe-profile.fixture';
import { toCafeProfile } from '../utils/cafe-profile.mapper';
import { CafeProfileRepository } from './cafe-profile.repository';

export const MOCK_LATENCY_MS = 400;

@Injectable()
export class MockCafeProfileRepository implements CafeProfileRepository {
  private currentCafe = { ...CAFE_PROFILE_FIXTURE };

  getProfile(_externalId?: string): Observable<CafeProfile> {
    return of(this.currentCafe).pipe(
      delay(MOCK_LATENCY_MS),
      map(toCafeProfile),
    );
  }

  updateProfile(externalId: string, input: UpdateCafeProfileInput): Observable<CafeProfile> {
    this.currentCafe = {
      ...this.currentCafe,
      externalId,
      address: input.address,
      phoneNumber: input.phoneNumber,
      description: input.description,
      schedule: input.schedule,
      image: input.image,
    };

    return of(this.currentCafe).pipe(
      delay(MOCK_LATENCY_MS),
      map(toCafeProfile),
    );
  }
}
