import { Observable } from 'rxjs';
import { AdminUser, UserStatus } from '../types/admin-user.model';

export abstract class AdminUserRepository {
  abstract getUsers(): Observable<readonly AdminUser[]>;
  abstract getUserById(id: string): Observable<AdminUser | null>;
  abstract updateUserStatus(id: string, status: UserStatus): Observable<AdminUser>;
}
