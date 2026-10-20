import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientProfile } from '../../types/profile.model';
import { ProfileEditForm } from './profile-edit-form';

describe('ProfileEditForm', () => {
  let fixture: ComponentFixture<ProfileEditForm>;
  let component: ProfileEditForm;

  const initialProfile: ClientProfile = {
    id: 'client-001',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@example.com',
    phoneNumber: '1145238890',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileEditForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileEditForm);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('profile', initialProfile);
    fixture.detectChanges();
  });

  it('should initialize fields with profile values', () => {
    expect(component.firstName()).toBe('Juan');
    expect(component.lastName()).toBe('Pérez');
    expect(component.email()).toBe('juan.perez@example.com');
    expect(component.phoneNumber()).toBe('1145238890');
    expect(component.avatarUrl()).toBe(
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    );
    expect(component.isFormValid()).toBe(true);
  });

  describe('Criterio de Aceptación 2: Validación de formatos inválidos', () => {
    it('should block save and indicate error when first name is empty or has invalid characters', () => {
      let savedData = null;
      component.save.subscribe((data) => (savedData = data));

      // Test empty name
      component.firstName.set('   ');
      fixture.detectChanges();

      const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(savedData).toBeNull();
      expect(component.firstNameError()).toBe('El nombre es obligatorio.');
      expect(component.isFormValid()).toBe(false);

      // Test invalid characters (numbers in name)
      component.firstName.set('Juan123');
      fixture.detectChanges();
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(savedData).toBeNull();
      expect(component.firstNameError()).toBe('El nombre solo debe contener letras y espacios.');
    });

    it('should block save and indicate error when phone is not exactly 10 digits', () => {
      let savedData = null;
      component.save.subscribe((data) => (savedData = data));

      component.phoneNumber.set('12345');
      fixture.detectChanges();

      const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(savedData).toBeNull();
      expect(component.phoneError()).toContain('exactamente 10 dígitos numéricos');
      expect(component.isFormValid()).toBe(false);
    });

    it('should block save and indicate error when email format is invalid', () => {
      let savedData = null;
      component.save.subscribe((data) => (savedData = data));

      component.email.set('correo-invalido');
      fixture.detectChanges();

      const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(savedData).toBeNull();
      expect(component.emailError()).toContain('correo electrónico válido');
      expect(component.isFormValid()).toBe(false);
    });

    it('should block save and indicate error when avatar URL is invalid format', () => {
      let savedData = null;
      component.save.subscribe((data) => (savedData = data));

      component.avatarUrl.set('ftp://invalid-url.com');
      fixture.detectChanges();

      const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(savedData).toBeNull();
      expect(component.avatarUrlError()).toContain('http:// o https://');
      expect(component.isFormValid()).toBe(false);
    });

    it('should show error messages in the DOM when fields are touched with invalid formats', () => {
      component.email.set('bad-email');
      component.phoneNumber.set('123');
      fixture.detectChanges();

      const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      const errorElements = fixture.nativeElement.querySelectorAll('p[role="alert"]');
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });

  describe('Criterio de Aceptación 1: Guardar cambios exitoso', () => {
    it('should emit save with modified fields when inputs are valid and form is submitted', () => {
      let emittedData: any = null;
      component.save.subscribe((data) => (emittedData = data));

      component.firstName.set('Carlos');
      component.lastName.set('Gómez');
      component.phoneNumber.set('1133445566');
      component.email.set('carlos.gomez@gmail.com');
      component.avatarUrl.set('https://images.unsplash.com/photo-1534528741775-53994a69daeb');
      fixture.detectChanges();

      expect(component.isFormValid()).toBe(true);

      const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(emittedData).toEqual({
        firstName: 'Carlos',
        lastName: 'Gómez',
        phoneNumber: '1133445566',
        email: 'carlos.gomez@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      });
    });

    it('should emit cancel when Cancelar button is clicked', () => {
      let cancelCalled = false;
      component.cancel.subscribe(() => (cancelCalled = true));

      const buttons = Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      ) as HTMLButtonElement[];
      const cancelButton = buttons.find((btn) => btn.textContent?.includes('Cancelar'));
      cancelButton?.click();

      expect(cancelCalled).toBe(true);
    });

    it('should allow selecting an avatar from presets', () => {
      component.onSelectAvatar(component.avatarPresets[0].url);
      expect(component.avatarUrl()).toBe(component.avatarPresets[0].url);
      expect(component.avatarUrlError()).toBeNull();
    });

    it('should allow clearing the avatar url', () => {
      component.onClearAvatar();
      expect(component.avatarUrl()).toBe('');
      expect(component.avatarUrlError()).toBeNull();
    });
  });
});
