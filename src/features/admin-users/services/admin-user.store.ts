import { computed, inject, Injectable, signal } from '@angular/core';
import { AdminUser, UserRole, UserStatsSummary, UserStatus } from '../types/admin-user.model';
import { AdminUserRepository } from './admin-user.repository';

export type AdminUserStoreStatus = 'loading' | 'ready' | 'error';

export interface ActionFeedback {
  readonly type: 'success' | 'error';
  readonly text: string;
}

@Injectable()
export class AdminUserStore {
  private readonly repository = inject(AdminUserRepository);

  readonly users = signal<readonly AdminUser[]>([]);
  readonly status = signal<AdminUserStoreStatus>('loading');
  readonly errorMessage = signal<string | null>(null);

  readonly selectedUser = signal<AdminUser | null>(null);
  readonly isProcessing = signal<boolean>(false);
  readonly actionMessage = signal<ActionFeedback | null>(null);

  readonly searchQuery = signal<string>('');
  readonly roleFilter = signal<UserRole | 'all'>('all');
  readonly statusFilter = signal<UserStatus | 'all'>('all');

  readonly stats = computed<UserStatsSummary>(() => {
    const list = this.users();
    return {
      totalUsers: list.length,
      activeUsers: list.filter((u) => u.status === 'active').length,
      clientUsers: list.filter((u) => u.role === 'client').length,
      cafeAdminUsers: list.filter((u) => u.role === 'cafe_admin').length,
      superadminUsers: list.filter((u) => u.role === 'superadmin').length,
    };
  });

  readonly filteredUsers = computed<readonly AdminUser[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const role = this.roleFilter();
    const status = this.statusFilter();
    const list = this.users();

    return list.filter((user) => {
      if (role !== 'all' && user.role !== role) {
        return false;
      }

      if (status !== 'all' && user.status !== status) {
        return false;
      }

      if (!query) {
        return true;
      }

      const matchesId = user.id.toLowerCase().includes(query);
      const matchesName = user.fullName.toLowerCase().includes(query);
      const matchesEmail = user.email.toLowerCase().includes(query);
      const matchesPhone = user.phoneNumber.toLowerCase().includes(query);
      const matchesCafe = user.cafeAdminDetails?.cafeName.toLowerCase().includes(query) ?? false;

      return matchesId || matchesName || matchesEmail || matchesPhone || matchesCafe;
    });
  });

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.status.set('loading');
    this.errorMessage.set(null);

    this.repository.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.status.set('ready');
      },
      error: () => {
        this.status.set('error');
        this.errorMessage.set('No se pudo cargar la lista de usuarios. Por favor, intente nuevamente.');
      },
    });
  }

  selectUser(user: AdminUser | null): void {
    this.selectedUser.set(user);
    this.actionMessage.set(null);
  }

  selectUserById(id: string): void {
    const found = this.users().find((u) => u.id === id);
    if (found) {
      this.selectedUser.set(found);
      this.actionMessage.set(null);
    }
  }

  clearSelection(): void {
    this.selectedUser.set(null);
    this.actionMessage.set(null);
  }

  updateUserStatus(id: string, status: UserStatus, onSuccess?: () => void): void {
    this.isProcessing.set(true);
    this.actionMessage.set(null);

    this.repository.updateUserStatus(id, status).subscribe({
      next: (updatedUser) => {
        this.users.update((prev) =>
          prev.map((user) => (user.id === id ? updatedUser : user))
        );

        if (this.selectedUser()?.id === id) {
          this.selectedUser.set(updatedUser);
        }

        let msg = '¡Estado del usuario actualizado exitosamente!';
        if (status === 'active' && updatedUser.role === 'cafe_admin') {
          msg = `¡La cafetería "${updatedUser.cafeAdminDetails?.cafeName || updatedUser.fullName}" ha sido activada con éxito!`;
        } else if (status === 'active') {
          msg = `¡El usuario ${updatedUser.fullName} ha sido reactivado exitosamente!`;
        } else if (status === 'inactive') {
          msg = `¡El usuario ${updatedUser.fullName} ha sido dado de baja exitosamente!`;
        }

        this.actionMessage.set({ type: 'success', text: msg });
        this.isProcessing.set(false);

        if (onSuccess) {
          onSuccess();
        }
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.actionMessage.set({
          type: 'error',
          text: err?.message || 'Ocurrió un error al intentar actualizar el estado del usuario.',
        });
      },
    });
  }

  dismissActionMessage(): void {
    this.actionMessage.set(null);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setRoleFilter(role: UserRole | 'all'): void {
    this.roleFilter.set(role);
  }

  setStatusFilter(status: UserStatus | 'all'): void {
    this.statusFilter.set(status);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.roleFilter.set('all');
    this.statusFilter.set('all');
  }
}
