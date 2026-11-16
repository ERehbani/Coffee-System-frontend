import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../types/auth.model';
import { LOGIN_PATH, getHomeForRoles } from '../utils/role-home';

function redirectToRoleHome(auth: AuthService, router: Router): UrlTree {
  const home = getHomeForRoles(auth.roles());
  if (home === LOGIN_PATH) {
    auth.logout().subscribe();
  }
  return router.parseUrl(home);
}

function checkRole(auth: AuthService, router: Router, role: UserRole): boolean | UrlTree {
  if (!auth.isAuthenticated()) {
    return router.parseUrl(LOGIN_PATH);
  }
  return auth.hasRole(role) ? true : redirectToRoleHome(auth, router);
}

export function roleGuard(role: UserRole): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    return auth.loadSession().pipe(map(() => checkRole(auth, router, role)));
  };
}

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth
    .loadSession()
    .pipe(map(() => (auth.isAuthenticated() ? redirectToRoleHome(auth, router) : true)));
};
