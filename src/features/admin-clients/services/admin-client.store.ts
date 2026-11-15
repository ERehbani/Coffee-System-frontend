import { computed, inject, Injectable, signal } from '@angular/core';
import { AdminClient, ClientStatsSummary, ClientStatus } from '../types/admin-client.model';
import { AdminClientRepository } from './admin-client.repository';

export type AdminClientStoreStatus = 'loading' | 'ready' | 'error';
export type ClientStatusFilter = ClientStatus | 'all';

@Injectable()
export class AdminClientStore {
  private readonly repository = inject(AdminClientRepository);

  readonly clients = signal<readonly AdminClient[]>([]);
  readonly status = signal<AdminClientStoreStatus>('loading');
  readonly errorMessage = signal<string | null>(null);
  readonly selectedClient = signal<AdminClient | null>(null);

  readonly searchQuery = signal('');
  readonly statusFilter = signal<ClientStatusFilter>('all');
  readonly tierFilter = signal('all');

  readonly stats = computed<ClientStatsSummary>(() => {
    const list = this.clients();
    return {
      totalClients: list.length,
      activeClients: list.filter((client) => client.status === 'active').length,
      availablePoints: list.reduce((total, client) => total + client.currentPoints, 0),
      historicalPoints: list.reduce((total, client) => total + client.historicalPoints, 0),
    };
  });

  readonly tierOptions = computed<readonly string[]>(() => {
    const names = this.clients()
      .map((client) => client.tierName)
      .filter((name) => name !== null);
    return [...new Set(names)].sort();
  });

  readonly hasActiveFilters = computed(
    () => this.searchQuery().trim() !== '' || this.statusFilter() !== 'all' || this.tierFilter() !== 'all',
  );

  readonly filteredClients = computed<readonly AdminClient[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    const tier = this.tierFilter();

    return this.clients().filter(
      (client) =>
        (status === 'all' || client.status === status) &&
        (tier === 'all' || client.tierName === tier) &&
        matchesQuery(client, query),
    );
  });

  constructor() {
    this.loadClients();
  }

  loadClients(): void {
    this.status.set('loading');
    this.errorMessage.set(null);

    this.repository.getClients().subscribe({
      next: (clients) => {
        this.clients.set(clients);
        this.status.set('ready');
      },
      error: () => {
        this.status.set('error');
        this.errorMessage.set('No se pudo cargar la lista de clientes. Por favor, intente nuevamente.');
      },
    });
  }

  selectClient(client: AdminClient): void {
    this.selectedClient.set(client);
  }

  clearSelection(): void {
    this.selectedClient.set(null);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setStatusFilter(status: ClientStatusFilter): void {
    this.statusFilter.set(status);
  }

  setTierFilter(tier: string): void {
    this.tierFilter.set(tier);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.tierFilter.set('all');
  }
}

function matchesQuery(client: AdminClient, query: string): boolean {
  if (!query) {
    return true;
  }
  return [client.displayName, client.email, client.phone].some((field) =>
    field?.toLowerCase().includes(query),
  );
}
