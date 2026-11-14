import { AdminUserDto } from '../types/admin-user.dto';
import { AdminUser, UserRole, UserStatus } from '../types/admin-user.model';

function inferRole(email: string, explicitRole?: string): UserRole {
  if (explicitRole === 'superadmin' || explicitRole === 'cafe_admin' || explicitRole === 'client') {
    return explicitRole;
  }
  const lower = email.toLowerCase();
  if (lower.includes('admin') || lower.startsWith('super')) {
    return 'superadmin';
  }
  if (lower.includes('cafe') || lower.includes('barista') || lower.includes('coop')) {
    return 'cafe_admin';
  }
  return 'client';
}

export function toAdminUser(dto: AdminUserDto | any): AdminUser {
  const id = dto.id || dto.externalId || '';
  const email = dto.email || '';
  const emailName = email.includes('@') ? email.split('@')[0] : email;
  const firstName = dto.firstName || emailName || 'Usuario';
  const lastName = dto.lastName || '';
  const fullName = dto.fullName || `${firstName} ${lastName}`.trim();
  const status: UserStatus = dto.status ?? (dto.state !== undefined ? (dto.state ? 'active' : 'inactive') : 'active');
  const role: UserRole = inferRole(email, dto.role);

  const clientDetails = role === 'client'
    ? dto.clientDetails || {
        loyaltyTier: 'bronze',
        availablePoints: 0,
        lifetimePoints: 0,
        redemptionsCount: 0,
        preferredCafe: null,
      }
    : dto.clientDetails;

  const cafeAdminDetails = role === 'cafe_admin'
    ? dto.cafeAdminDetails || {
        cafeId: id,
        cafeName: firstName,
        cafeRole: 'Administrador',
        cafeAddress: '',
        branchCount: 1,
      }
    : dto.cafeAdminDetails;

  const superadminDetails = role === 'superadmin'
    ? dto.superadminDetails || {
        accessLevel: 'Nivel 1 - Completo',
        department: 'Sistemas',
        lastAuditAction: 'Auditoría de plataforma',
        ipAddressLastLogin: '127.0.0.1',
      }
    : dto.superadminDetails;

  return {
    id,
    firstName,
    lastName,
    fullName,
    email,
    phoneNumber: dto.phoneNumber || '',
    avatarUrl: dto.avatarUrl || null,
    role,
    status,
    createdAt: toCreatedAt(dto.creationDate ?? dto.createdAt),
    lastLoginAt: dto.lastLoginAt ? new Date(dto.lastLoginAt) : null,
    emailVerified: dto.emailVerified ?? true,
    twoFactorEnabled: dto.twoFactorEnabled ?? false,
    authProvider: dto.authProvider || 'email_password',
    notes: dto.notes || null,
    clientDetails,
    cafeAdminDetails,
    superadminDetails,
  };
}

function toCreatedAt(value?: string): Date | null {
  return value ? new Date(value) : null;
}

export function toAdminUserList(dtos: readonly (AdminUserDto | any)[]): readonly AdminUser[] {
  return dtos.map(toAdminUser);
}
