export type UserRole = 'ROLE_SUPERADMIN' | 'ROLE_CAFETERIA' | 'ROLE_CLIENTE';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface TokenPayload {
  sub: string;
  roles: string[];
  exp: number;
}
