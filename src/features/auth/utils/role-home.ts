import { UserRole } from '../types/auth.model';

export const LOGIN_PATH = '/login';

const HOME_BY_ROLE: Record<UserRole, string> = {
  ROLE_SUPERADMIN: '/admin',
  ROLE_CAFETERIA: '/cafe/profile',
  ROLE_CLIENTE: '/home',
};

export function getHomeForRoles(roles: readonly UserRole[]): string {
  const role = roles.find((item) => item in HOME_BY_ROLE);
  return role ? HOME_BY_ROLE[role] : LOGIN_PATH;
}
