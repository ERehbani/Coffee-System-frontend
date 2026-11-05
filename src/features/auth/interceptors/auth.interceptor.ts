import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

const API_PREFIX = environment.apiBaseUrl;
const AUTH_PREFIX = `${environment.apiBaseUrl}/auth/`;
export const SESSION_EXPIRED_REASON = 'Tu sesión expiró, volvé a iniciar sesión.';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token();

  const isApiRequest = req.url.startsWith(API_PREFIX);
  const isAuthRequest = req.url.startsWith(AUTH_PREFIX);
  if (!isApiRequest || isAuthRequest || !token) {
    return next(req);
  }

  const authorizedRequest = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authorizedRequest).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized) {
        auth.logout();
        router.navigate(['/login'], { queryParams: { reason: SESSION_EXPIRED_REASON } });
      }
      return throwError(() => error);
    }),
  );
};
