import { AdminUserDto } from '../types/admin-user.dto';
import { AdminUser } from '../types/admin-user.model';

export function toAdminUser(dto: AdminUserDto): AdminUser {
  return {
    id: dto.id,
    firstName: dto.firstName,
    lastName: dto.lastName,
    fullName: `${dto.firstName} ${dto.lastName}`.trim(),
    email: dto.email,
    phoneNumber: dto.phoneNumber,
    avatarUrl: dto.avatarUrl,
    role: dto.role,
    status: dto.status,
    createdAt: new Date(dto.createdAt),
    lastLoginAt: dto.lastLoginAt ? new Date(dto.lastLoginAt) : null,
    emailVerified: dto.emailVerified,
    twoFactorEnabled: dto.twoFactorEnabled,
    authProvider: dto.authProvider,
    notes: dto.notes,
    clientDetails: dto.clientDetails ? { ...dto.clientDetails } : undefined,
    cafeAdminDetails: dto.cafeAdminDetails ? { ...dto.cafeAdminDetails } : undefined,
    superadminDetails: dto.superadminDetails ? { ...dto.superadminDetails } : undefined,
  };
}

export function toAdminUserList(dtos: readonly AdminUserDto[]): readonly AdminUser[] {
  return dtos.map(toAdminUser);
}
