import { AdminUserDto, BackendUserRole } from '../types/admin-user.dto';
import { AdminUser, UserRole } from '../types/admin-user.model';

const ROLES_BY_BACKEND_ROLE: Record<BackendUserRole, UserRole> = {
  ROLE_SUPERADMIN: 'superadmin',
  ROLE_CAFETERIA: 'cafe_admin',
  ROLE_CLIENTE: 'client',
};

export function toAdminUser(dto: AdminUserDto): AdminUser {
  return {
    id: dto.externalId,
    email: dto.email,
    role: (dto.role && ROLES_BY_BACKEND_ROLE[dto.role]) ?? null,
    status: dto.state ? 'active' : 'inactive',
    createdAt: dto.creationDate ? new Date(dto.creationDate) : null,
  };
}

export function toAdminUserList(dtos: readonly AdminUserDto[]): readonly AdminUser[] {
  return dtos.map(toAdminUser);
}
