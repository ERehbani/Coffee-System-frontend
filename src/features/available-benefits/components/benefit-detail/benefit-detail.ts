import { DatePipe, DecimalPipe, NgOptimizedImage, formatNumber } from '@angular/common';
import {
  Component,
  ElementRef,
  Injector,
  LOCALE_ID,
  OnInit,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { ProfileRepository } from '../../../profile/services/profile.repository';
import { toTierBadgeClass, toTierLabel } from '../../../profile/utils/loyalty-tier';
import { toLoyaltyTier } from '../../../profile/utils/profile.mapper';
import { toRedeemErrorMessage } from '../../../profile/utils/redeem-error';
import { AvailableBenefit } from '../../model/available-benefit.model';
import { AvailableBenefitService } from '../../services/available-benefit.service';
import { isBenefitUnlocked } from '../../utils/benefit-access';

export type BenefitRedeemPhase = 'idle' | 'confirming' | 'redeeming';

const SOLD_OUT_REASON = 'Este beneficio ya no tiene canjes disponibles.';

@Component({
  selector: 'app-benefit-detail',
  imports: [DatePipe, DecimalPipe, NgOptimizedImage, RouterLink, Icon],
  templateUrl: './benefit-detail.html',
  host: { class: 'block' },
})
export class BenefitDetail implements OnInit {
  private readonly injector = inject(Injector);
  private readonly locale = inject(LOCALE_ID);
  private readonly route = inject(ActivatedRoute);
  private readonly benefitService = inject(AvailableBenefitService);
  private readonly profileRepository = inject(ProfileRepository);
  private readonly toast = inject(ToastService);

  benefit = signal<AvailableBenefit | null>(null);
  clientTierPoints = signal<number | null>(null);
  availablePoints = signal<number | null>(null);
  isLoading = signal(true);
  hasError = signal(false);
  phase = signal<BenefitRedeemPhase>('idle');

  private readonly redeemButton = viewChild<ElementRef<HTMLButtonElement>>('redeemButton');
  private readonly confirmButton = viewChild<ElementRef<HTMLButtonElement>>('confirmButton');

  constructor() {
    afterRenderEffect(() => {
      if (this.phase() === 'confirming') {
        this.confirmButton()?.nativeElement.focus();
      }
    });
  }

  protected readonly cafeLabel = computed(() => {
    const benefit = this.benefit();
    return benefit?.global ? 'Todas las cafeterías' : (benefit?.cafeEntity ?? 'Cafetería');
  });

  protected readonly tierLabel = computed(() => {
    const tierName = this.benefit()?.tierName;
    return tierName ? toTierLabel(toLoyaltyTier(tierName)) : null;
  });

  protected readonly tierBadgeClass = computed(() => {
    const tierName = this.benefit()?.tierName;
    return toTierBadgeClass(tierName ? toLoyaltyTier(tierName) : '');
  });

  private readonly isUnlocked = computed(() => {
    const benefit = this.benefit();
    return !!benefit && isBenefitUnlocked(benefit, this.clientTierPoints());
  });

  // Only a benefit the client can pay for now has an action; otherwise the button stays disabled and says what is missing.
  protected readonly canRedeem = computed(() => {
    const benefit = this.benefit();
    const points = this.availablePoints();
    return !!benefit && !benefit.soldOut && this.isUnlocked() && points !== null && points >= benefit.pointsCost;
  });

  protected readonly blockedReason = computed(() => {
    const benefit = this.benefit();
    if (!benefit) {
      return null;
    }
    if (benefit.soldOut) {
      return SOLD_OUT_REASON;
    }
    if (this.clientTierPoints() !== null && !this.isUnlocked()) {
      const tierName = benefit.tierName;
      return tierName
        ? `Disponible desde ${tierName.charAt(0).toUpperCase()}${tierName.slice(1).toLowerCase()}`
        : 'Necesitás un nivel superior';
    }
    const points = this.availablePoints();
    return points !== null && benefit.pointsCost > points
      ? `Te faltan ${formatNumber(benefit.pointsCost - points, this.locale)} pts`
      : null;
  });

  ngOnInit(): void {
    this.loadClientTier();
    const externalId = this.route.snapshot.paramMap.get('id');
    const loaded = externalId ? this.benefitService.findLoaded(externalId) : undefined;
    if (loaded) {
      this.benefit.set(loaded);
      this.isLoading.set(false);
      return;
    }
    this.loadBenefit();
  }

  loadBenefit(quiet = false): void {
    const externalId = this.route.snapshot.paramMap.get('id');
    if (!externalId) {
      this.isLoading.set(false);
      return;
    }
    if (!quiet) {
      this.isLoading.set(true);
    }
    this.hasError.set(false);

    this.benefitService.getById(externalId).subscribe({
      next: (data) => {
        this.benefit.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        // A failed quiet refresh keeps the benefit already on screen.
        this.hasError.set(!quiet);
        this.isLoading.set(false);
      },
    });
  }

  requestRedeem(): void {
    if (this.phase() === 'redeeming') {
      return;
    }
    this.phase.set('confirming');
  }

  cancelRedeem(): void {
    if (this.phase() === 'confirming') {
      this.phase.set('idle');
      afterNextRender(() => this.redeemButton()?.nativeElement.focus(), { injector: this.injector });
    }
  }

  confirmRedeem(): void {
    const benefit = this.benefit();
    if (this.phase() !== 'confirming' || !benefit) {
      return;
    }
    this.phase.set('redeeming');
    this.profileRepository.redeemBenefit(benefit.externalId).subscribe({
      next: (redeemed) => {
        this.phase.set('idle');
        this.toast.success(
          `¡Canjeaste ${redeemed.benefitName} por ${redeemed.usedPoints.toLocaleString('es-AR')} pts! Tu cupón ya está en Mis cupones.`,
          { label: 'Ver mis cupones', route: '/profile/coupons' },
        );
        this.refreshAfterRedeem();
      },
      error: (error: unknown) => {
        this.phase.set('idle');
        this.toast.error(toRedeemErrorMessage(error));
        this.refreshAfterRedeem();
      },
    });
  }

  // Los puntos del cliente y el cupo del beneficio cambian con el canje, y un rechazo puede deberse a que ya cambiaron.
  private refreshAfterRedeem(): void {
    this.loadClientTier();
    this.loadBenefit(true);
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
