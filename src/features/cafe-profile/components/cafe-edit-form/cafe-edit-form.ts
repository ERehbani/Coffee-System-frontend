import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { ImageInput } from '../../../../shared/components/image-input/image-input';
import { OpeningHoursEditor } from '../../../../shared/components/opening-hours-editor/opening-hours-editor';
import { hasValidOpeningHours, OpeningHours } from '../../../../shared/utils/opening-hours';
import { CafeProfile, UpdateCafeProfileInput } from '../../types/cafe-profile.model';
import { CafeHeader } from '../cafe-header/cafe-header';

@Component({
  selector: 'app-cafe-edit-form',
  imports: [CafeHeader, ImageInput, OpeningHoursEditor],
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
  readonly openingHours = linkedSignal<OpeningHours[]>(() => this.profile().openingHours);
  readonly description = linkedSignal(() => this.profile().description);
  readonly logo = linkedSignal(() => this.profile().logo);
  readonly image = linkedSignal(() => this.profile().image);
  readonly logoUploading = signal(false);
  readonly imageUploading = signal(false);
  readonly uploading = computed(() => this.logoUploading() || this.imageUploading());

  readonly addressTouched = signal(false);
  readonly phoneTouched = signal(false);
  readonly descriptionTouched = signal(false);
  readonly submitted = signal(false);

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

  readonly hoursError = computed(() =>
    hasValidOpeningHours(this.openingHours()) ? null : 'Revisá los horarios de atención.',
  );

  readonly descriptionError = computed(() => {
    if (this.description().length > 500) {
      return 'La descripción no puede superar los 500 caracteres.';
    }
    return null;
  });

  readonly isFormValid = computed(() =>
    !this.addressError() &&
    !this.phoneError() &&
    !this.hoursError() &&
    !this.descriptionError()
  );

  onSubmit(event: Event): void {
    event.preventDefault();
    this.addressTouched.set(true);
    this.phoneTouched.set(true);
    this.descriptionTouched.set(true);
    this.submitted.set(true);

    if (!this.isFormValid() || this.uploading()) {
      return;
    }

    this.save.emit({
      address: this.address().trim(),
      phoneNumber: this.phoneNumber().trim(),
      openingHours: this.openingHours(),
      description: this.description().trim(),
      logo: this.logo().trim(),
      image: this.image().trim(),
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
