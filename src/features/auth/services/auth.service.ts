import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Observable, catchError, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginCredentials, RegisterRequest, RegisteredUser, SessionUser, UserRole } from '../types/auth.model';

const KNOWN_ROLES: readonly string[] = ['ROLE_SUPERADMIN', 'ROLE_CAFETERIA', 'ROLE_CLIENTE'];

function isKnownRole(role: string): role is UserRole {
  return KNOWN_ROLES.includes(role);
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly url = `${environment.apiBaseUrl}/auth`;

  private readonly user = signal<SessionUser | null>(null);
  private session$: Observable<SessionUser | null> | null = null;

  readonly isAuthenticated = computed(() => this.user() !== null);
  readonly email = computed(() => this.user()?.email ?? null);
  readonly roles = computed(() => (this.user()?.roles ?? []).filter(isKnownRole));

  login(credentials: LoginCredentials): Observable<SessionUser> {
    return this.http
      .post<SessionUser>(`${this.url}/login`, credentials)
      .pipe(tap((user) => this.startSession(user)));
  }

  register(request: RegisterRequest): Observable<RegisteredUser> {
    return this.http.post<RegisteredUser>(`${this.url}/register`, request);
  }

  logout(): Observable<void> {
    this.clearSession();
    return this.http.post<void>(`${this.url}/logout`, null).pipe(catchError(() => of(undefined)));
  }

  loadSession(): Observable<SessionUser | null> {
    if (!this.isBrowser) {
      return of(null);
    }
    this.session$ ??= this.http.get<SessionUser>(`${this.url}/me`).pipe(
      catchError(() => of(null)),
      tap((user) => this.user.set(user)),
      shareReplay(1),
    );
    return this.session$;
  }

  startSession(user: SessionUser): void {
    this.user.set(user);
    this.session$ = of(user);
  }

  clearSession(): void {
    this.user.set(null);
    this.session$ = of(null);
  }

  hasRole(role: UserRole): boolean {
    return this.roles().includes(role);
  }
}
