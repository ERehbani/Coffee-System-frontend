import { DatePipe } from '@angular/common';
import { Component, HostListener, input, output, signal } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { ActionFeedback } from '../../services/admin-user.store';
import { AdminUser, LoyaltyTier, UserRole, UserStatus } from '../../types/admin-user.model';

const ROLES: Record<UserRole, string> = { superadmin: 'Superadministrador', cafe_admin: 'Administrador de Comercio', client: 'Cliente / Consumidor' };
const STATUSES: Record<UserStatus, string> = { active: 'Activo', inactive: 'Inactivo', suspended: 'Suspendido', pending: 'Pendiente' };
const TIERS: Record<LoyaltyTier, string> = { diamond: 'Nivel Diamante', gold: 'Nivel Oro', silver: 'Nivel Plata', bronze: 'Nivel Bronce' };

@Component({
  selector: 'app-user-detail-modal',
  imports: [DatePipe, Icon],
  templateUrl: './user-detail-modal.html',
})
export class UserDetailModal {
  readonly user = input.required<AdminUser>();
  readonly isProcessing = input(false);
  readonly actionMessage = input<ActionFeedback | null>(null);

  readonly updateStatus = output<{ id: string; status: UserStatus }>();
  readonly dismissMessage = output<void>();
  readonly close = output<void>();

  readonly confirmingDeactivate = signal(false);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.confirmingDeactivate() ? this.confirmingDeactivate.set(false) : this.close.emit();
  }

  protected onRequestDeactivate(): void { this.confirmingDeactivate.set(true); }
  protected onCancelDeactivate(): void { this.confirmingDeactivate.set(false); }
  protected onConfirmDeactivate(): void {
    this.confirmingDeactivate.set(false);
    this.updateStatus.emit({ id: this.user().id, status: 'inactive' });
  }
  protected onReactivateUser(): void { this.updateStatus.emit({ id: this.user().id, status: 'active' }); }

  protected getRoleLabel(role: UserRole): string { return ROLES[role]; }
  protected getStatusLabel(status: UserStatus): string { return STATUSES[status]; }
  protected getLoyaltyLabel(tier: LoyaltyTier): string { return TIERS[tier]; }

  protected getInitials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
  }
}
