export interface AdminNavItem {
  readonly label: string;
  /** Child path under `/admin`. */
  readonly path: string;
}

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  { label: 'Panel', path: 'dashboard' },
  { label: 'Usuarios', path: 'users' },
  { label: 'Clientes', path: 'clients' },
  { label: 'Cafeterías', path: 'cafes' },
  { label: 'Tiers', path: 'tiers' },
  { label: 'Categorías', path: 'categories' },
  { label: 'Tipos de beneficio', path: 'benefit-types' },
  { label: 'Beneficios globales', path: 'global-benefits' },
  { label: 'Historial de compras', path: 'purchases' },
];
