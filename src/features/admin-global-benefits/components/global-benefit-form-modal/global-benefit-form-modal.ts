import { CommonModule } from '@angular/common';
import { Component, computed, effect, HostListener, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icon } from '../../../../shared/components/icon/icon';
import { ImageInput } from '../../../../shared/components/image-input/image-input';
import { toLocalIsoDate } from '../../../../shared/utils/local-date';
import {
  CatalogProductOption,
  CreateGlobalBenefitInput,
  GlobalBenefit,
  GlobalBenefitTier,
  GlobalBenefitType,
  PRODUCT_TYPES,
  UpdateGlobalBenefitInput,
} from '../../types/global-benefit.model';
import {
  BENEFIT_TIER_OPTIONS,
  BENEFIT_TYPE_OPTIONS,
  resolveTierId,
} from '../../utils/global-benefit.mapper';

const DISCOUNT_MIN = 5;
const DISCOUNT_MAX = 80;

@Component({
  selector: 'app-global-benefit-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, Icon, ImageInput],
  templateUrl: './global-benefit-form-modal.html',
})
export class GlobalBenefitFormModal {
  readonly isOpen = input.required<boolean>();
  readonly mode = input<'create' | 'edit'>('create');
  readonly benefit = input<GlobalBenefit | null>(null);
  readonly isProcessing = input(false);
  readonly catalogProducts = input<readonly CatalogProductOption[]>([]);

  readonly save = output<CreateGlobalBenefitInput | UpdateGlobalBenefitInput>();
  readonly close = output<void>();

  protected readonly discountMin = DISCOUNT_MIN;
  protected readonly discountMax = DISCOUNT_MAX;
  protected readonly typeOptions = BENEFIT_TYPE_OPTIONS;
  protected readonly tierOptions = BENEFIT_TIER_OPTIONS;

  protected readonly form = signal<CreateGlobalBenefitInput>({
    name: '',
    description: '',
    pointsCost: 500,
    type: 'CODIGO_DESCUENTO',
    tier: 'ALL',
    startDate: '',
    endDate: '',
    maxRedemptions: 200,
    discountPercent: 15,
    status: true,
    isPublic: true,
    termsAndConditions: '',
    image: '',
  });

  protected readonly submitted = signal(false);
  protected readonly imageUploading = signal(false);

  // A duplicate is the create form opened over an existing benefit (the store clears its id).
  protected readonly isDuplicate = computed(() => this.mode() === 'create' && this.benefit() !== null);

  constructor() {
    effect(() => {
      if (!this.isOpen()) return;
      const b = this.benefit();
      const today = toLocalIsoDate();
      const in90d = toLocalIsoDate(new Date(Date.now() + 90 * 864e5));

      this.form.set(b ? {
        name: b.name,
        description: b.description,
        pointsCost: b.pointsCost,
        type: b.type,
        catalogProductId: b.catalogProductId,
        tier: b.tier,
        tierId: b.tierId,
        startDate: b.startDate,
        endDate: b.endDate,
        maxRedemptions: b.maxRedemptions,
        discountPercent: b.discountPercent ?? 15,
        status: b.status,
        isPublic: b.isPublic,
        termsAndConditions: b.termsAndConditions ?? '',
        image: b.image ?? '',
      } : {
        name: '',
        description: '',
        pointsCost: 500,
        type: 'CODIGO_DESCUENTO',
        tier: 'ALL',
        startDate: today,
        endDate: in90d,
        maxRedemptions: 200,
        discountPercent: 15,
        status: true,
        isPublic: true,
        termsAndConditions: '',
        image: '',
      });
      this.submitted.set(false);
      // The image input is destroyed with the modal, so closing mid-upload would leave this flag stuck.
      this.imageUploading.set(false);
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen() && !this.isProcessing()) this.close.emit();
  }

  protected updateField<K extends keyof CreateGlobalBenefitInput>(key: K, val: CreateGlobalBenefitInput[K]): void {
    this.form.update((f) => ({ ...f, [key]: val }));
  }

  protected setPresetDuration(days: number): void {
    const end = toLocalIsoDate(new Date(Date.now() + days * 864e5));
    this.updateField('endDate', end);
  }

  protected needsProduct(): boolean {
    return PRODUCT_TYPES.includes(this.form().type);
  }

  protected isDiscountValid(): boolean {
    if (this.form().type !== 'CODIGO_DESCUENTO') return true;
    const discount = this.form().discountPercent;
    return discount !== undefined && Number.isInteger(discount) && discount >= DISCOUNT_MIN && discount <= DISCOUNT_MAX;
  }

  // The number box is empty while the user retypes it: undefined keeps it empty instead of snapping back to the default.
  protected setDiscount(value: number | null): void {
    this.updateField('discountPercent', value ?? undefined);
  }

  protected isValid(): boolean {
    const f = this.form();
    const hasValidDates = Boolean(f.startDate && f.endDate && f.startDate <= f.endDate);
    const hasProduct = !this.needsProduct() || Boolean(f.catalogProductId);
    return f.name.trim().length >= 3 && f.description.trim().length >= 5 && f.pointsCost >= 0 && f.maxRedemptions > 0 && hasValidDates && hasProduct && this.isDiscountValid();
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    if (!this.isValid() || this.isProcessing() || this.imageUploading()) return;

    const f = this.form();
    const payload = {
      ...f,
      tierId: resolveTierId(f.tier, f.tierId),
      pointsCost: Number(f.pointsCost),
      maxRedemptions: Number(f.maxRedemptions),
    };

    const b = this.benefit();
    this.save.emit(this.mode() === 'edit' && b ? { ...payload, id: b.id } : payload);
  }
}
