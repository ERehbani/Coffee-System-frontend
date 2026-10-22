import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { AdminUserStoreStatus } from '../../services/admin-user.store';
import { AdminUser, UserRole, UserStatus } from '../../types/admin-user.model';

@Component({
  selector: 'app-user-table',
  imports: [DatePipe, Icon],
  templateUrl: './user-table.html',
})
export class UserTable {
  readonly users = input.required<readonly AdminUser[]>();
  readonly status = input<AdminUserStoreStatus>('ready');

  readonly selectUser = output<AdminUser>();

  protected onRowClick(user: AdminUser): void {
    this.selectUser.emit(user);
  }

  protected onRowKeyDown(event: KeyboardEvent, user: AdminUser): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectUser.emit(user);
    }
  }

  protected getRoleLabel(role: UserRole): string {
    switch (role) {
      case 'superadmin':
        return 'Superadmin';
      case 'cafe_admin':
        return 'Comercio';
      case 'client':
        return 'Cliente';
    }
  }

  protected getStatusLabel(status: UserStatus): string {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'suspended':
        return 'Suspendido';
      case 'pending':
        return 'Pendiente';
    }
  }

  protected getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }

  protected getUserDisplayName(user: AdminUser): string {
    return user.fullName;
  }
}
