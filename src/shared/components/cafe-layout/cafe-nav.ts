import { IconName } from '../icon/icon-registry';

export interface CafeNavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: IconName;
}

export const CAFE_NAV_ITEMS: readonly CafeNavItem[] = [
  { label: 'Panel', path: 'dashboard', icon: 'zap' },
  { label: 'Perfil del local', path: 'profile', icon: 'store' },
  { label: 'Productos', path: 'products', icon: 'coffee' },
  { label: 'Historial de compras', path: 'purchases', icon: 'shopping-bag' },
  { label: 'Beneficios', path: 'benefits', icon: 'ticket' },
  { label: 'Reseñas', path: 'reviews', icon: 'star' },
  { label: 'Validar cupones', path: 'validate', icon: 'scan-qr-code' },
];
