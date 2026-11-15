/** `Roles` enum name of the backend. */
export type BackendUserRole = 'ROLE_SUPERADMIN' | 'ROLE_CAFETERIA' | 'ROLE_CLIENTE';

/** `UserResponse` of the backend (`GET /users`, `GET /users/{id}`, `PUT /users/{id}`). */
export interface AdminUserDto {
  readonly externalId: string;
  readonly email: string;
  readonly state: boolean;
  readonly role: BackendUserRole | null;
  readonly creationDate: string | null;
}
