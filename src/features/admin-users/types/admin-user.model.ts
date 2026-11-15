export type UserRole = 'superadmin' | 'cafe_admin' | 'client';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

/** Only what the backend sends: it has no name, phone, last login or role-specific details. */
export interface AdminUser {
  readonly id: string;
  readonly email: string;
  /** Null when the backend sends no role. */
  readonly role: UserRole | null;
  readonly status: UserStatus;
  readonly createdAt: Date | null;
}

export interface UserStatsSummary {
  readonly totalUsers: number;
  readonly activeUsers: number;
  readonly clientUsers: number;
  readonly cafeAdminUsers: number;
  readonly superadminUsers: number;
}
