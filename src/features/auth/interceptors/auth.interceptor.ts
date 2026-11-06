import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { LOGIN_PATH } from '../utils/role-home';

const API_PREFIX = environment.apiBaseUrl;
const AUTH_PREFIX = `${environment.apiBaseUrl}/auth/`;
export const SESSION_EXPIRED_REASON = 'Tu sesión expiró, volvé a iniciar sesión.';

function isUnauthorized(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiRequest = req.url.startsWith(API_PREFIX);
  const isAuthRequest = req.url.startsWith(AUTH_PREFIX);
  if (!isApiRequest || isAuthRequest) {
    return next(req);
  }

  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (isUnauthorized(error) && auth.isAuthenticated()) {
        auth.clearSession();
        router.navigate([LOGIN_PATH], { queryParams: { reason: SESSION_EXPIRED_REASON } });
      }
      return throwError(() => error);
    }),
  );
};
