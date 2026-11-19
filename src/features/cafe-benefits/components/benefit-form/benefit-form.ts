import {
  Component,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { FormField, form, max, maxLength, min, minLength, required } from '@angular/forms/signals';
import { Icon } from '../../../../shared/components/icon/icon';
import { ImageInput } from '../../../../shared/components/image-input/image-input';
import { toLocalIsoDate } from '../../../../shared/utils/local-date';
import {
  BenefitType,
  BenefitTypeOption,
  CafeBenefit,
  CreateCafeBenefitRequest,
  PRODUCT_BENEFIT_TYPES,
  ProductOption,
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
  maxRedemptions: number | null;
  type: BenefitType | '';
  productId: string;
  tierId: string;
  image: string;
}

// The host is a flex column so a parent with a fixed height (the benefits modal) can scroll the body of the form.
@Component({
  selector: 'app-benefit-form',
  imports: [FormField, Icon, ImageInput],
  templateUrl: './benefit-form.html',
  styleUrl: './benefit-form.css',
  host: { class: 'flex min-h-0 flex-1 flex-col' },
})
export class BenefitForm {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly benefit = input<CafeBenefit | null>(null);
  readonly isSaving = input<boolean>(false);
  readonly benefitTypes = input<BenefitTypeOption[]>([]);
  readonly tiers = input<TierOption[]>([]);
  readonly products = input<ProductOption[]>([]);

  readonly save = output<CreateCafeBenefitRequest>();
  readonly cancel = output<void>();

  readonly isEdit = computed(() => this.benefit() !== null);

  // El backend admite beneficios sin cupo: al editar uno, el campo puede quedar vacío.
  readonly allowsNoLimit = computed(() => {
    const benefit = this.benefit();
    return benefit !== null && benefit.maxRedemptions === null;
  });

  // Si el producto del beneficio ya no está activo, se ofrece igual para que lo mostrado coincida con lo que se guarda.
  readonly productOptions = computed<ProductOption[]>(() => {
    const products = this.products();
    const benefit = this.benefit();
    if (!benefit?.productId || products.some((product) => product.id === benefit.productId)) {
      return products;
    }
    return [...products, { id: benefit.productId, name: `${benefit.productName ?? 'Producto'} (inactivo)` }];
  });

  today = toLocalIsoDate();

  formModel = linkedSignal<BenefitFormModel>(() => {
    const benefit = this.benefit();
    if (benefit) {
      return {
        name: benefit.name,
        description: benefit.description,
        conditions: benefit.conditions ?? '',
        startDate: benefit.startDate ?? '',
        endDate: benefit.endDate ?? '',
        pointsCost: benefit.pointsCost,
        discountPercentage: benefit.discountPercentage ?? 15,
        maxRedemptions: benefit.maxRedemptions,
        type: benefit.benefitType ?? '',
        productId: benefit.productId ?? '',
        tierId: benefit.tierId ?? '',
        image: benefit.image ?? '',
      };
    }
    return {
      name: '',
      description: '',
      conditions: '',
      startDate: this.today,
      endDate: '',
      pointsCost: 100,
      discountPercentage: 15,
      maxRedemptions: 50,
      type: '',
      productId: '',
      tierId: '',
      image: '',
    };
  });

  attemptedSubmit = signal(false);
  imageUploading = signal(false);

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

    required(f.maxRedemptions, {
      message: 'El cupo de canjes es obligatorio.',
      when: () => !this.allowsNoLimit(),
    });
    min(f.maxRedemptions, 1, { message: 'Debe permitir al menos 1 canje.' });

    maxLength(f.image, 500, { message: 'La URL de la imagen no puede superar los 500 caracteres.' });
  });

  isDiscountCode = computed(() => this.formModel().type === 'CODIGO_DESCUENTO');

  needsProduct = computed(() => {
    const type = this.formModel().type;
    return type !== '' && PRODUCT_BENEFIT_TYPES.includes(type);
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
  imageError = computed(() => this.benefitForm.image().errors()[0]?.message ?? null);

  typeError = computed(() => {
    if (!this.formModel().type) {
      return 'Seleccioná un tipo de beneficio.';
    }
    return null;
  });

  productError = computed(() => {
    if (this.needsProduct() && !this.formModel().productId) {
      return 'Elegí el producto del beneficio.';
    }
    return null;
  });

  tierError = computed(() => {
    if (!this.formModel().tierId) {
      return 'Seleccioná un nivel de fidelización.';
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
      !this.imageError() &&
      costOrDiscountValid &&
      !this.typeError() &&
      !this.productError() &&
      !this.tierError()
    );
  });

  constructor() {
    effect(() => {
      const types = this.benefitTypes();
      if (types.length > 0 && !this.formModel().type) {
        this.onTypeChange(types[0].id);
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

    // Al abrirse el formulario (en el diálogo de promociones o en el onboarding) el foco va al primer campo.
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLInputElement>('#benefit-name')?.focus());
  }

  onTypeChange(value: BenefitType): void {
    const isDiscount = value === 'CODIGO_DESCUENTO';
    this.formModel.update((m) => ({
      ...m,
      type: value,
      productId: PRODUCT_BENEFIT_TYPES.includes(value) ? m.productId : '',
      pointsCost: isDiscount ? 0 : m.pointsCost || 100,
      discountPercentage: m.discountPercentage || 15,
    }));
  }

  onProductChange(value: string): void {
    this.formModel.update((m) => ({ ...m, productId: value }));
  }

  onTierChange(value: string): void {
    this.formModel.update((m) => ({ ...m, tierId: value }));
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.attemptedSubmit.set(true);

    if (!this.isFormValid() || this.isSaving() || this.imageUploading()) {
      return;
    }

    const model = this.formModel();
    if (!model.type) {
      return;
    }
    const isDiscount = this.isDiscountCode();
    this.save.emit({
      name: model.name.trim(),
      description: model.description.trim(),
      conditions: model.conditions.trim() || null,
      startDate: model.startDate,
      endDate: model.endDate,
      pointsCost: isDiscount ? 0 : Number(model.pointsCost),
      discountPercentage: isDiscount ? Number(model.discountPercentage) : null,
      maxRedemptions: model.maxRedemptions === null ? null : Number(model.maxRedemptions),
      type: model.type,
      productId: this.needsProduct() ? model.productId : null,
      tierId: model.tierId,
      image: model.image.trim() || null,
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
