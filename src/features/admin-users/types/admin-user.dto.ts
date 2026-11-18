import { UserRole as BackendUserRole } from '../../auth/types/auth.model';

export interface AdminUserDto {
  readonly externalId: string;
  readonly email: string;
  readonly state: boolean;
  readonly role: BackendUserRole | null;
  readonly creationDate: string | null;
}
