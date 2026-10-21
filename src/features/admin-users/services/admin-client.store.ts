import { computed, inject, Injectable, signal } from '@angular/core';
import { AdminUser, LoyaltyTier, UserStatus } from '../types/admin-user.model';
import { AdminUserRepository } from './admin-user.repository';
import { AdminUserStoreStatus } from './admin-user.store';

export interface ClientStatsSummary {
  readonly totalClients: number;
  readonly activeClients: number;
  readonly totalAvailablePoints: number;
  readonly totalRedemptions: number;
}

@Injectable()
export class AdminClientStore {
  private readonly repository = inject(AdminUserRepository);

  readonly clients = signal<readonly AdminUser[]>([]);
  readonly status = signal<AdminUserStoreStatus>('loading');
  readonly errorMessage = signal<string | null>(null);

  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<UserStatus | 'all'>('all');
  readonly tierFilter = signal<LoyaltyTier | 'all'>('all');

  readonly hasActiveFilters = computed(
    () => !!this.searchQuery().trim() || this.statusFilter() !== 'all' || this.tierFilter() !== 'all',
  );

  readonly stats = computed<ClientStatsSummary>(() => {
    const list = this.clients();
    return {
      totalClients: list.length,
      activeClients: list.filter((c) => c.status === 'active').length,
      totalAvailablePoints: list.reduce((sum, c) => sum + (c.clientDetails?.availablePoints ?? 0), 0),
      totalRedemptions: list.reduce((sum, c) => sum + (c.clientDetails?.redemptionsCount ?? 0), 0),
    };
  });

  readonly filteredClients = computed<readonly AdminUser[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    const tier = this.tierFilter();

    return this.clients().filter((client) => {
      if (status !== 'all' && client.status !== status) {
        return false;
      }
      if (tier !== 'all' && client.clientDetails?.loyaltyTier !== tier) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [client.id, client.fullName, client.email, client.phoneNumber].some((field) =>
        field.toLowerCase().includes(query),
      );
    });
  });

  constructor() {
    this.loadClients();
  }

  loadClients(): void {
    this.status.set('loading');
    this.errorMessage.set(null);

    this.repository.getClients().subscribe({
      next: (data) => {
        // Guard against a backend that ignores the role filter.
        this.clients.set(data.filter((u) => u.role === 'client'));
        this.status.set('ready');
      },
      error: () => {
        this.status.set('error');
        this.errorMessage.set('No se pudo cargar la lista de clientes. Por favor, intente nuevamente.');
      },
    });
  }

  findClient(id: string | null): AdminUser | null {
    return this.clients().find((c) => c.id === id) ?? null;
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setStatusFilter(status: UserStatus | 'all'): void {
    this.statusFilter.set(status);
  }

  setTierFilter(tier: LoyaltyTier | 'all'): void {
    this.tierFilter.set(tier);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.tierFilter.set('all');
  }
}
