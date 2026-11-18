export interface AdminNavItem {
  readonly label: string;
  readonly path: string;
}

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  { label: 'Usuarios', path: 'users' },
  { label: 'Clientes', path: 'clients' },
  { label: 'Cafeterías', path: 'cafes' },
  { label: 'Niveles', path: 'tiers' },
  { label: 'Categorías', path: 'categories' },
  { label: 'Tipos de beneficio', path: 'benefit-types' },
  { label: 'Beneficios globales', path: 'global-benefits' },
  { label: 'Historial de compras', path: 'purchases' },
];
