import { Component, computed, inject } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { UserDetailModal } from '../../components/user-detail-modal/user-detail-modal';
import { UserTable } from '../../components/user-table/user-table';
import { AdminUserStore } from '../../services/admin-user.store';
import { UserRole, UserStatus } from '../../types/admin-user.model';

interface FilterOption<T> {
  readonly value: T;
  readonly label: string;
}

const ROLE_OPTIONS: readonly FilterOption<UserRole>[] = [
  { value: 'superadmin', label: 'Superadmin' },
  { value: 'cafe_admin', label: 'Comercios / Cafeterías' },
  { value: 'client', label: 'Clientes' },
];

const STATUS_OPTIONS: readonly FilterOption<UserStatus>[] = [
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
];

@Component({
  selector: 'app-admin-users-page',
  imports: [Icon, UserTable, UserDetailModal],
  templateUrl: './admin-users-page.html',
  host: { class: 'block' },
})
export class AdminUsersPage {
  protected readonly store = inject(AdminUserStore);

  protected readonly roleOptions = ROLE_OPTIONS;
  protected readonly statusOptions = STATUS_OPTIONS;

  protected readonly roleFilterLabel = computed(
    () => ROLE_OPTIONS.find((option) => option.value === this.store.roleFilter())?.label ?? null,
  );
  protected readonly statusFilterLabel = computed(
    () => STATUS_OPTIONS.find((option) => option.value === this.store.statusFilter())?.label ?? null,
  );

  protected onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.store.setSearchQuery(input.value);
  }

  protected onRoleChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.store.setRoleFilter(select.value as UserRole | 'all');
  }

  protected onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.store.setStatusFilter(select.value as UserStatus | 'all');
  }

  protected onUpdateStatus(event: { id: string; status: UserStatus }): void {
    this.store.updateUserStatus(event.id, event.status);
  }

  protected onRefresh(): void {
    this.store.loadUsers();
  }

  protected onClearFilters(): void {
    this.store.resetFilters();
  }
}
