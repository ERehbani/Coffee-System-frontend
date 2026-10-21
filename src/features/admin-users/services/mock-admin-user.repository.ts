import { Injectable } from '@angular/core';
import { delay, map, Observable, of, throwError } from 'rxjs';
import { AdminUserDto } from '../types/admin-user.dto';
import { AdminUser, UserStatus } from '../types/admin-user.model';
import { ADMIN_USERS_FIXTURE } from '../utils/admin-user.fixture';
import { toAdminUser, toAdminUserList } from '../utils/admin-user.mapper';
import { AdminUserRepository } from './admin-user.repository';

export const MOCK_ADMIN_LATENCY_MS = 250;

@Injectable()
export class MockAdminUserRepository implements AdminUserRepository {
  private users: AdminUserDto[] = ADMIN_USERS_FIXTURE.map((u) => ({ ...u }));

  getUsers(): Observable<readonly AdminUser[]> {
    return of(this.users).pipe(
      delay(MOCK_ADMIN_LATENCY_MS),
      map(toAdminUserList),
    );
  }

  getClients(): Observable<readonly AdminUser[]> {
    return of(this.users.filter((u) => u.role === 'client')).pipe(
      delay(MOCK_ADMIN_LATENCY_MS),
      map(toAdminUserList),
    );
  }

  getUserById(id: string): Observable<AdminUser | null> {
    const found = this.users.find((u) => u.id === id);
    return of(found ? toAdminUser(found) : null).pipe(
      delay(MOCK_ADMIN_LATENCY_MS),
    );
  }

  updateUserStatus(id: string, status: UserStatus): Observable<AdminUser> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Usuario con ID ${id} no encontrado`));
    }

    const current = this.users[index];
    let updatedNotes = current.notes;
    if (status === 'active' && current.role === 'cafe_admin' && current.status === 'pending') {
      updatedNotes = 'Cafetería aprobada y activada por Superadmin.';
    } else if (status === 'inactive') {
      updatedNotes = 'Usuario dado de baja por Superadmin.';
    }

    const updatedDto: AdminUserDto = {
      ...current,
      status,
      notes: updatedNotes,
    };

    this.users[index] = updatedDto;

    return of(toAdminUser(updatedDto)).pipe(
      delay(MOCK_ADMIN_LATENCY_MS),
    );
  }
}
