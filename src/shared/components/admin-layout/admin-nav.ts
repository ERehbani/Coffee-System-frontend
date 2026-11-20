import { IconName } from '../icon/icon-registry';

export interface AdminNavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: IconName;
}

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  { label: 'Usuarios', path: 'users', icon: 'users' },
  { label: 'Clientes', path: 'clients', icon: 'id-card' },
  { label: 'Cafeterías', path: 'cafes', icon: 'store' },
  { label: 'Niveles', path: 'tiers', icon: 'sparkles' },
  { label: 'Categorías', path: 'categories', icon: 'tag' },
  { label: 'Tipos de beneficio', path: 'benefit-types', icon: 'ticket' },
  { label: 'Beneficios globales', path: 'global-benefits', icon: 'gift' },
  { label: 'Historial de compras', path: 'purchases', icon: 'history' },
];
