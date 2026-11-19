import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { CafeProfileRepository } from '../../../cafe-profile/services/cafe-profile.repository';
import { CafeBenefitService } from '../../../cafe-benefits/services/cafe-benefit.service';
import { CafeProfile } from '../../../cafe-profile/types/cafe-profile.model';
import { ProductService } from '../../../catalog/services/product.service';
import { ImageUpload } from '../../../../shared/services/image-upload';
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
        { provide: ProductService, useValue: { getCategories: () => of([]) } },
        { provide: CafeBenefitService, useValue: { getBenefitTypes: () => of([]), getTiers: () => of([]) } },
        { provide: ImageUpload, useValue: { upload: () => of('') } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OnboardingPage);
    page = fixture.componentInstance;
    fixture.detectChanges();
  }

  function fillCafeStep(): void {
    page.phoneNumber.set('1145238890');
    page.logo.set('https://img/logo.png');
    page.image.set('https://img/cover.png');
    page.next();
  }

  function fillEverything(): void {
    fillCafeStep();
    page.openingHours.set([{ day: 'MONDAY', opensAt: '08:00', closesAt: '20:00' }]);
    page.next();
  }

  it('starts with the cafe step prefilled with what the cafe already has', async () => {
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
    fillCafeStep();

    page.next();

    expect(page.step()).toBe(1);
    expect(page.hoursError()).not.toBeNull();
  });

  it('lets the cafe reach the opening hours without a logo or a cover', async () => {
    await render();
    page.phoneNumber.set('1145238890');

    page.next();

    expect(page.step()).toBe(1);
  });

  it('saves every required field before the optional steps and opens the dashboard at the end', async () => {
    await render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fillEverything();

    expect(page.step()).toBe(2);
    page.next();
    page.next();
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

  it('keeps the cafe in the opening hours step with the error of the backend', async () => {
    await render();
    updateProfile.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 422, error: { detail: 'La cafetería debe abrir antes de cerrar el día MONDAY' } })),
    );

    fillEverything();

    expect(page.step()).toBe(1);
    expect(page.status()).toBe('ready');
    expect(page.errorMessage()).toBe('La cafetería debe abrir antes de cerrar el día MONDAY');
  });
});
