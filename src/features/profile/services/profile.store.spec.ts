import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ClientProfile, ProfileDashboard, UpdateClientProfileInput } from '../types/profile.model';
import { ProfileRepository } from './profile.repository';
import { ProfileStore } from './profile.store';

describe('ProfileStore', () => {
  let store: ProfileStore;
  let mockRepository: any;

  const mockProfile: ClientProfile = {
    id: 'client-001',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@example.com',
    phoneNumber: '1145238890',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  const mockDashboard: ProfileDashboard = {
    profile: mockProfile,
    loyalty: {
      tier: 'silver',
      availablePoints: 850,
      lifetimePoints: 1420,
      nextTier: 'gold',
      nextTierThreshold: 3000,
      progressPercent: 47,
      pointsToNextTier: 1580,
    },
    activeRedemptions: [],
    nearbyCafes: [],
    featuredBenefits: [],
  };

  beforeEach(() => {
    mockRepository = {
      getDashboard: () => of(mockDashboard),
      updateProfile: (id: string, input: UpdateClientProfileInput) =>
        of({
          id,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phoneNumber: input.phoneNumber,
          avatarUrl: input.avatarUrl,
        }),
    };

    TestBed.configureTestingModule({
      providers: [ProfileStore, { provide: ProfileRepository, useValue: mockRepository }],
    });

    store = TestBed.inject(ProfileStore);
    TestBed.flushEffects();
  });

  it('should initialize and load dashboard profile', () => {
    expect(store.dashboard()?.profile.firstName).toBe('Juan');
    expect(store.profile()?.firstName).toBe('Juan');
    expect(store.profile()?.lastName).toBe('Pérez');
  });

  it('should update profile and set successMessage on saveProfile', () => {
    const updateInput: UpdateClientProfileInput = {
      firstName: 'Mateo',
      lastName: 'Gómez',
      email: 'mateo.gomez@test.com',
      phoneNumber: '1199887766',
      avatarUrl: 'https://example.com/new-avatar.jpg',
    };

    store.saveProfile(updateInput);

    expect(store.isSaving()).toBe(false);
    expect(store.successMessage()).toBe('¡Tus datos personales se han actualizado correctamente!');
    expect(store.errorMessage()).toBeNull();
    expect(store.profile()?.firstName).toBe('Mateo');
    expect(store.profile()?.lastName).toBe('Gómez');
    expect(store.profile()?.phoneNumber).toBe('1199887766');
    expect(store.dashboard()?.profile.firstName).toBe('Mateo');
  });

  it('should dismiss successMessage', () => {
    store.saveProfile({
      firstName: 'Mateo',
      lastName: 'Gómez',
      email: 'mateo@test.com',
      phoneNumber: '1199887766',
      avatarUrl: null,
    });

    expect(store.successMessage()).toBeTruthy();
    store.dismissSuccess();
    expect(store.successMessage()).toBeNull();
  });

  it('should set errorMessage when updateProfile fails', () => {
    mockRepository.updateProfile = () => throwError(() => new Error('Server error'));

    store.saveProfile({
      firstName: 'Error',
      lastName: 'User',
      email: 'err@test.com',
      phoneNumber: '1100000000',
      avatarUrl: null,
    });

    expect(store.isSaving()).toBe(false);
    expect(store.errorMessage()).toBe('Ocurrió un error al intentar guardar los cambios.');
    expect(store.successMessage()).toBeNull();
  });

  it('reports no days until expiry for a redemption that never expires', () => {
    mockRepository.getDashboard = () =>
      of({
        ...mockDashboard,
        activeRedemptions: [
          {
            id: 'r-1',
            title: 'Café',
            description: '',
            code: 'VLD-1',
            expiresAt: null,
            conditions: [],
          },
          {
            id: 'r-2',
            title: 'Taza',
            description: '',
            code: 'VLD-2',
            expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            conditions: [],
          },
        ],
      });
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [ProfileStore, { provide: ProfileRepository, useValue: mockRepository }],
    });
    store = TestBed.inject(ProfileStore);
    TestBed.flushEffects();

    expect(store.activeRedemptions().map((redemption) => redemption.daysUntilExpiry)).toEqual([
      null,
      3,
    ]);
  });
});
