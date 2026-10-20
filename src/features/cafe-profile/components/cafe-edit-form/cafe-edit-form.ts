import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';
import { CafeProfile, UpdateCafeProfileInput } from '../../types/cafe-profile.model';

@Component({
  selector: 'app-cafe-edit-form',
  imports: [Icon],
  templateUrl: './cafe-edit-form.html',
  host: { class: 'block' },
})
export class CafeEditForm {
  readonly profile = input.required<CafeProfile>();
  readonly isSaving = input<boolean>(false);

  readonly save = output<UpdateCafeProfileInput>();
  readonly cancel = output<void>();

  readonly address = linkedSignal(() => this.profile().address);
  readonly phoneNumber = linkedSignal(() => this.profile().phoneNumber);
  readonly schedule = linkedSignal(() => this.profile().schedule);
  readonly description = linkedSignal(() => this.profile().description);
  readonly image = linkedSignal(() => this.profile().image);

  readonly addressTouched = signal(false);
  readonly phoneTouched = signal(false);
  readonly scheduleTouched = signal(false);
  readonly descriptionTouched = signal(false);

  readonly descriptionLength = computed(() => this.description().length);

  readonly addressError = computed(() => {
    if (!this.address().trim()) {
      return 'La dirección no puede estar vacía.';
    }
    return null;
  });

  readonly phoneError = computed(() => {
    const val = this.phoneNumber().trim();
    if (!val) {
      return 'El teléfono es obligatorio.';
    }
    if (!/^\d{10}$/.test(val)) {
      return 'Debe contener exactamente 10 números.';
    }
    return null;
  });

  readonly scheduleError = computed(() => {
    if (!this.schedule().trim()) {
      return 'El horario de atención es obligatorio.';
    }
    return null;
  });

  readonly descriptionError = computed(() => {
    if (this.description().length > 500) {
      return 'La descripción no puede superar los 500 caracteres.';
    }
    return null;
  });

  readonly isFormValid = computed(() =>
    !this.addressError() &&
    !this.phoneError() &&
    !this.scheduleError() &&
    !this.descriptionError()
  );

  onSubmit(event: Event): void {
    event.preventDefault();
    this.addressTouched.set(true);
    this.phoneTouched.set(true);
    this.scheduleTouched.set(true);
    this.descriptionTouched.set(true);

    if (!this.isFormValid()) {
      return;
    }

    this.save.emit({
      address: this.address().trim(),
      phoneNumber: this.phoneNumber().trim(),
      schedule: this.schedule().trim(),
      description: this.description().trim(),
      image: this.image().trim(),
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
