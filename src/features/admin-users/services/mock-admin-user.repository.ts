import { inject, Injectable } from '@angular/core';
import { delay, map, Observable, of, throwError } from 'rxjs';
import { AdminUser, UserStatus } from '../types/admin-user.model';
import { toAdminUser, toAdminUserList } from '../utils/admin-user.mapper';
import { AdminUserRepository } from './admin-user.repository';
import { AdminUserService } from './admin-user.service';

export const MOCK_ADMIN_LATENCY_MS = 250;

@Injectable()
export class MockAdminUserRepository implements AdminUserRepository {
  private readonly userService = inject(AdminUserService);

  getUsers(): Observable<readonly AdminUser[]> {
    return this.userService.getUsers().pipe(
      delay(MOCK_ADMIN_LATENCY_MS),
      map(toAdminUserList),
    );
  }

  getUserById(id: string): Observable<AdminUser | null> {
    return this.userService.getUserById(id).pipe(
      delay(MOCK_ADMIN_LATENCY_MS),
      map((dto) => (dto ? toAdminUser(dto) : null)),
    );
  }

  updateUserStatus(id: string, status: UserStatus): Observable<AdminUser> {
    const updated = this.userService.updateUserStatus(id, status);
    if (!updated) {
      return throwError(() => new Error(`Usuario con ID ${id} no encontrado`));
    }

    return of(toAdminUser(updated)).pipe(delay(MOCK_ADMIN_LATENCY_MS));
  }
}
