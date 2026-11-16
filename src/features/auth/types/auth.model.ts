export type UserRole = 'ROLE_SUPERADMIN' | 'ROLE_CAFETERIA' | 'ROLE_CLIENTE';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SessionUser {
  email: string;
  roles: string[];
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisteredUser {
  externalId: string;
  email: string;
  state: boolean;
}
