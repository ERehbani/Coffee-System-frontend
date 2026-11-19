import { DatePipe, DecimalPipe, formatNumber } from '@angular/common';
import {
  Component,
  ElementRef,
  Injector,
  LOCALE_ID,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { benefitFormatLabel } from '../../../admin-benefit-types/utils/benefit-format-labels';
import { AvailableBenefit } from '../../model/available-benefit.model';

export type BenefitRedeemPhase = 'idle' | 'confirming' | 'redeeming';

@Component({
  selector: 'app-available-benefit-card',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './benefit-card.html',
  styleUrl: './benefit-card.css',
  host: { class: 'block h-full' },
})
export class AvailableBenefitCard {
  private readonly injector = inject(Injector);
  private readonly locale = inject(LOCALE_ID);

  readonly benefit = input.required<AvailableBenefit>();
  readonly clientTierPoints = input<number | null>(null);
  readonly availablePoints = input<number | null>(null);
  readonly phase = input<BenefitRedeemPhase>('idle');
  /** Otro beneficio se está canjeando: se espera a que termine antes de pedir uno nuevo. */
  readonly locked = input(false);

  readonly redeemRequested = output<string>();
  readonly redeemConfirmed = output<void>();
  readonly redeemCancelled = output<void>();

  private readonly activateButton = viewChild<ElementRef<HTMLButtonElement>>('activateButton');
  private readonly confirmButton = viewChild<ElementRef<HTMLButtonElement>>('confirmButton');

  constructor() {
    afterRenderEffect(() => {
      if (this.phase() === 'confirming') {
        this.confirmButton()?.nativeElement.focus();
      }
    });
  }

  typeLabel = computed(() => {
    const type = this.benefit().benefitType;
    return type ? benefitFormatLabel(type) : 'Beneficio';
  });

  cafeLabel = computed(() => (this.benefit().global ? 'Todas las cafeterías' : this.benefit().cafeEntity ?? 'Cafetería'));

  isUnlocked = computed(() => {
    const requiredPoints = this.benefit().tierMinPoints;
    const clientPoints = this.clientTierPoints();
    if (requiredPoints === null) {
      return true;
    }
    return clientPoints !== null && clientPoints >= requiredPoints;
  });

  showAccess = computed(() => this.clientTierPoints() !== null);

  protected readonly confirmId = computed(() => `available-benefit-confirm-${this.benefit().externalId}`);

  // El agotado ya lo dice la etiqueta de arriba: acá solo se explica lo que el cliente puede resolver.
  protected readonly blockedReason = computed(() => {
    const { soldOut, tierName, pointsCost } = this.benefit();
    if (soldOut) {
      return null;
    }
    if (this.showAccess() && !this.isUnlocked()) {
      return tierName
        ? `Disponible desde ${tierName.charAt(0).toUpperCase()}${tierName.slice(1).toLowerCase()}`
        : 'Necesitás un nivel superior';
    }
    const points = this.availablePoints();
    return points !== null && pointsCost > points
      ? `Te faltan ${formatNumber(pointsCost - points, this.locale)} pts`
      : null;
  });

  // The action only exists for a benefit the client can pay for now; otherwise the card explains what is missing.
  protected readonly canRedeem = computed(() => {
    const points = this.availablePoints();
    return !this.benefit().soldOut && this.isUnlocked() && points !== null && points >= this.benefit().pointsCost;
  });

  protected cancel(): void {
    this.redeemCancelled.emit();
    afterNextRender(() => this.activateButton()?.nativeElement.focus(), { injector: this.injector });
  }
}
