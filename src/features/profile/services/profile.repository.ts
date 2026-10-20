import { Observable } from 'rxjs';
import { ProfileDashboard, TierDetail } from '../types/profile.model';

export abstract class ProfileRepository {
  abstract getDashboard(): Observable<ProfileDashboard>;
  abstract getTierDetail(): Observable<TierDetail>;
}
