import { Observable } from 'rxjs';
import { ClientDashboard } from './client-dashboard.model';

/** Port: where the dashboard of the authenticated client comes from. */
export abstract class ClientDashboardRepository {
  abstract getDashboard(): Observable<ClientDashboard>;
}
