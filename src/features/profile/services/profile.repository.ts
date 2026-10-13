import { Observable } from 'rxjs';
import { ProfileDashboard } from '../types/profile.model';

/** Port: where the dashboard of the authenticated client comes from. */
export abstract class ProfileRepository {
  abstract getDashboard(): Observable<ProfileDashboard>;
}
