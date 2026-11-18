import { DecimalPipe } from '@angular/common';
import { Component, ElementRef, OnInit, afterRenderEffect, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartButton } from '../../../cart/components/cart-button/cart-button';
import { ThemeToggle } from '../../../../shared/components/theme-toggle/theme-toggle';
import {
  BENEFIT_FORMAT_CODES,
  BenefitFormatCode,
} from '../../../admin-benefit-types/types/benefit-format.model';
import { benefitFormatLabel } from '../../../admin-benefit-types/utils/benefit-format-labels';
import { Cafe } from '../../../home/model/cafe.model';
import { CafeService } from '../../../home/services/cafe.service';
import { ProfileRepository } from '../../../profile/services/profile.repository';
import { RedeemedBenefit } from '../../../profile/types/profile.model';
import { toRedeemErrorMessage } from '../../../profile/utils/redeem-error';
import { AvailableBenefit } from '../../model/available-benefit.model';
import { AvailableBenefitService } from '../../services/available-benefit.service';
import { AvailableBenefitCard, BenefitRedeemPhase } from '../benefit-card/benefit-card';

interface RedeemTarget {
  readonly id: string;
  readonly phase: Exclude<BenefitRedeemPhase, 'idle'>;
}

@Component({
  selector: 'app-available-benefits',
  imports: [DecimalPipe, RouterLink, AvailableBenefitCard, CartButton, ThemeToggle],
  templateUrl: './available-benefits.html',
  styleUrl: './available-benefits.css',
  host: { class: 'block' },
})
export class AvailableBenefits implements OnInit {
  private readonly benefitService = inject(AvailableBenefitService);
  private readonly cafeService = inject(CafeService);
  private readonly profileRepository = inject(ProfileRepository);

  benefits = signal<AvailableBenefit[]>([]);
  cafes = signal<Cafe[]>([]);
  clientTierPoints = signal<number | null>(null);
  availablePoints = signal<number | null>(null);
  isLoading = signal(true);
  hasError = signal(false);
  selectedCafeId = signal('');
  selectedType = signal<BenefitFormatCode | ''>('');
  redeemTarget = signal<RedeemTarget | null>(null);
  redeemed = signal<RedeemedBenefit | null>(null);
  redeemError = signal<string | null>(null);

  private readonly feedback = viewChild<ElementRef<HTMLElement>>('feedback');

  readonly typeOptions = BENEFIT_FORMAT_CODES.map((code) => ({
    value: code,
    label: benefitFormatLabel(code),
  }));

  hasFilters = computed(() => this.selectedCafeId() !== '' || this.selectedType() !== '');

  unlockedCount = computed(() => {
    const clientPoints = this.clientTierPoints();
    if (clientPoints === null) {
      return null;
    }
    return this.benefits().filter(
      (benefit) => benefit.tierMinPoints === null || benefit.tierMinPoints <= clientPoints,
    ).length;
  });

  constructor() {
    // Lo que se muestra arriba (éxito o error del canje) puede quedar fuera de la vista: se lleva el foco ahí.
    afterRenderEffect(() => {
      if (this.redeemed() || this.redeemError()) {
        this.feedback()?.nativeElement.focus();
      }
    });
  }

  ngOnInit(): void {
    this.loadCafes();
    this.loadClientTier();
    this.loadBenefits();
  }

  /** Con `quiet` se refresca la lista sin cambiarla por el esqueleto, para no perder el lugar al terminar un canje. */
  loadBenefits(quiet = false): void {
    if (!quiet) {
      this.isLoading.set(true);
    }
    this.hasError.set(false);

    this.benefitService.getAvailable(this.selectedCafeId(), this.selectedType()).subscribe({
      next: (data) => {
        this.benefits.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(!quiet);
        this.isLoading.set(false);
      },
    });
  }

  phaseOf(benefitId: string): BenefitRedeemPhase {
    const target = this.redeemTarget();
    return target?.id === benefitId ? target.phase : 'idle';
  }

  requestRedeem(benefitId: string): void {
    if (this.redeemTarget()?.phase === 'redeeming') {
      return;
    }
    this.redeemed.set(null);
    this.redeemError.set(null);
    this.redeemTarget.set({ id: benefitId, phase: 'confirming' });
  }

  cancelRedeem(): void {
    if (this.redeemTarget()?.phase === 'confirming') {
      this.redeemTarget.set(null);
    }
  }

  confirmRedeem(): void {
    const target = this.redeemTarget();
    if (target?.phase !== 'confirming') {
      return;
    }
    this.redeemTarget.set({ id: target.id, phase: 'redeeming' });
    this.profileRepository.redeemBenefit(target.id).subscribe({
      next: (redeemed) => {
        this.redeemTarget.set(null);
        this.redeemed.set(redeemed);
        this.refreshAfterRedeem();
      },
      error: (error: unknown) => {
        this.redeemTarget.set(null);
        this.redeemError.set(toRedeemErrorMessage(error));
        this.refreshAfterRedeem();
      },
    });
  }

  dismissFeedback(): void {
    this.redeemed.set(null);
    this.redeemError.set(null);
  }

  // Los puntos del cliente y el cupo del beneficio cambian con el canje, y un rechazo puede deberse a que ya cambiaron.
  private refreshAfterRedeem(): void {
    this.loadClientTier();
    this.loadBenefits(true);
  }

  selectCafe(cafeId: string): void {
    this.selectedCafeId.set(cafeId);
    this.loadBenefits();
  }

  selectType(type: BenefitFormatCode | ''): void {
    this.selectedType.set(type);
    this.loadBenefits();
  }

  clearFilters(): void {
    this.selectedCafeId.set('');
    this.selectedType.set('');
    this.loadBenefits();
  }

  private loadCafes(): void {
    this.cafeService.getAll().subscribe({
      next: (data) => this.cafes.set(data),
    });
  }

  private loadClientTier(): void {
    this.profileRepository.getTierDetail().subscribe({
      next: (detail) => {
        this.clientTierPoints.set(detail.currentTierThreshold);
        this.availablePoints.set(detail.availablePoints);
      },
    });
  }
}
