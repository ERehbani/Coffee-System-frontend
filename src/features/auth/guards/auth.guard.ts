import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../types/auth.model';
import { getHomeForRoles } from '../utils/role-home';

function redirectToRoleHome(auth: AuthService, router: Router): UrlTree {
  const home = getHomeForRoles(auth.roles());
  if (home === '/login') {
    auth.logout();
  }
  return router.parseUrl(home);
}

export function roleGuard(role: UserRole): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      return router.parseUrl('/login');
    }
    return auth.hasRole(role) ? true : redirectToRoleHome(auth, router);
  };
}

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? redirectToRoleHome(auth, router) : true;
};
