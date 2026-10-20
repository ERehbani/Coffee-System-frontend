import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AdminUserDto } from '../types/admin-user.dto';
import { AdminUser, UserStatus } from '../types/admin-user.model';
import { toAdminUser, toAdminUserList } from '../utils/admin-user.mapper';
import { AdminUserRepository } from './admin-user.repository';

@Injectable()
export class HttpAdminUserRepository implements AdminUserRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/admin/users';

  getUsers(): Observable<readonly AdminUser[]> {
    return this.http.get<readonly AdminUserDto[]>(this.baseUrl).pipe(map(toAdminUserList));
  }

  getUserById(id: string): Observable<AdminUser | null> {
    return this.http
      .get<AdminUserDto>(`${this.baseUrl}/${id}`)
      .pipe(map((dto) => (dto ? toAdminUser(dto) : null)));
  }

  updateUserStatus(id: string, status: UserStatus): Observable<AdminUser> {
    return this.http
      .patch<AdminUserDto>(`${this.baseUrl}/${id}/status`, { status })
      .pipe(map(toAdminUser));
  }
}
