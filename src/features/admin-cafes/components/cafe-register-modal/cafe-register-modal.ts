import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormField, email, form, maxLength, minLength, pattern, required } from '@angular/forms/signals';
import { Icon } from '../../../../shared/components/icon/icon';
import { CreateCafeAccountRequest } from '../../../home/model/cafe.model';

interface CafeRegisterFormModel {
  email: string;
  password: string;
  name: string;
  address: string;
  phoneNumber: string;
  description: string;
}

@Component({
  selector: 'app-cafe-register-modal',
  imports: [FormField, Icon],
  templateUrl: './cafe-register-modal.html',
  styleUrl: './cafe-register-modal.css',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class CafeRegisterModal {
  readonly isOpen = input.required<boolean>();
  readonly isSubmitting = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly submitted = output<CreateCafeAccountRequest>();
  readonly cancelled = output<void>();

  cafeModel = signal<CafeRegisterFormModel>({
    email: '',
    password: '',
    name: '',
    address: '',
    phoneNumber: '',
    description: '',
  });

  attemptedSubmit = signal(false);
  showPassword = signal(false);

  constructor() {
    effect(() => {
      if (!this.isOpen() && !this.isSubmitting()) {
        this.reset();
      }
    });
  }

  cafeForm = form(this.cafeModel, (field) => {
    required(field.email, { message: 'El correo electrónico es obligatorio.' });
    email(field.email, { message: 'Ingresá un correo electrónico válido.' });

    required(field.password, { message: 'La contraseña es obligatoria.' });
    minLength(field.password, 6, { message: 'La contraseña debe tener al menos 6 caracteres.' });
    pattern(field.password, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
      message: 'Debe incluir al menos una mayúscula, una minúscula y un número.',
    });

    required(field.name, { message: 'El nombre de la cafetería es obligatorio.' });
    minLength(field.name, 2, { message: 'El nombre debe tener al menos 2 caracteres.' });
    maxLength(field.name, 80, { message: 'El nombre no puede superar los 80 caracteres.' });

    required(field.address, { message: 'La dirección es obligatoria.' });
    minLength(field.address, 5, { message: 'La dirección debe tener al menos 5 caracteres.' });
    maxLength(field.address, 150, { message: 'La dirección no puede superar los 150 caracteres.' });

    maxLength(field.description, 500, { message: 'La descripción no puede superar los 500 caracteres.' });
  });

  emailError = computed(() => this.cafeForm.email().errors()[0]?.message ?? null);
  passwordError = computed(() => this.cafeForm.password().errors()[0]?.message ?? null);
  nameError = computed(() => this.cafeForm.name().errors()[0]?.message ?? null);
  addressError = computed(() => this.cafeForm.address().errors()[0]?.message ?? null);
  descriptionError = computed(() => this.cafeForm.description().errors()[0]?.message ?? null);

  phoneError = computed(() => {
    const phone = this.cafeModel().phoneNumber?.trim();
    if (phone && !/^[0-9+\-\s()]{6,20}$/.test(phone)) {
      return 'El formato de teléfono no es válido.';
    }
    return null;
  });

  toggleShowPassword(): void {
    this.showPassword.update((value) => !value);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.attemptedSubmit.set(true);

    if (
      this.cafeForm().invalid() ||
      this.phoneError() ||
      this.isSubmitting()
    ) {
      return;
    }

    const current = this.cafeModel();
    this.submitted.emit({
      email: current.email.trim(),
      password: current.password,
      name: current.name.trim(),
      address: current.address.trim(),
      phoneNumber: current.phoneNumber.trim() || null,
      description: current.description.trim() || null,
    });
  }

  reset(): void {
    this.cafeModel.set({
      email: '',
      password: '',
      name: '',
      address: '',
      phoneNumber: '',
      description: '',
    });
    this.attemptedSubmit.set(false);
    this.showPassword.set(false);
  }

  onEscape(): void {
    if (!this.isOpen() || this.isSubmitting()) {
      return;
    }
    this.onCancel();
  }

  onCancel(): void {
    if (!this.isOpen() || this.isSubmitting()) {
      return;
    }
    this.reset();
    this.cancelled.emit();
  }
}
