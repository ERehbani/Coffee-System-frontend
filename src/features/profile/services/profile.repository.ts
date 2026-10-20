import { Observable } from 'rxjs';
import {
  ClientProfile,
  ProfileDashboard,
  TierDetail,
  UpdateClientProfileInput,
} from '../types/profile.model';

export abstract class ProfileRepository {
  abstract getDashboard(): Observable<ProfileDashboard>;
  abstract getTierDetail(): Observable<TierDetail>;
  abstract updateProfile(clientId: string, input: UpdateClientProfileInput): Observable<ClientProfile>;
}
