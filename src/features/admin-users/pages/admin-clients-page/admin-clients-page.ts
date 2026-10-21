import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { AdminClientStore } from '../../services/admin-client.store';
import { AdminUser, LoyaltyTier, UserStatus } from '../../types/admin-user.model';
import { toInitials, toStatusLabel, toTierLabel } from '../../utils/admin-user.labels';

@Component({
  selector: 'app-admin-clients-page',
  imports: [DatePipe, DecimalPipe, RouterLink, Icon],
  templateUrl: './admin-clients-page.html',
  host: { class: 'block' },
})
export class AdminClientsPage {
  protected readonly store = inject(AdminClientStore);
  private readonly router = inject(Router);

  protected readonly toStatusLabel = toStatusLabel;
  protected readonly toTierLabel = toTierLabel;
  protected readonly toInitials = toInitials;

  protected onSearchChange(event: Event): void {
    this.store.setSearchQuery((event.target as HTMLInputElement).value);
  }

  protected onStatusChange(event: Event): void {
    this.store.setStatusFilter((event.target as HTMLSelectElement).value as UserStatus | 'all');
  }

  protected onTierChange(event: Event): void {
    this.store.setTierFilter((event.target as HTMLSelectElement).value as LoyaltyTier | 'all');
  }

  protected openClient(client: AdminUser): void {
    this.router.navigate(['/admin/clients', client.id]);
  }

  protected onRowKeyDown(event: KeyboardEvent, client: AdminUser): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openClient(client);
    }
  }
}
