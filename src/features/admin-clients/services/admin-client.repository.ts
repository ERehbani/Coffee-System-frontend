import { Observable } from 'rxjs';
import { AdminClient } from '../types/admin-client.model';

export abstract class AdminClientRepository {
  abstract getClients(): Observable<readonly AdminClient[]>;
}
