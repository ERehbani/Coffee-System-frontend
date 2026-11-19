import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormField, form, maxLength, minLength, required } from '@angular/forms/signals';
import { Icon } from '../../../../shared/components/icon/icon';
import { Cafe, UpdateCafeRequest } from '../../../home/model/cafe.model';

interface CafeEditFormModel {
  name: string;
  address: string;
  phoneNumber: string;
  description: string;
}

const TEN_DIGITS = /^\d{10}$/;

@Component({
  selector: 'app-cafe-edit-modal',
  imports: [FormField, Icon],
  templateUrl: './cafe-edit-modal.html',
  host: {
    '(document:keydown.escape)': 'onCancel()',
  },
})
export class CafeEditModal {
  readonly cafe = input<Cafe | null>(null);
  readonly isSubmitting = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly submitted = output<UpdateCafeRequest>();
  readonly cancelled = output<void>();

  readonly cafeModel = signal<CafeEditFormModel>({
    name: '',
    address: '',
    phoneNumber: '',
    description: '',
  });
  readonly attemptedSubmit = signal(false);

  readonly cafeForm = form(this.cafeModel, (field) => {
    required(field.name, { message: 'El nombre de la cafetería es obligatorio.' });
    minLength(field.name, 2, { message: 'El nombre debe tener al menos 2 caracteres.' });
    maxLength(field.name, 80, { message: 'El nombre no puede superar los 80 caracteres.' });

    required(field.address, { message: 'La dirección es obligatoria.' });
    minLength(field.address, 5, { message: 'La dirección debe tener al menos 5 caracteres.' });
    maxLength(field.address, 150, { message: 'La dirección no puede superar los 150 caracteres.' });

    maxLength(field.description, 500, {
      message: 'La descripción no puede superar los 500 caracteres.',
    });
  });

  readonly nameError = computed(() => this.cafeForm.name().errors()[0]?.message ?? null);
  readonly addressError = computed(() => this.cafeForm.address().errors()[0]?.message ?? null);
  readonly descriptionError = computed(
    () => this.cafeForm.description().errors()[0]?.message ?? null,
  );
  readonly phoneError = computed(() => {
    const phone = this.cafeModel().phoneNumber.trim();
    return phone && !TEN_DIGITS.test(phone)
      ? 'El teléfono tiene que tener 10 números, sin espacios ni guiones.'
      : null;
  });

  constructor() {
    effect(() => {
      const cafe = this.cafe();
      if (cafe) {
        this.fillWith(cafe);
      }
    });
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.attemptedSubmit.set(true);

    const cafe = this.cafe();
    if (!cafe || this.cafeForm().invalid() || this.phoneError() || this.isSubmitting()) {
      return;
    }

    const changes = this.cafeModel();
    this.submitted.emit({
      name: changes.name.trim(),
      address: changes.address.trim(),
      phoneNumber: changes.phoneNumber.trim() || null,
      description: changes.description.trim() || null,
      logo: cafe.logo ?? null,
      image: cafe.image ?? null,
    });
  }

  onCancel(): void {
    if (this.cafe() === null || this.isSubmitting()) {
      return;
    }
    this.cancelled.emit();
  }

  private fillWith(cafe: Cafe): void {
    this.cafeModel.set({
      name: cafe.name,
      address: cafe.address,
      phoneNumber: cafe.phoneNumber ?? '',
      description: cafe.description ?? '',
    });
    this.attemptedSubmit.set(false);
  }
}
