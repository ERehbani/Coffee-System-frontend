import { Observable } from 'rxjs';
import { CafeProfile, UpdateCafeProfileInput } from '../types/cafe-profile.model';

export abstract class CafeProfileRepository {
  abstract getProfile(): Observable<CafeProfile>;
  abstract updateProfile(externalId: string, input: UpdateCafeProfileInput): Observable<CafeProfile>;
}
