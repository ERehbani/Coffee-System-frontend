import { DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { AdminPageHeader } from '../../../../shared/components/admin-page-header/admin-page-header';
import { Icon } from '../../../../shared/components/icon/icon';
import { ClientDetailModal } from '../../components/client-detail-modal/client-detail-modal';
import { ClientTable } from '../../components/client-table/client-table';
import { AdminClientStore, ClientStatusFilter } from '../../services/admin-client.store';

interface StatCard {
  readonly label: string;
  readonly value: number;
  readonly hint: string;
}

@Component({
  selector: 'app-admin-clients-page',
  imports: [DecimalPipe, AdminPageHeader, Icon, ClientTable, ClientDetailModal],
  templateUrl: './admin-clients-page.html',
  host: { class: 'block' },
})
export class AdminClientsPage {
  protected readonly store = inject(AdminClientStore);

  protected readonly statCards = computed<readonly StatCard[]>(() => {
    const stats = this.store.stats();
    return [
      { label: 'Clientes', value: stats.totalClients, hint: 'Registrados' },
      { label: 'Activos', value: stats.activeClients, hint: 'Cuentas operativas' },
      { label: 'Puntos disponibles', value: stats.availablePoints, hint: 'Sin canjear' },
      { label: 'Puntos históricos', value: stats.historicalPoints, hint: 'Acumulados en total' },
    ];
  });

  protected onSearchChange(event: Event): void {
    this.store.setSearchQuery((event.target as HTMLInputElement).value);
  }

  protected onStatusChange(event: Event): void {
    this.store.setStatusFilter((event.target as HTMLSelectElement).value as ClientStatusFilter);
  }

  protected onTierChange(event: Event): void {
    this.store.setTierFilter((event.target as HTMLSelectElement).value);
  }
}
