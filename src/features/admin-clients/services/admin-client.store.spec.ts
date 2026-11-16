import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminClient } from '../types/admin-client.model';
import { buildAdminClient } from '../utils/admin-client.fixture';
import { AdminClientRepository } from './admin-client.repository';
import { AdminClientStore } from './admin-client.store';

describe('AdminClientStore', () => {
  const clients: readonly AdminClient[] = [
    buildAdminClient({
      id: 'c1',
      displayName: 'Ana Pérez',
      email: 'ana@test.com',
      phone: '1155551234',
      tierName: 'PLATA',
      currentPoints: 320,
      historicalPoints: 1250,
    }),
    buildAdminClient({
      id: 'c2',
      displayName: 'Bruno Díaz',
      email: 'bruno@test.com',
      tierName: 'BRONCE',
      status: 'inactive',
      currentPoints: 0,
      historicalPoints: 100,
    }),
    buildAdminClient({
      id: 'c3',
      displayName: 'carla@test.com',
      email: 'carla@test.com',
      tierName: 'BRONCE',
      currentPoints: 50,
      historicalPoints: 50,
    }),
  ];

  function createStore(repository: AdminClientRepository): AdminClientStore {
    TestBed.configureTestingModule({
      providers: [AdminClientStore, { provide: AdminClientRepository, useValue: repository }],
    });
    return TestBed.inject(AdminClientStore);
  }

  function createLoadedStore(): AdminClientStore {
    return createStore({ getClients: () => of(clients) });
  }

  it('loads the clients when it starts', () => {
    const store = createLoadedStore();

    expect(store.status()).toBe('ready');
    expect(store.clients().length).toBe(3);
    expect(store.filteredClients().length).toBe(3);
  });

  it('shows an error when the clients cannot be loaded', () => {
    const store = createStore({ getClients: () => throwError(() => new Error('Network error')) });

    expect(store.status()).toBe('error');
    expect(store.errorMessage()).toContain('No se pudo cargar la lista de clientes');
  });

  it('summarizes the clients and their points', () => {
    const store = createLoadedStore();

    expect(store.stats()).toEqual({
      totalClients: 3,
      activeClients: 2,
      availablePoints: 370,
      historicalPoints: 1400,
    });
  });

  it('offers each tier of the clients once, sorted', () => {
    const store = createLoadedStore();

    expect(store.tierOptions()).toEqual(['BRONCE', 'PLATA']);
  });

  it('searches by name, email and phone', () => {
    const store = createLoadedStore();

    store.setSearchQuery('bruno');
    expect(store.filteredClients().map((client) => client.id)).toEqual(['c2']);

    store.setSearchQuery('CARLA@');
    expect(store.filteredClients().map((client) => client.id)).toEqual(['c3']);

    store.setSearchQuery('5555');
    expect(store.filteredClients().map((client) => client.id)).toEqual(['c1']);

    store.setSearchQuery('nadie');
    expect(store.filteredClients()).toEqual([]);
  });

  it('filters by status', () => {
    const store = createLoadedStore();

    store.setStatusFilter('inactive');

    expect(store.filteredClients().map((client) => client.id)).toEqual(['c2']);
  });

  it('filters by tier', () => {
    const store = createLoadedStore();

    store.setTierFilter('BRONCE');

    expect(store.filteredClients().map((client) => client.id)).toEqual(['c2', 'c3']);
  });

  it('combines the filters and resets them', () => {
    const store = createLoadedStore();

    store.setTierFilter('BRONCE');
    store.setStatusFilter('active');
    expect(store.filteredClients().map((client) => client.id)).toEqual(['c3']);
    expect(store.hasActiveFilters()).toBe(true);

    store.resetFilters();
    expect(store.filteredClients().length).toBe(3);
    expect(store.hasActiveFilters()).toBe(false);
  });

  it('selects a client and clears the selection', () => {
    const store = createLoadedStore();

    store.selectClient(clients[0]);
    expect(store.selectedClient()).toBe(clients[0]);

    store.clearSelection();
    expect(store.selectedClient()).toBeNull();
  });
});
