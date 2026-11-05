import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginCredentials, UserRole } from '../types/auth.model';
import { decodeToken, isTokenExpired } from '../utils/jwt';

export const TOKEN_KEY = 'authToken';
const KNOWN_ROLES: readonly string[] = ['ROLE_SUPERADMIN', 'ROLE_CAFETERIA', 'ROLE_CLIENTE'];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/auth`;

  private readonly _token = signal<string | null>(this.loadValidToken());
  readonly token = this._token.asReadonly();

  private readonly payload = computed(() => {
    const token = this._token();
    return token ? decodeToken(token) : null;
  });

  readonly isAuthenticated = computed(() => this.payload() !== null);
  readonly email = computed(() => this.payload()?.sub ?? null);
  readonly roles = computed(
    () => (this.payload()?.roles ?? []).filter((role) => KNOWN_ROLES.includes(role)) as UserRole[],
  );

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.url}/login`, credentials)
      .pipe(tap(({ token }) => this.saveToken(token)));
  }

  logout(): void {
    this.removeStoredToken();
    this._token.set(null);
  }

  hasRole(role: UserRole): boolean {
    return this.roles().includes(role);
  }

  private saveToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
    this._token.set(token);
  }

  private loadValidToken(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    const payload = token ? decodeToken(token) : null;
    if (!payload || isTokenExpired(payload)) {
      this.removeStoredToken();
      return null;
    }
    return token;
  }

  private removeStoredToken(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
}
