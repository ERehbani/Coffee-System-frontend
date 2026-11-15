export type ClientStatus = 'active' | 'inactive';

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
};

export interface AdminClient {
  readonly id: string;
  readonly displayName: string;
  readonly initials: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly photoUrl: string | null;
  readonly currentPoints: number;
  readonly historicalPoints: number;
  readonly spentPoints: number;
  readonly tierName: string | null;
  readonly status: ClientStatus;
  readonly createdAt: Date | null;
}

export interface ClientStatsSummary {
  readonly totalClients: number;
  readonly activeClients: number;
  readonly availablePoints: number;
  readonly historicalPoints: number;
}
