import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import {
  ActiveRedemption,
  ClientProfile,
  ProfileDashboard,
  UpdateClientProfileInput,
} from '../types/profile.model';
import { buildProfileDashboardFixture } from '../utils/profile.fixture';
import { toProfileDashboard } from '../utils/profile.mapper';
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
      updateProfile: vi.fn((id: string, input: UpdateClientProfileInput) => of({ id, ...input })),
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
      phoneNumber: '1199887766',
      avatarUrl: 'https://example.com/new-avatar.jpg',
    };

    store.saveProfile(updateInput);

    expect(mockRepository.updateProfile).toHaveBeenCalledWith('client-001', updateInput);
    expect(store.isSaving()).toBe(false);
    expect(store.successMessage()).toBe('¡Tus datos personales se han actualizado correctamente!');
    expect(store.errorMessage()).toBeNull();
    expect(store.profile()?.firstName).toBe('Mateo');
    expect(store.profile()?.lastName).toBe('Gómez');
    expect(store.profile()?.phoneNumber).toBe('1199887766');
    expect(store.dashboard()?.profile.firstName).toBe('Mateo');
  });

  it('keeps the email of the account after saving, since the backend does not return it', () => {
    store.saveProfile({
      firstName: 'Mateo',
      lastName: 'Gómez',
      phoneNumber: '1199887766',
      avatarUrl: null,
    });

    expect(store.profile()?.email).toBe('juan.perez@example.com');
    expect(store.dashboard()?.profile.email).toBe('juan.perez@example.com');
  });

  it('does not save with an invented client id while the profile is not loaded', () => {
    mockRepository.getDashboard = () => throwError(() => new Error('500'));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [ProfileStore, { provide: ProfileRepository, useValue: mockRepository }],
    });
    store = TestBed.inject(ProfileStore);
    TestBed.flushEffects();

    store.saveProfile({
      firstName: 'Mateo',
      lastName: 'Gómez',
      phoneNumber: '1199887766',
      avatarUrl: null,
    });

    expect(mockRepository.updateProfile).not.toHaveBeenCalled();
    expect(store.isSaving()).toBe(false);
  });

  it('should dismiss successMessage', () => {
    store.saveProfile({
      firstName: 'Mateo',
      lastName: 'Gómez',
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
      phoneNumber: '1100000000',
      avatarUrl: null,
    });

    expect(store.isSaving()).toBe(false);
    expect(store.errorMessage()).toBe('Ocurrió un error al intentar guardar los cambios.');
    expect(store.successMessage()).toBeNull();
  });

  describe('reloading the dashboard', () => {
    async function settle(): Promise<void> {
      TestBed.flushEffects();
      await Promise.resolve();
      TestBed.flushEffects();
    }

    it('reports loading again until the fresh dashboard arrives', async () => {
      const freshDashboard = new Subject<ProfileDashboard>();
      mockRepository.getDashboard = () => freshDashboard;
      expect(store.status()).toBe('ready');

      store.reload();
      await settle();
      expect(store.status()).toBe('loading');

      freshDashboard.next({
        ...mockDashboard,
        loyalty: { ...mockDashboard.loyalty, availablePoints: 990 },
      });
      freshDashboard.complete();
      await settle();

      expect(store.status()).toBe('ready');
      expect(store.dashboard()?.loyalty.availablePoints).toBe(990);
    });

    it('reports an error when the reload fails', async () => {
      mockRepository.getDashboard = () => throwError(() => new Error('500'));

      store.reload();
      await settle();

      expect(store.status()).toBe('error');
    });
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
            expiresAtHasTime: false,
            cafeName: null,
            conditions: [],
          },
          {
            id: 'r-2',
            title: 'Taza',
            description: '',
            code: 'VLD-2',
            expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            expiresAtHasTime: true,
            cafeName: 'Cafe Norte',
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

  describe('expired redemptions', () => {
    const DAY_MS = 24 * 60 * 60 * 1000;
    const redemption = (id: string, expiresAt: Date | null): ActiveRedemption => ({
      id,
      title: id,
      description: '',
      code: `VLD-${id}`,
      expiresAt,
      expiresAtHasTime: true,
      cafeName: null,
      conditions: [],
    });

    function loadWith(activeRedemptions: readonly ActiveRedemption[]): ProfileStore {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ProfileStore,
          {
            provide: ProfileRepository,
            useValue: { getDashboard: () => of({ ...mockDashboard, activeRedemptions }) },
          },
        ],
      });
      const loaded = TestBed.inject(ProfileStore);
      TestBed.flushEffects();
      return loaded;
    }

    it('drops redemptions whose expiry has passed and keeps the rest in order', () => {
      store = loadWith([
        redemption('expired', new Date(Date.now() - DAY_MS)),
        redemption('open-ended', null),
        redemption('valid', new Date(Date.now() + DAY_MS)),
        redemption('expired-just-now', new Date(Date.now() - 1000)),
      ]);

      expect(store.activeRedemptions().map(({ id }) => id)).toEqual(['open-ended', 'valid']);
    });

    it('keeps a coupon with a date-only expiry of today, valid through the end of the day', () => {
      const now = new Date();
      const pad = (value: number) => String(value).padStart(2, '0');
      const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const dto = buildProfileDashboardFixture(now);
      const dashboard = toProfileDashboard({
        ...dto,
        activeRedemptions: [{ ...dto.activeRedemptions[0], id: 'today', expiresAt: today }],
      });

      store = loadWith(dashboard.activeRedemptions);

      expect(dashboard.activeRedemptions[0].expiresAtHasTime).toBe(false);
      expect(store.activeRedemptions().map(({ id }) => id)).toEqual(['today']);
    });

    it('keeps a redemption that expires later today', () => {
      store = loadWith([redemption('today', new Date(Date.now() + 60 * 1000))]);

      expect(store.activeRedemptions().map(({ id }) => id)).toEqual(['today']);
    });
  });
});
