import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { CafeProfileRepository } from '../../../cafe-profile/services/cafe-profile.repository';
import { CafeProfile } from '../../../cafe-profile/types/cafe-profile.model';
import { OnboardingPage } from './onboarding-page';

const NEW_CAFE: CafeProfile = {
  id: 'cafe-1',
  name: 'Café Nuevo',
  address: 'Av. Siempreviva 742',
  email: 'nuevo@cafe.com',
  phoneNumber: '',
  description: '',
  isOpen: false,
  logo: '',
  image: '',
  openingHours: [],
  profileComplete: false,
};

describe('OnboardingPage', () => {
  let fixture: ComponentFixture<OnboardingPage>;
  let page: OnboardingPage;
  let updateProfile: ReturnType<typeof vi.fn>;

  async function render(): Promise<void> {
    updateProfile = vi.fn(() => of({ ...NEW_CAFE, profileComplete: true }));
    await TestBed.configureTestingModule({
      imports: [OnboardingPage],
      providers: [
        provideRouter([]),
        { provide: CafeProfileRepository, useValue: { getProfile: () => of(NEW_CAFE), updateProfile } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OnboardingPage);
    page = fixture.componentInstance;
    fixture.detectChanges();
  }

  function fillEverything(): void {
    page.phoneNumber.set('1145238890');
    page.next();
    page.openingHours.set([{ day: 'MONDAY', opensAt: '08:00', closesAt: '20:00' }]);
    page.next();
    page.logo.set('https://img/logo.png');
    page.image.set('https://img/cover.png');
    page.next();
  }

  it('starts with the contact step prefilled with what the cafe already has', async () => {
    await render();

    expect(page.step()).toBe(0);
    expect(page.address()).toBe('Av. Siempreviva 742');
    expect(fixture.nativeElement.textContent).toContain('Configurá Café Nuevo');
  });

  it('does not move on until the phone is valid', async () => {
    await render();

    page.next();
    fixture.detectChanges();

    expect(page.step()).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Ingresá los 10 dígitos del teléfono.');
  });

  it('asks for at least one day of opening hours', async () => {
    await render();
    page.phoneNumber.set('1145238890');
    page.next();

    page.next();

    expect(page.step()).toBe(1);
    expect(page.hoursError()).not.toBeNull();
  });

  it('asks for the logo and the cover before the summary', async () => {
    await render();
    page.phoneNumber.set('1145238890');
    page.next();
    page.openingHours.set([{ day: 'MONDAY', opensAt: '08:00', closesAt: '20:00' }]);
    page.next();

    page.next();

    expect(page.step()).toBe(2);
    expect(page.logoError()).toBe('El logo es obligatorio.');
    expect(page.imageError()).toBe('La portada es obligatoria.');
  });

  it('saves every required field and opens the dashboard', async () => {
    await render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fillEverything();

    expect(page.isLastStep()).toBe(true);
    page.finish();

    expect(updateProfile).toHaveBeenCalledWith('cafe-1', {
      address: 'Av. Siempreviva 742',
      phoneNumber: '1145238890',
      description: '',
      logo: 'https://img/logo.png',
      image: 'https://img/cover.png',
      openingHours: [{ day: 'MONDAY', opensAt: '08:00', closesAt: '20:00' }],
    });
    expect(navigate).toHaveBeenCalledWith('/cafe/dashboard');
  });

  it('keeps the cafe in the summary with the error of the backend', async () => {
    await render();
    fillEverything();
    updateProfile.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 422, error: { detail: 'The cafe must open before it closes on MONDAY' } })),
    );

    page.finish();

    expect(page.status()).toBe('ready');
    expect(page.errorMessage()).toBe('The cafe must open before it closes on MONDAY');
  });
});
