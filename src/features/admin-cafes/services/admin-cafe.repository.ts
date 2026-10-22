import { Observable } from 'rxjs';
import { AdminCafe, CreateCafeInput } from '../types/admin-cafe.model';

export abstract class AdminCafeRepository {
  abstract getCafes(): Observable<readonly AdminCafe[]>;
  abstract getCafeById(externalId: string): Observable<AdminCafe | null>;
  abstract registerCafe(request: CreateCafeInput): Observable<AdminCafe>;
  abstract updateCafeStatus(externalId: string, state: boolean): Observable<AdminCafe>;
}
