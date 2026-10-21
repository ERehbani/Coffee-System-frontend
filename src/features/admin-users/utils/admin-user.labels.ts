import { AdminUser, LoyaltyTier, UserStatus } from '../types/admin-user.model';

const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  suspended: 'Suspendido',
  pending: 'Pendiente',
};

const TIER_LABELS: Record<LoyaltyTier, string> = {
  bronze: 'Bronce',
  silver: 'Plata',
  gold: 'Oro',
  diamond: 'Diamante',
};

const AUTH_PROVIDER_LABELS: Record<AdminUser['authProvider'], string> = {
  email_password: 'Email y contraseña',
  google: 'Google',
  apple: 'Apple',
};

export function toStatusLabel(status: UserStatus): string {
  return STATUS_LABELS[status];
}

export function toTierLabel(tier: LoyaltyTier): string {
  return TIER_LABELS[tier];
}

export function toAuthProviderLabel(provider: AdminUser['authProvider']): string {
  return AUTH_PROVIDER_LABELS[provider];
}

export function toInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}
