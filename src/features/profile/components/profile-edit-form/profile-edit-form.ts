import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { ClientProfile, UpdateClientProfileInput } from '../../types/profile.model';

export interface AvatarPreset {
  readonly label: string;
  readonly url: string;
}

@Component({
  selector: 'app-profile-edit-form',
  imports: [Icon],
  templateUrl: './profile-edit-form.html',
  host: { class: 'block' },
})
export class ProfileEditForm {
  readonly profile = input.required<ClientProfile>();
  readonly isSaving = input<boolean>(false);

  readonly save = output<UpdateClientProfileInput>();
  readonly cancel = output<void>();

  readonly firstName = linkedSignal(() => this.profile().firstName);
  readonly lastName = linkedSignal(() => this.profile().lastName);
  readonly phoneNumber = linkedSignal(() => this.profile().phoneNumber);
  readonly email = linkedSignal(() => this.profile().email);
  readonly avatarUrl = linkedSignal(() => this.profile().avatarUrl ?? '');

  readonly firstNameTouched = signal(false);
  readonly lastNameTouched = signal(false);
  readonly phoneTouched = signal(false);
  readonly emailTouched = signal(false);
  readonly avatarUrlTouched = signal(false);
  readonly attemptedSubmit = signal(false);

  readonly avatarPresets: readonly AvatarPreset[] = [
    {
      label: 'Foto 1',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces&q=80&auto=format',
    },
    {
      label: 'Foto 2',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&q=80&auto=format',
    },
    {
      label: 'Foto 3',
      url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=faces&q=80&auto=format',
    },
    {
      label: 'Foto 4',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces&q=80&auto=format',
    },
  ];

  readonly initials = computed(() => {
    const f = this.firstName().trim().charAt(0);
    const l = this.lastName().trim().charAt(0);
    const combined = `${f}${l}`.toUpperCase();
    return combined || '?';
  });

  readonly firstNameError = computed(() => {
    const val = this.firstName().trim();
    if (!val) {
      return 'El nombre es obligatorio.';
    }
    if (val.length < 2) {
      return 'El nombre debe tener al menos 2 caracteres.';
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(val)) {
      return 'El nombre solo debe contener letras y espacios.';
    }
    return null;
  });

  readonly lastNameError = computed(() => {
    const val = this.lastName().trim();
    if (!val) {
      return 'El apellido es obligatorio.';
    }
    if (val.length < 2) {
      return 'El apellido debe tener al menos 2 caracteres.';
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(val)) {
      return 'El apellido solo debe contener letras y espacios.';
    }
    return null;
  });

  readonly phoneError = computed(() => {
    const val = this.phoneNumber().trim();
    if (!val) {
      return 'El teléfono es obligatorio.';
    }
    if (!/^\d{10}$/.test(val)) {
      return 'El teléfono debe contener exactamente 10 dígitos numéricos (ej: 1145238890).';
    }
    return null;
  });

  readonly emailError = computed(() => {
    const val = this.email().trim();
    if (!val) {
      return 'El correo electrónico es obligatorio.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      return 'Ingresá un correo electrónico válido (ej: usuario@ejemplo.com).';
    }
    return null;
  });

  readonly avatarUrlError = computed(() => {
    const val = this.avatarUrl().trim();
    if (!val) {
      return null;
    }
    if (!/^https?:\/\/.+/i.test(val)) {
      return 'La URL del avatar debe comenzar con http:// o https://.';
    }
    return null;
  });

  readonly isFormValid = computed(
    () =>
      !this.firstNameError() &&
      !this.lastNameError() &&
      !this.phoneError() &&
      !this.emailError() &&
      !this.avatarUrlError(),
  );

  onSubmit(event: Event): void {
    event.preventDefault();
    this.attemptedSubmit.set(true);
    this.firstNameTouched.set(true);
    this.lastNameTouched.set(true);
    this.phoneTouched.set(true);
    this.emailTouched.set(true);
    this.avatarUrlTouched.set(true);

    if (!this.isFormValid()) {
      return;
    }

    this.save.emit({
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      phoneNumber: this.phoneNumber().trim(),
      email: this.email().trim(),
      avatarUrl: this.avatarUrl().trim() || null,
    });
  }

  onSelectAvatar(url: string): void {
    this.avatarUrl.set(url);
    this.avatarUrlTouched.set(true);
  }

  onClearAvatar(): void {
    this.avatarUrl.set('');
    this.avatarUrlTouched.set(true);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
