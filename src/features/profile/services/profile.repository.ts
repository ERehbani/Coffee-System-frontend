import { Observable } from 'rxjs';
import { ProfileDashboard } from '../types/profile.model';

export abstract class ProfileRepository {
  abstract getDashboard(): Observable<ProfileDashboard>;
}
