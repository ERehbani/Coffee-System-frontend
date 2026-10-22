import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminCafe, CreateCafeInput } from '../types/admin-cafe.model';
import { AdminCafeRepository } from './admin-cafe.repository';
import { AdminCafeStore } from './admin-cafe.store';

describe('AdminCafeStore', () => {
  let store: AdminCafeStore;
  let mockRepository: Partial<AdminCafeRepository>;

  const mockCafes: readonly AdminCafe[] = [
    {
      externalId: 'cafe-central-001',
      name: 'Café Central',
      address: 'Av. Corrientes 1450, CABA',
      email: 'contacto@cafecentral.com',
      phoneNumber: '+54 11 4523-8890',
      description: 'Café clásico de especialidad',
      state: true,
      schedule: 'Lun a Vie 08:00 - 20:00',
      image: 'https://sample.com/central.jpg',
      createdAt: '2023-01-01T00:00:00.000Z',
      rating: 4.8,
      totalReviews: 50,
    },
    {
      externalId: 'cafe-tostado-002',
      name: 'Tostado Club',
      address: 'Thames 1600, Palermo',
      email: 'admin@tostado.com',
      phoneNumber: '+54 11 4833-9090',
      description: 'Toasties y café',
      state: false,
      schedule: 'Lun a Dom 09:00 - 19:00',
      image: 'https://sample.com/tostado.jpg',
      createdAt: '2023-05-01T00:00:00.000Z',
      rating: 4.5,
      totalReviews: 20,
    },
    {
      externalId: 'cafe-grano-003',
      name: 'Grano Dorado',
      address: 'Honduras 4920, Palermo',
      email: 'hola@grano.com',
      phoneNumber: '+54 11 3490-1122',
      description: 'Tostaduría de café',
      state: true,
      schedule: 'Mar a Dom 09:00 - 20:00',
      image: 'https://sample.com/grano.jpg',
      createdAt: '2023-06-01T00:00:00.000Z',
      rating: 4.9,
      totalReviews: 80,
    },
  ];

  beforeEach(() => {
    mockRepository = {
      getCafes: vi.fn().mockReturnValue(of(mockCafes)),
      getCafeById: vi.fn(),
      registerCafe: vi.fn(),
      updateCafeStatus: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AdminCafeStore,
        { provide: AdminCafeRepository, useValue: mockRepository },
      ],
    });

    store = TestBed.inject(AdminCafeStore);
  });

  it('loads cafes on initialize and computes stats', () => {
    expect(store.status()).toBe('ready');
    expect(store.cafes().length).toBe(3);
    expect(store.stats()).toEqual({
      totalCafes: 3,
      activeCafes: 2,
      inactiveCafes: 1,
      withSchedule: 3,
    });
  });

  it('sets error status when load fails', () => {
    mockRepository.getCafes = vi.fn().mockReturnValue(throwError(() => new Error('Network error')));
    store.loadCafes();

    expect(store.status()).toBe('error');
    expect(store.errorMessage()).toContain('No se pudo cargar la lista de cafeterías');
  });

  it('filters cafes by search query across multiple fields', () => {
    store.setSearchQuery('palermo');
    expect(store.filteredCafes().length).toBe(2);

    store.setSearchQuery('contacto@cafecentral');
    expect(store.filteredCafes().length).toBe(1);
    expect(store.filteredCafes()[0].externalId).toBe('cafe-central-001');

    store.setSearchQuery('non-existent');
    expect(store.filteredCafes().length).toBe(0);
  });

  it('filters cafes by state (active, inactive, all)', () => {
    store.setStateFilter('active');
    expect(store.filteredCafes().length).toBe(2);
    expect(store.filteredCafes().every((c) => c.state)).toBe(true);

    store.setStateFilter('inactive');
    expect(store.filteredCafes().length).toBe(1);
    expect(store.filteredCafes()[0].externalId).toBe('cafe-tostado-002');

    store.setStateFilter('all');
    expect(store.filteredCafes().length).toBe(3);
  });

  it('selects and clears a cafe', () => {
    store.selectCafe(mockCafes[0]);
    expect(store.selectedCafe()).toEqual(mockCafes[0]);

    store.selectCafeById('cafe-grano-003');
    expect(store.selectedCafe()?.name).toBe('Grano Dorado');

    store.clearSelection();
    expect(store.selectedCafe()).toBeNull();
  });

  it('opens and closes the register modal', () => {
    expect(store.isRegisterModalOpen()).toBe(false);

    store.openRegisterModal();
    expect(store.isRegisterModalOpen()).toBe(true);

    store.closeRegisterModal();
    expect(store.isRegisterModalOpen()).toBe(false);
  });

  it('registers a cafe successfully and adds it to the list', () => {
    const input: CreateCafeInput = {
      ownerName: 'Valeria Rossi',
      name: 'Nueva Cafetería',
      address: 'Calle Falsa 123',
      email: 'nueva@cafe.com',
      password: 'Password1',
      schedule: '08:00 - 18:00',
    };

    const created: AdminCafe = {
      externalId: 'cafe-nueva-123',
      name: 'Nueva Cafetería',
      address: 'Calle Falsa 123',
      email: 'nueva@cafe.com',
      phoneNumber: '',
      description: 'Sin descripción',
      state: true,
      schedule: '08:00 - 18:00',
      image: 'https://sample.com/cover.jpg',
      createdAt: '2026-10-22T00:00:00.000Z',
      rating: 5.0,
      totalReviews: 0,
    };

    mockRepository.registerCafe = vi.fn().mockReturnValue(of(created));
    store.openRegisterModal();

    store.registerCafe(input);

    expect(store.isProcessing()).toBe(false);
    expect(store.isRegisterModalOpen()).toBe(false);
    expect(store.cafes()[0]).toEqual(created);
    expect(store.actionMessage()?.type).toBe('success');
    expect(store.actionMessage()?.text).toContain('Nueva Cafetería');
  });

  it('handles error when registering a cafe', () => {
    mockRepository.registerCafe = vi
      .fn()
      .mockReturnValue(throwError(() => new Error('Email ya registrado')));

    store.registerCafe({
      ownerName: 'Error Owner',
      name: 'Café Error',
      address: 'Av. Test 100',
      email: 'error@cafe.com',
      password: 'Password1',
    });

    expect(store.isProcessing()).toBe(false);
    expect(store.actionMessage()?.type).toBe('error');
    expect(store.actionMessage()?.text).toBe('Email ya registrado');
  });

  it('updates cafe status (state active / inactive)', () => {
    const updated: AdminCafe = {
      ...mockCafes[1],
      state: true,
    };
    mockRepository.updateCafeStatus = vi.fn().mockReturnValue(of(updated));
    store.selectCafe(mockCafes[1]);

    store.updateCafeStatus('cafe-tostado-002', true);

    expect(store.isProcessing()).toBe(false);
    expect(store.cafes().find((c) => c.externalId === 'cafe-tostado-002')?.state).toBe(true);
    expect(store.selectedCafe()?.state).toBe(true);
    expect(store.actionMessage()?.type).toBe('success');
  });

  it('resets all filters', () => {
    store.setSearchQuery('palermo');
    store.setStateFilter('active');

    store.resetFilters();

    expect(store.searchQuery()).toBe('');
    expect(store.stateFilter()).toBe('all');
  });
});
