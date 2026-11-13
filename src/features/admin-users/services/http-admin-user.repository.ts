import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminUser, UserStatus } from '../types/admin-user.model';
import { toAdminUser, toAdminUserList } from '../utils/admin-user.mapper';
import { AdminUserRepository } from './admin-user.repository';

@Injectable()
export class HttpAdminUserRepository implements AdminUserRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/users`;

  getUsers(): Observable<readonly AdminUser[]> {
    return this.http.get<readonly any[]>(this.baseUrl).pipe(map(toAdminUserList));
  }

  getUserById(id: string): Observable<AdminUser | null> {
    return this.http
      .get<any>(`${this.baseUrl}/${id}`)
      .pipe(map((dto) => (dto ? toAdminUser(dto) : null)));
  }

  updateUserStatus(id: string, status: UserStatus): Observable<AdminUser> {
    const state = status === 'active';
    return this.http
      .put<any>(`${this.baseUrl}/${id}`, { state })
      .pipe(map((res) => toAdminUser({ ...res, status })));
  }
}
