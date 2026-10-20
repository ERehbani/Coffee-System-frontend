import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { UserDetailModal } from '../../components/user-detail-modal/user-detail-modal';
import { UserTable } from '../../components/user-table/user-table';
import { AdminUserStore } from '../../services/admin-user.store';
import { UserRole, UserStatus } from '../../types/admin-user.model';

@Component({
  selector: 'app-admin-users-page',
  imports: [RouterLink, Icon, UserTable, UserDetailModal],
  templateUrl: './admin-users-page.html',
  host: { class: 'block' },
})
export class AdminUsersPage {
  protected readonly store = inject(AdminUserStore);

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
