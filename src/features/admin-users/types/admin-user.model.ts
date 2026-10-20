export type UserRole = 'superadmin' | 'cafe_admin' | 'client';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface ClientAuditDetails {
  readonly loyaltyTier: LoyaltyTier;
  readonly availablePoints: number;
  readonly lifetimePoints: number;
  readonly redemptionsCount: number;
  readonly preferredCafe: string | null;
}

export interface CafeAdminAuditDetails {
  readonly cafeId: string;
  readonly cafeName: string;
  readonly cafeRole: string;
  readonly cafeAddress: string;
  readonly branchCount: number;
}

export interface SuperadminAuditDetails {
  readonly accessLevel: string;
  readonly department: string;
  readonly lastAuditAction: string;
  readonly ipAddressLastLogin: string;
}

export interface AdminUser {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly fullName: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly avatarUrl: string | null;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly createdAt: Date;
  readonly lastLoginAt: Date | null;
  readonly emailVerified: boolean;
  readonly twoFactorEnabled: boolean;
  readonly authProvider: 'email_password' | 'google' | 'apple';
  readonly notes: string | null;
  readonly clientDetails?: ClientAuditDetails;
  readonly cafeAdminDetails?: CafeAdminAuditDetails;
  readonly superadminDetails?: SuperadminAuditDetails;
}

export interface UserStatsSummary {
  readonly totalUsers: number;
  readonly activeUsers: number;
  readonly clientUsers: number;
  readonly cafeAdminUsers: number;
  readonly superadminUsers: number;
}
