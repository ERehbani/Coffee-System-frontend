export type UserRole = 'superadmin' | 'cafe_admin' | 'client';

export type UserStatus = 'active' | 'inactive';

export interface AdminUser {
  readonly id: string;
  readonly email: string;
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
