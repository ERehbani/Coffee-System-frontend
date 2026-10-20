import { Observable } from 'rxjs';
import { ClientProfile, ProfileDashboard, UpdateClientProfileInput } from '../types/profile.model';

export abstract class ProfileRepository {
  abstract getDashboard(): Observable<ProfileDashboard>;
  abstract updateProfile(clientId: string, input: UpdateClientProfileInput): Observable<ClientProfile>;
}
