import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { ProfileRepository } from '../../services/profile.repository';
import { ProfileStore } from '../../services/profile.store';
import { ClientProfile, ProfileDashboard, UpdateClientProfileInput } from '../../types/profile.model';
import { ProfileEditPage } from './profile-edit-page';

describe('ProfileEditPage', () => {
  let fixture: ComponentFixture<ProfileEditPage>;
  let component: ProfileEditPage;
  let store: ProfileStore;
  let router: Router;

  const mockProfile: ClientProfile = {
    id: 'client-001',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@example.com',
    phoneNumber: '1145238890',
    avatarUrl: null,
  };

  const mockDashboard: ProfileDashboard = {
    profile: mockProfile,
    loyalty: {
      tier: 'gold',
      availablePoints: 500,
      lifetimePoints: 1000,
      nextTier: null,
      nextTierThreshold: null,
    },
    activeRedemptions: [],
    nearbyCafes: [],
    featuredBenefits: [],
  };

  const mockRepository = {
    getDashboard: () => of(mockDashboard),
    updateProfile: (_id: string, input: UpdateClientProfileInput) =>
      of({
        id: 'client-001',
        ...input,
      }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileEditPage],
      providers: [
        provideRouter([]),
        ProfileStore,
        { provide: ProfileRepository, useValue: mockRepository },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileEditPage);
    component = fixture.componentInstance;
    store = TestBed.inject(ProfileStore);
    router = TestBed.inject(Router);
    TestBed.flushEffects();
    fixture.detectChanges();
  });

  it('should render the edit form when profile is loaded', () => {
    const formElement = fixture.nativeElement.querySelector('app-profile-edit-form');
    expect(formElement).not.toBeNull();
  });

  it('should show success notification and update profile on save', () => {
    const updateInput: UpdateClientProfileInput = {
      firstName: 'Ana',
      lastName: 'Silva',
      phoneNumber: '1198765432',
      email: 'ana.silva@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    };

    component['onSave'](updateInput);
    fixture.detectChanges();

    expect(store.successMessage()).toBe('¡Tus datos personales se han actualizado correctamente!');
    const successBanner = fixture.nativeElement.querySelector('[role="status"]');
    expect(successBanner).not.toBeNull();
    expect(successBanner.textContent).toContain('actualizado correctamente');
  });

  it('should navigate to /profile on cancel', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component['onCancel']();
    expect(navigateSpy).toHaveBeenCalledWith(['/profile']);
  });
});
