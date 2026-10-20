import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminUser, UserStatus } from '../types/admin-user.model';
import { AdminUserRepository } from './admin-user.repository';
import { AdminUserStore } from './admin-user.store';

describe('AdminUserStore', () => {
  let store: AdminUserStore;
  let mockRepository: Partial<AdminUserRepository>;

  const mockUsers: readonly AdminUser[] = [
    {
      id: 'USR-101',
      firstName: 'Elena',
      lastName: 'Rostova',
      fullName: 'Elena Rostova',
      email: 'elena@admin.com',
      phoneNumber: '+54 11 1111-2222',
      avatarUrl: null,
      role: 'superadmin',
      status: 'active',
      createdAt: new Date('2023-01-01'),
      lastLoginAt: new Date('2026-10-20'),
      emailVerified: true,
      twoFactorEnabled: true,
      authProvider: 'email_password',
      notes: 'Superadmin root',
      superadminDetails: {
        accessLevel: 'Control Total',
        department: 'Seguridad',
        lastAuditAction: 'Audit log check',
        ipAddressLastLogin: '190.1.2.3',
      },
    },
    {
      id: 'USR-201',
      firstName: 'Mateo',
      lastName: 'Valenzuela',
      fullName: 'Mateo Valenzuela',
      email: 'mateo@grano.com',
      phoneNumber: '+54 11 3333-4444',
      avatarUrl: null,
      role: 'cafe_admin',
      status: 'pending',
      createdAt: new Date('2023-05-01'),
      lastLoginAt: new Date('2026-10-19'),
      emailVerified: true,
      twoFactorEnabled: true,
      authProvider: 'google',
      notes: 'Solicitud pendiente',
      cafeAdminDetails: {
        cafeId: 'cafe-1',
        cafeName: 'Grano Dorado',
        cafeRole: 'Dueño',
        cafeAddress: 'Calle Falsa 123',
        branchCount: 2,
      },
    },
    {
      id: 'USR-301',
      firstName: 'Sofía',
      lastName: 'Martínez',
      fullName: 'Sofía Martínez',
      email: 'sofia@client.com',
      phoneNumber: '+54 11 5555-6666',
      avatarUrl: null,
      role: 'client',
      status: 'active',
      createdAt: new Date('2024-01-10'),
      lastLoginAt: null,
      emailVerified: false,
      twoFactorEnabled: false,
      authProvider: 'apple',
      notes: null,
      clientDetails: {
        loyaltyTier: 'gold',
        availablePoints: 1200,
        lifetimePoints: 3000,
        redemptionsCount: 5,
        preferredCafe: 'Grano Dorado',
      },
    },
  ];

  beforeEach(() => {
    mockRepository = {
      getUsers: vi.fn().mockReturnValue(of(mockUsers)),
      getUserById: vi.fn().mockImplementation((id: string) =>
        of(mockUsers.find((u) => u.id === id) ?? null)
      ),
      updateUserStatus: vi.fn().mockImplementation((id: string, status: UserStatus) => {
        const found = mockUsers.find((u) => u.id === id);
        if (!found) {
          return throwError(() => new Error('Not found'));
        }
        return of({ ...found, status });
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        AdminUserStore,
        { provide: AdminUserRepository, useValue: mockRepository },
      ],
    });

    store = TestBed.inject(AdminUserStore);
  });

  it('should initialize and load users successfully', () => {
    expect(store.status()).toBe('ready');
    expect(store.users().length).toBe(3);
    expect(store.filteredUsers().length).toBe(3);
  });

  it('should calculate stats summary correctly', () => {
    const stats = store.stats();
    expect(stats.totalUsers).toBe(3);
    expect(stats.activeUsers).toBe(2);
    expect(stats.superadminUsers).toBe(1);
    expect(stats.cafeAdminUsers).toBe(1);
    expect(stats.clientUsers).toBe(1);
  });

  it('should filter users by search query', () => {
    store.setSearchQuery('elena');
    expect(store.filteredUsers().length).toBe(1);
    expect(store.filteredUsers()[0].id).toBe('USR-101');

    store.setSearchQuery('Grano Dorado');
    expect(store.filteredUsers().length).toBe(1);
    expect(store.filteredUsers()[0].id).toBe('USR-201');

    store.setSearchQuery('non-existent');
    expect(store.filteredUsers().length).toBe(0);
  });

  it('should filter users by role', () => {
    store.setRoleFilter('client');
    expect(store.filteredUsers().length).toBe(1);
    expect(store.filteredUsers()[0].role).toBe('client');

    store.setRoleFilter('cafe_admin');
    expect(store.filteredUsers().length).toBe(1);
    expect(store.filteredUsers()[0].role).toBe('cafe_admin');

    store.setRoleFilter('all');
    expect(store.filteredUsers().length).toBe(3);
  });

  it('should filter users by status', () => {
    store.setStatusFilter('pending');
    expect(store.filteredUsers().length).toBe(1);
    expect(store.filteredUsers()[0].status).toBe('pending');

    store.setStatusFilter('active');
    expect(store.filteredUsers().length).toBe(2);
  });

  it('should select user and clear selection', () => {
    expect(store.selectedUser()).toBeNull();

    store.selectUser(mockUsers[0]);
    expect(store.selectedUser()).toBe(mockUsers[0]);

    store.clearSelection();
    expect(store.selectedUser()).toBeNull();
  });

  it('should select user by id', () => {
    store.selectUserById('USR-201');
    expect(store.selectedUser()?.fullName).toBe('Mateo Valenzuela');
  });

  it('should activate a pending cafe and update selectedUser and stats', () => {
    store.selectUserById('USR-201');
    expect(store.selectedUser()?.status).toBe('pending');

    store.updateUserStatus('USR-201', 'active');

    expect(store.selectedUser()?.status).toBe('active');
    expect(store.users().find((u) => u.id === 'USR-201')?.status).toBe('active');
    expect(store.actionMessage()?.type).toBe('success');
    expect(store.actionMessage()?.text).toContain('Grano Dorado');
    expect(store.stats().activeUsers).toBe(3);
  });

  it('should deactivate a user (dar de baja) successfully', () => {
    store.selectUserById('USR-301');
    expect(store.selectedUser()?.status).toBe('active');

    store.updateUserStatus('USR-301', 'inactive');

    expect(store.selectedUser()?.status).toBe('inactive');
    expect(store.users().find((u) => u.id === 'USR-301')?.status).toBe('inactive');
    expect(store.actionMessage()?.type).toBe('success');
    expect(store.actionMessage()?.text).toContain('dado de baja');
  });

  it('should dismiss action message', () => {
    store.updateUserStatus('USR-301', 'inactive');
    expect(store.actionMessage()).not.toBeNull();

    store.dismissActionMessage();
    expect(store.actionMessage()).toBeNull();
  });

  it('should handle error when repository fails', () => {
    const failingRepo: Partial<AdminUserRepository> = {
      getUsers: () => throwError(() => new Error('Network error')),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AdminUserStore,
        { provide: AdminUserRepository, useValue: failingRepo },
      ],
    });

    const errorStore = TestBed.inject(AdminUserStore);
    expect(errorStore.status()).toBe('error');
    expect(errorStore.errorMessage()).toContain('No se pudo cargar la lista de usuarios');
  });
});
