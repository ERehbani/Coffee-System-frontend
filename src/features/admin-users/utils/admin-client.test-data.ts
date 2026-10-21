import { AdminUser } from '../types/admin-user.model';

const base = {
  avatarUrl: null,
  emailVerified: true,
  twoFactorEnabled: false,
  authProvider: 'email_password',
  notes: null,
  lastLoginAt: null,
} as const;

export const TEST_CLIENT_SOFIA: AdminUser = {
  ...base,
  id: 'USR-3001',
  firstName: 'Sofía',
  lastName: 'Martínez',
  fullName: 'Sofía Martínez',
  email: 'sofia.martinez@email.com',
  phoneNumber: '+54 11 6543-9870',
  role: 'client',
  status: 'active',
  createdAt: new Date('2024-02-14T10:00:00.000Z'),
  lastLoginAt: new Date('2026-10-20T07:50:23.000Z'),
  authProvider: 'google',
  notes: 'Cliente diamante',
  clientDetails: {
    loyaltyTier: 'diamond',
    availablePoints: 4520,
    lifetimePoints: 12450,
    redemptionsCount: 24,
    preferredCafe: 'Café Central',
  },
};

export const TEST_CLIENT_JUAN: AdminUser = {
  ...base,
  id: 'USR-3002',
  firstName: 'Juan',
  lastName: 'Pérez',
  fullName: 'Juan Pérez',
  email: 'juan.perez@email.com',
  phoneNumber: '+54 11 2222-3333',
  role: 'client',
  status: 'inactive',
  createdAt: new Date('2025-05-01T10:00:00.000Z'),
  clientDetails: {
    loyaltyTier: 'bronze',
    availablePoints: 80,
    lifetimePoints: 300,
    redemptionsCount: 1,
    preferredCafe: null,
  },
};

export const TEST_CAFE_ADMIN: AdminUser = {
  ...base,
  id: 'USR-2001',
  firstName: 'Mateo',
  lastName: 'Valenzuela',
  fullName: 'Mateo Valenzuela',
  email: 'mateo@granodorado.coffee',
  phoneNumber: '+54 11 3490-1122',
  role: 'cafe_admin',
  status: 'active',
  createdAt: new Date('2023-08-22T09:00:00.000Z'),
};
