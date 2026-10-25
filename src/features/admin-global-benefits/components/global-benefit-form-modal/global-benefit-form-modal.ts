import { CommonModule } from '@angular/common';
import { Component, effect, HostListener, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icon } from '../../../../shared/components/icon/icon';
import {
  CreateGlobalBenefitInput,
  GlobalBenefit,
  GlobalBenefitTier,
  GlobalBenefitType,
  UpdateGlobalBenefitInput,
} from '../../types/global-benefit.model';
import {
  BENEFIT_TIER_OPTIONS,
  BENEFIT_TYPE_OPTIONS,
  getBenefitTypeMeta,
  getTierMeta,
  resolveTierId,
  resolveTypeId,
} from '../../utils/global-benefit.mapper';

@Component({
  selector: 'app-global-benefit-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, Icon],
  templateUrl: './global-benefit-form-modal.html',
})
export class GlobalBenefitFormModal {
  readonly isOpen = input.required<boolean>();
  readonly mode = input<'create' | 'edit'>('create');
  readonly benefit = input<GlobalBenefit | null>(null);
  readonly isProcessing = input(false);

  readonly save = output<CreateGlobalBenefitInput | UpdateGlobalBenefitInput>();
  readonly close = output<void>();

  protected readonly typeOptions = BENEFIT_TYPE_OPTIONS;
  protected readonly tierOptions = BENEFIT_TIER_OPTIONS;

  protected readonly form = signal<CreateGlobalBenefitInput>({
    name: '',
    description: '',
    pointsCost: 500,
    type: 'CODIGO_DESCUENTO',
    tier: 'BRONCE',
    startDate: '',
    endDate: '',
    maxRedemptions: 200,
    discountPercent: 15,
    status: true,
    isPublic: true,
    termsAndConditions: 'Válido en todas las cafeterías asociadas.',
  });

  protected readonly submitted = signal(false);

  constructor() {
    effect(() => {
      if (!this.isOpen()) return;
      const b = this.benefit();
      const today = new Date().toISOString().slice(0, 10);
      const in90d = new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10);

      this.form.set(b ? {
        name: b.name,
        description: b.description,
        pointsCost: b.pointsCost,
        type: b.type,
        typeId: b.typeId,
        tier: b.tier,
        tierId: b.tierId,
        startDate: b.startDate,
        endDate: b.endDate,
        maxRedemptions: b.maxRedemptions,
        discountPercent: b.discountPercent ?? 15,
        status: b.status,
        isPublic: b.isPublic,
        termsAndConditions: b.termsAndConditions || 'Válido en toda la red.',
      } : {
        name: '',
        description: '',
        pointsCost: 500,
        type: 'CODIGO_DESCUENTO',
        tier: 'BRONCE',
        startDate: today,
        endDate: in90d,
        maxRedemptions: 200,
        discountPercent: 15,
        status: true,
        isPublic: true,
        termsAndConditions: 'Válido en todas las cafeterías asociadas a la red.',
      });
      this.submitted.set(false);
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
    const end = new Date(Date.now() + days * 864e5).toISOString().slice(0, 10);
    this.updateField('endDate', end);
  }

  protected getTypeMeta = getBenefitTypeMeta;
  protected getTierMeta = getTierMeta;

  protected isValid(): boolean {
    const f = this.form();
    const hasValidDates = Boolean(f.startDate && f.endDate && f.startDate <= f.endDate);
    return f.name.trim().length >= 3 && f.description.trim().length >= 5 && f.pointsCost >= 0 && f.maxRedemptions > 0 && hasValidDates;
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    if (!this.isValid() || this.isProcessing()) return;

    const f = this.form();
    const payload = {
      ...f,
      typeId: resolveTypeId(f.type, f.typeId),
      tierId: resolveTierId(f.tier, f.tierId),
      pointsCost: Number(f.pointsCost),
      maxRedemptions: Number(f.maxRedemptions),
    };

    const b = this.benefit();
    this.save.emit(this.mode() === 'edit' && b ? { ...payload, id: b.id } : payload);
  }
}
