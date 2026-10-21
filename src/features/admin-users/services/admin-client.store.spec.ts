import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { AdminUser } from '../types/admin-user.model';
import { TEST_CAFE_ADMIN, TEST_CLIENT_JUAN, TEST_CLIENT_SOFIA } from '../utils/admin-client.test-data';
import { AdminClientStore } from './admin-client.store';
import { AdminUserRepository } from './admin-user.repository';

describe('AdminClientStore', () => {
  function setup(getClients: () => Observable<readonly AdminUser[]>): AdminClientStore {
    TestBed.configureTestingModule({
      providers: [AdminClientStore, { provide: AdminUserRepository, useValue: { getClients } }],
    });
    return TestBed.inject(AdminClientStore);
  }

  it('CA: keeps only users with the client role', () => {
    const store = setup(() => of([TEST_CLIENT_SOFIA, TEST_CAFE_ADMIN, TEST_CLIENT_JUAN]));

    expect(store.status()).toBe('ready');
    expect(store.clients().map((c) => c.id)).toEqual(['USR-3001', 'USR-3002']);
  });

  it('computes client stats including points', () => {
    const store = setup(() => of([TEST_CLIENT_SOFIA, TEST_CLIENT_JUAN]));

    expect(store.stats()).toEqual({
      totalClients: 2,
      activeClients: 1,
      totalAvailablePoints: 4600,
      totalRedemptions: 25,
    });
  });

  it('filters by search, status and tier', () => {
    const store = setup(() => of([TEST_CLIENT_SOFIA, TEST_CLIENT_JUAN]));

    store.setSearchQuery('juan');
    expect(store.filteredClients().map((c) => c.id)).toEqual(['USR-3002']);

    store.resetFilters();
    store.setStatusFilter('active');
    expect(store.filteredClients().map((c) => c.id)).toEqual(['USR-3001']);

    store.resetFilters();
    store.setTierFilter('bronze');
    expect(store.filteredClients().map((c) => c.id)).toEqual(['USR-3002']);
    expect(store.hasActiveFilters()).toBe(true);

    store.resetFilters();
    expect(store.filteredClients()).toHaveLength(2);
    expect(store.hasActiveFilters()).toBe(false);
  });

  it('finds a client by id and ignores non-client ids', () => {
    const store = setup(() => of([TEST_CLIENT_SOFIA, TEST_CAFE_ADMIN]));

    expect(store.findClient('USR-3001')?.fullName).toBe('Sofía Martínez');
    expect(store.findClient('USR-2001')).toBeNull();
    expect(store.findClient(null)).toBeNull();
  });

  it('exposes an error state when loading fails', () => {
    const store = setup(() => throwError(() => new Error('boom')));

    expect(store.status()).toBe('error');
    expect(store.errorMessage()).toContain('No se pudo cargar la lista de clientes');
  });
});
