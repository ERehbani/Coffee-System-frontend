import { UserRole } from '../types/auth.model';

export const LOGIN_PATH = '/login';
export const REGISTER_PATH = '/register';
export const ACCOUNT_CREATED_REASON = 'registered';

const HOME_BY_ROLE: Record<UserRole, string> = {
  ROLE_SUPERADMIN: '/admin',
  ROLE_CAFETERIA: '/cafe/dashboard',
  ROLE_CLIENTE: '/home',
};

const LOGIN_BY_ROLE: Record<UserRole, string> = {
  ROLE_SUPERADMIN: '/superadmin/login',
  ROLE_CAFETERIA: '/cafe/login',
  ROLE_CLIENTE: LOGIN_PATH,
};

export function getHomeForRoles(roles: readonly UserRole[]): string {
  const role = roles[0];
  return role ? HOME_BY_ROLE[role] : LOGIN_PATH;
}

export function getLoginForRoles(roles: readonly UserRole[]): string {
  const role = roles[0];
  return role ? LOGIN_BY_ROLE[role] : LOGIN_PATH;
}
