import { DatePipe } from '@angular/common';
import { Component, HostListener, input, output, signal } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { ActionFeedback } from '../../services/admin-user.store';
import { AdminUser, LoyaltyTier, UserRole, UserStatus } from '../../types/admin-user.model';

@Component({
  selector: 'app-user-detail-modal',
  imports: [DatePipe, Icon],
  templateUrl: './user-detail-modal.html',
})
export class UserDetailModal {
  readonly user = input.required<AdminUser>();
  readonly isProcessing = input<boolean>(false);
  readonly actionMessage = input<ActionFeedback | null>(null);

  readonly updateStatus = output<{ id: string; status: UserStatus }>();
  readonly dismissMessage = output<void>();
  readonly close = output<void>();

  readonly confirmingDeactivate = signal<boolean>(false);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.confirmingDeactivate()) {
      this.confirmingDeactivate.set(false);
      return;
    }
    this.close.emit();
  }

  protected onActivateCafe(): void {
    this.updateStatus.emit({ id: this.user().id, status: 'active' });
  }

  protected onRequestDeactivate(): void {
    this.confirmingDeactivate.set(true);
  }

  protected onConfirmDeactivate(): void {
    this.confirmingDeactivate.set(false);
    this.updateStatus.emit({ id: this.user().id, status: 'inactive' });
  }

  protected onCancelDeactivate(): void {
    this.confirmingDeactivate.set(false);
  }

  protected onReactivateUser(): void {
    this.updateStatus.emit({ id: this.user().id, status: 'active' });
  }

  protected getRoleLabel(role: UserRole): string {
    switch (role) {
      case 'superadmin':
        return 'Superadministrador';
      case 'cafe_admin':
        return 'Administrador de Comercio';
      case 'client':
        return 'Cliente / Consumidor';
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

  protected getLoyaltyLabel(tier: LoyaltyTier): string {
    switch (tier) {
      case 'diamond':
        return 'Nivel Diamante';
      case 'gold':
        return 'Nivel Oro';
      case 'silver':
        return 'Nivel Plata';
      case 'bronze':
        return 'Nivel Bronce';
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
}
