import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormField, form, max, maxLength, min, minLength, required } from '@angular/forms/signals';
import { Icon } from '../../../../shared/components/icon/icon';
import {
  BenefitTypeOption,
  CreateCafeBenefitRequest,
  TierOption,
} from '../../model/cafe-benefit.model';

interface BenefitFormModel {
  name: string;
  description: string;
  conditions: string;
  startDate: string;
  endDate: string;
  pointsCost: number;
  discountPercentage: number;
  maxRedemptions: number;
  typeId: string;
  tierId: string;
}

@Component({
  selector: 'app-benefit-form',
  imports: [FormField, Icon],
  templateUrl: './benefit-form.html',
  styleUrl: './benefit-form.css',
  host: { class: 'block' },
})
export class BenefitForm {
  readonly isSaving = input<boolean>(false);
  readonly benefitTypes = input<BenefitTypeOption[]>([]);
  readonly tiers = input<TierOption[]>([]);

  readonly save = output<CreateCafeBenefitRequest>();
  readonly cancel = output<void>();

  today = new Date().toISOString().slice(0, 10);

  formModel = signal<BenefitFormModel>({
    name: '',
    description: '',
    conditions: '',
    startDate: this.today,
    endDate: '',
    pointsCost: 100,
    discountPercentage: 15,
    maxRedemptions: 50,
    typeId: '',
    tierId: '',
  });

  attemptedSubmit = signal(false);

  benefitForm = form(this.formModel, (f) => {
    required(f.name, { message: 'El nombre de la promoción es obligatorio.' });
    minLength(f.name, 3, { message: 'El nombre debe tener al menos 3 caracteres.' });
    maxLength(f.name, 100, { message: 'El nombre no puede superar los 100 caracteres.' });

    required(f.description, { message: 'La descripción es obligatoria.' });
    minLength(f.description, 5, { message: 'La descripción debe tener al menos 5 caracteres.' });
    maxLength(f.description, 500, { message: 'La descripción no puede superar los 500 caracteres.' });

    maxLength(f.conditions, 500, { message: 'Las reglas no pueden superar los 500 caracteres.' });

    required(f.startDate, { message: 'La fecha de inicio de vigencia es obligatoria.' });
    required(f.endDate, { message: 'La fecha de fin de vigencia es obligatoria.' });

    required(f.pointsCost, { message: 'El costo en puntos es obligatorio.' });
    min(f.pointsCost, 0, { message: 'Los puntos no pueden ser negativos.' });

    required(f.discountPercentage, { message: 'El porcentaje de descuento es obligatorio.' });
    min(f.discountPercentage, 1, { message: 'El descuento debe ser de al menos 1%.' });
    max(f.discountPercentage, 100, { message: 'El descuento no puede superar el 100%.' });

    required(f.maxRedemptions, { message: 'El cupo de canjes es obligatorio.' });
    min(f.maxRedemptions, 1, { message: 'Debe permitir al menos 1 canje.' });
  });

  selectedBenefitType = computed(() => {
    return this.benefitTypes().find((t) => t.id === this.formModel().typeId);
  });

  isDiscountCode = computed(() => {
    return this.selectedBenefitType()?.name === 'CODIGO_DESCUENTO';
  });

  nameError = computed(() => this.benefitForm.name().errors()[0]?.message ?? null);
  descriptionError = computed(() => this.benefitForm.description().errors()[0]?.message ?? null);
  conditionsError = computed(() => this.benefitForm.conditions().errors()[0]?.message ?? null);
  startDateError = computed(() => this.benefitForm.startDate().errors()[0]?.message ?? null);
  endDateError = computed(() => {
    const error = this.benefitForm.endDate().errors()[0]?.message;
    if (error) {
      return error;
    }
    const start = this.formModel().startDate;
    const end = this.formModel().endDate;
    if (start && end && end < start) {
      return 'La fecha de fin no puede ser anterior a la fecha de inicio.';
    }
    return null;
  });
  pointsCostError = computed(() => {
    if (this.isDiscountCode()) {
      return null;
    }
    return this.benefitForm.pointsCost().errors()[0]?.message ?? null;
  });
  discountPercentageError = computed(() => {
    if (!this.isDiscountCode()) {
      return null;
    }
    return this.benefitForm.discountPercentage().errors()[0]?.message ?? null;
  });
  maxRedemptionsError = computed(() => this.benefitForm.maxRedemptions().errors()[0]?.message ?? null);

  typeError = computed(() => {
    if (!this.formModel().typeId) {
      return 'Debes seleccionar un tipo de beneficio.';
    }
    return null;
  });

  tierError = computed(() => {
    if (!this.formModel().tierId) {
      return 'Debes seleccionar un nivel de fidelización.';
    }
    return null;
  });

  isFormValid = computed(() => {
    const costOrDiscountValid = this.isDiscountCode()
      ? !this.discountPercentageError()
      : !this.pointsCostError();
    return (
      !this.nameError() &&
      !this.descriptionError() &&
      !this.conditionsError() &&
      !this.startDateError() &&
      !this.endDateError() &&
      !this.maxRedemptionsError() &&
      costOrDiscountValid &&
      !this.typeError() &&
      !this.tierError()
    );
  });

  constructor() {
    effect(() => {
      const types = this.benefitTypes();
      if (types.length > 0 && !this.formModel().typeId) {
        const first = types[0];
        const isDiscount = first.name === 'CODIGO_DESCUENTO';
        this.formModel.update((m) => ({
          ...m,
          typeId: first.id,
          pointsCost: isDiscount ? 0 : m.pointsCost,
          discountPercentage: isDiscount ? (first.porcentajeDescuento || 15) : m.discountPercentage,
        }));
      }
    });

    effect(() => {
      const tiersList = this.tiers();
      if (tiersList.length > 0) {
        const currentId = this.formModel().tierId;
        const exists = tiersList.some((t) => t.id === currentId);
        if (!currentId || !exists) {
          this.formModel.update((m) => ({ ...m, tierId: tiersList[0].id }));
        }
      }
    });
  }

  onTypeChange(value: string): void {
    const selected = this.benefitTypes().find((t) => t.id === value);
    const isDiscount = selected?.name === 'CODIGO_DESCUENTO';
    this.formModel.update((m) => ({
      ...m,
      typeId: value,
      pointsCost: isDiscount ? 0 : (m.pointsCost || 100),
      discountPercentage: isDiscount ? (selected?.porcentajeDescuento || m.discountPercentage || 15) : m.discountPercentage,
    }));
  }

  onTierChange(value: string): void {
    this.formModel.update((m) => ({ ...m, tierId: value }));
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.attemptedSubmit.set(true);

    if (!this.isFormValid() || this.isSaving()) {
      return;
    }

    const model = this.formModel();
    const isDiscount = this.isDiscountCode();
    this.save.emit({
      name: model.name.trim(),
      description: model.description.trim(),
      conditions: model.conditions.trim() || null,
      startDate: model.startDate,
      endDate: model.endDate,
      pointsCost: isDiscount ? 0 : Number(model.pointsCost),
      discountPercentage: isDiscount ? Number(model.discountPercentage) : null,
      maxRedemptions: Number(model.maxRedemptions),
      typeId: model.typeId,
      tierId: model.tierId,
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
