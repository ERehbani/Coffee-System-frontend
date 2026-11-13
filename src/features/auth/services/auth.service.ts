import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginCredentials, SessionUser, UserRole } from '../types/auth.model';

const KNOWN_ROLES: readonly string[] = ['ROLE_SUPERADMIN', 'ROLE_CAFETERIA', 'ROLE_CLIENTE'];

interface AuthLoginResponse {
  token?: string;
  email?: string;
  roles?: string[];
}

interface DecodedToken {
  sub?: string;
  roles?: string[];
  exp?: number;
}

function isKnownRole(role: string): role is UserRole {
  return KNOWN_ROLES.includes(role);
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly url = `${environment.apiBaseUrl}/auth`;

  private readonly user = signal<SessionUser | null>(null);
  private readonly token = signal<string | null>(null);
  private session$: Observable<SessionUser | null> | null = null;

  readonly isAuthenticated = computed(() => this.user() !== null);
  readonly email = computed(() => this.user()?.email ?? null);
  readonly roles = computed(() => (this.user()?.roles ?? []).filter(isKnownRole));

  getToken(): string | null {
    if (this.token()) {
      return this.token();
    }
    if (this.isBrowser) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  login(credentials: LoginCredentials): Observable<SessionUser> {
    return this.http
      .post<AuthLoginResponse>(`${this.url}/login`, credentials)
      .pipe(
        map((res) => {
          let email = res.email || credentials.email;
          let roles: string[] = res.roles || [];
          if (res.token) {
            const payload = this.decodeToken(res.token);
            if (payload) {
              email = payload.sub || email;
              roles = payload.roles || roles;
            }
          }
          const user: SessionUser = { email, roles };
          this.startSession(user, res.token);
          return user;
        }),
      );
  }

  logout(): Observable<void> {
    this.clearSession();
    return this.http.post<void>(`${this.url}/logout`, null).pipe(catchError(() => of(undefined)));
  }

  loadSession(): Observable<SessionUser | null> {
    if (!this.isBrowser) {
      return of(null);
    }
    const token = this.getToken();
    if (token) {
      const payload = this.decodeToken(token);
      if (payload && (!payload.exp || payload.exp * 1000 > Date.now())) {
        const email = payload.sub || '';
        const roles = payload.roles || [];
        const user: SessionUser = { email, roles };
        this.user.set(user);
        this.token.set(token);
        this.session$ = of(user);
        return this.session$;
      } else {
        this.clearSession();
      }
    }
    this.session$ ??= this.http.get<SessionUser>(`${this.url}/me`).pipe(
      catchError(() => of(null)),
      tap((user) => this.user.set(user)),
      shareReplay(1),
    );
    return this.session$;
  }

  startSession(user: SessionUser, token?: string): void {
    this.user.set(user);
    this.session$ = of(user);
    if (token) {
      this.token.set(token);
      if (this.isBrowser) {
        localStorage.setItem('auth_token', token);
      }
    } else {
      this.token.set(null);
      if (this.isBrowser) {
        localStorage.removeItem('auth_token');
      }
    }
  }

  clearSession(): void {
    this.user.set(null);
    this.token.set(null);
    this.session$ = of(null);
    if (this.isBrowser) {
      localStorage.removeItem('auth_token');
    }
  }

  hasRole(role: UserRole): boolean {
    return this.roles().includes(role);
  }

  private decodeToken(token: string): DecodedToken | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload) as DecodedToken;
    } catch {
      return null;
    }
  }
}
