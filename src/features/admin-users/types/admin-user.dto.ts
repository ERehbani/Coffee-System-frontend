import { LoyaltyTier, UserRole, UserStatus } from './admin-user.model';

export interface ClientAuditDetailsDto {
  readonly loyaltyTier: LoyaltyTier;
  readonly availablePoints: number;
  readonly lifetimePoints: number;
  readonly redemptionsCount: number;
  readonly preferredCafe: string | null;
}

export interface CafeAdminAuditDetailsDto {
  readonly cafeId: string;
  readonly cafeName: string;
  readonly cafeRole: string;
  readonly cafeAddress: string;
  readonly branchCount: number;
}

export interface SuperadminAuditDetailsDto {
  readonly accessLevel: string;
  readonly department: string;
  readonly lastAuditAction: string;
  readonly ipAddressLastLogin: string;
}

export interface AdminUserDto {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly avatarUrl: string | null;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly createdAt: string;
  readonly lastLoginAt: string | null;
  readonly emailVerified: boolean;
  readonly twoFactorEnabled: boolean;
  readonly authProvider: 'email_password' | 'google' | 'apple';
  readonly notes: string | null;
  readonly clientDetails?: ClientAuditDetailsDto;
  readonly cafeAdminDetails?: CafeAdminAuditDetailsDto;
  readonly superadminDetails?: SuperadminAuditDetailsDto;
}
